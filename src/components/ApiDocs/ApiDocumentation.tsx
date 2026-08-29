import React, { useState, useEffect } from 'react';
import { Restaurant, ApiKeyRecord } from '../../types/index.ts';
import { 
  Code2, 
  Key, 
  Copy, 
  Check, 
  Play, 
  Terminal, 
  Sparkles, 
  ExternalLink, 
  Layers,
  CheckCircle2,
  FileJson,
  Server,
  Smartphone,
  Globe,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  Zap,
  Activity,
  Network,
  RefreshCw
} from 'lucide-react';
import { EmbedStudio } from './EmbedStudio.tsx';

interface ApiDocumentationProps {
  currentRestaurant: Restaurant | null;
}

export const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ currentRestaurant }) => {
  const [activeTab, setActiveTab] = useState<'embed' | 'rest-api'>('rest-api');
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  
  // API Key Generator Form State
  const [keyForm, setKeyForm] = useState({
    websiteName: currentRestaurant?.name ? `${currentRestaurant.name} Web Server` : 'My External Web Server',
    websiteUrl: 'https://myrestaurant.com',
    serverAddress: '* (Any Host / IP)',
    environment: 'production' as 'production' | 'staging' | 'development',
    permissions: ['read:menu', 'read:items', 'read:categories', 'extract:ocr']
  });
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyGenerateSuccess, setKeyGenerateSuccess] = useState<string | null>(null);

  // Framework Integration Code Switcher
  const [targetServerLang, setTargetServerLang] = useState<'nodejs' | 'nextjs' | 'python' | 'php' | 'curl' | 'env'>('nodejs');

  // Live Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>('get-menu');
  const [selectedKeyForTest, setSelectedKeyForTest] = useState<string>('');
  const [sandboxResponse, setSandboxResponse] = useState<string>('');
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState<boolean>(false);
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('');
  const [itemDietaryFilter, setItemDietaryFilter] = useState<string>('');

  const baseUrl = window.location.origin;
  const slug = currentRestaurant?.slug || 'addis-habesha';

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/apikeys');
      const data = await res.json();
      if (data.keys && Array.isArray(data.keys)) {
        setApiKeys(data.keys);
        if (data.keys.length > 0 && !selectedKeyForTest) {
          setSelectedKeyForTest(data.keys[0].key);
        }
      }
    } catch (e) {
      console.error('Failed to load API keys:', e);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyForm.websiteName.trim()) return;

    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: currentRestaurant?.id || 'global',
          name: keyForm.websiteName,
          websiteName: keyForm.websiteName,
          websiteUrl: keyForm.websiteUrl,
          serverAddress: keyForm.serverAddress,
          environment: keyForm.environment,
          permissions: keyForm.permissions
        })
      });

      const data = await res.json();
      if (data.apiKey) {
        setApiKeys((prev) => [data.apiKey, ...prev]);
        setSelectedKeyForTest(data.apiKey.key);
        setKeyGenerateSuccess(data.apiKey.key);
        setTimeout(() => setKeyGenerateSuccess(null), 5000);
      }
    } catch (e) {
      console.error('Failed to generate real API key:', e);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke and delete this API key? External web servers using this key will no longer be authenticated.')) {
      return;
    }
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        if (selectedKeyForTest && apiKeys.find((k) => k.id === id)?.key === selectedKeyForTest) {
          setSelectedKeyForTest(apiKeys.find((k) => k.id !== id)?.key || '');
        }
      }
    } catch (e) {
      console.error('Failed to delete key:', e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const downloadEnvFile = (key: ApiKeyRecord) => {
    const content = `# ============================================================
# MenuAI Production Environment Configuration
# Generated for: ${key.websiteName || key.name}
# Target Server Address: ${key.serverAddress || 'All Hosts'}
# Website URL: ${key.websiteUrl || baseUrl}
# Environment: ${key.environment || 'production'}
# ============================================================

MENUAI_API_BASE_URL=${baseUrl}
MENUAI_API_KEY=${key.key}
MENUAI_MENU_SLUG=${slug}
MENUAI_ENVIRONMENT=${key.environment || 'production'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env.menuai.${key.environment || 'production'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run live test in sandbox
  const runLiveTest = async (overrideKey?: string, overrideEndpoint?: string) => {
    setIsLoadingSandbox(true);
    const testKey = overrideKey || selectedKeyForTest || apiKeys[0]?.key || '';
    const endpointType = overrideEndpoint || sandboxEndpoint;

    const startTime = performance.now();
    try {
      let url = `${baseUrl}/api/v1/menus/${slug}`;
      if (endpointType === 'get-items') {
        const queryParams = new URLSearchParams();
        if (itemCategoryFilter) queryParams.set('category', itemCategoryFilter);
        if (itemDietaryFilter) queryParams.set('dietary', itemDietaryFilter);
        url = `${baseUrl}/api/v1/menus/${slug}/items?${queryParams.toString()}`;
      } else if (endpointType === 'get-categories') {
        url = `${baseUrl}/api/v1/menus/${slug}/categories`;
      } else if (endpointType === 'list-restaurants') {
        url = `${baseUrl}/api/v1/restaurants`;
      } else if (endpointType === 'verify-key') {
        url = `${baseUrl}/api/v1/apikeys/verify`;
      } else if (endpointType === 'ping') {
        url = `${baseUrl}/api/v1/ping`;
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (testKey) {
        headers['x-api-key'] = testKey;
      }

      const res = await fetch(url, { headers });
      const elapsed = Math.round(performance.now() - startTime);
      setSandboxLatency(elapsed);
      setSandboxStatus(res.status);

      const json = await res.json();
      setSandboxResponse(JSON.stringify(json, null, 2));

      // Refresh key usage counters
      fetchKeys();
    } catch (e: any) {
      setSandboxStatus(500);
      setSandboxLatency(Math.round(performance.now() - startTime));
      setSandboxResponse(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsLoadingSandbox(false);
    }
  };

  const activeKeyString = selectedKeyForTest || apiKeys[0]?.key || 'mak_live_your_generated_api_key_here';

  // Server integration code generators
  const serverSnippets = {
    nodejs: `// =======================================================
// Node.js Express / TypeScript Server Integration
// Place in your external backend (e.g. server.ts or api.ts)
// =======================================================
import express from 'express';
import axios from 'axios';

const app = express();

// Your MenuAI Credentials
const MENUAI_CONFIG = {
  baseUrl: '${baseUrl}',
  apiKey: '${activeKeyString}',
  slug: '${slug}'
};

// 1. Fetch complete live menu
export async function getLiveMenu() {
  const response = await axios.get(
    \`\${MENUAI_CONFIG.baseUrl}/api/v1/menus/\${MENUAI_CONFIG.slug}\`,
    {
      headers: {
        'x-api-key': MENUAI_CONFIG.apiKey,
        'Accept': 'application/json'
      },
      timeout: 8000
    }
  );
  return response.data.data;
}

// 2. Proxy route for your web/mobile frontend
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await getLiveMenu();
    res.json({ success: true, menu });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`,

    nextjs: `// =======================================================
// Next.js App Router (App/API Route)
// Create file at: app/api/menu/route.ts
// =======================================================
import { NextResponse } from 'next/server';

const MENUAI_BASE_URL = process.env.MENUAI_API_BASE_URL || '${baseUrl}';
const MENUAI_API_KEY = process.env.MENUAI_API_KEY || '${activeKeyString}';
const MENU_SLUG = process.env.MENUAI_MENU_SLUG || '${slug}';

export async function GET(request: Request) {
  try {
    const res = await fetch(\`\${MENUAI_BASE_URL}/api/v1/menus/\${MENU_SLUG}\`, {
      headers: {
        'x-api-key': MENUAI_API_KEY,
        'Accept': 'application/json',
      },
      // Cache with Next.js Incremental Static Regeneration (revalidate every 60s)
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch menu' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

    python: `# =======================================================
# Python (FastAPI / Django / Flask) Integration
# =======================================================
import requests
import os

MENUAI_BASE_URL = os.getenv("MENUAI_API_BASE_URL", "${baseUrl}")
MENUAI_API_KEY = os.getenv("MENUAI_API_KEY", "${activeKeyString}")
MENU_SLUG = os.getenv("MENUAI_MENU_SLUG", "${slug}")

def fetch_restaurant_menu():
    """Fetches the latest categories and dishes with prices and Amharic labels."""
    url = f"{MENUAI_BASE_URL}/api/v1/menus/{MENU_SLUG}"
    headers = {
        "x-api-key": MENUAI_API_KEY,
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    payload = response.json()
    
    restaurant = payload["data"]["restaurant"]
    categories = payload["data"]["categories"]
    print(f"Loaded menu for {restaurant['name']} with {len(categories)} categories")
    return payload["data"]

# Example Execution
if __name__ == "__main__":
    menu = fetch_restaurant_menu()`,

    php: `<?php
// =======================================================
// PHP / WordPress Integration (functions.php or script)
// =======================================================

function get_menuai_live_menu() {
    $base_url = '${baseUrl}';
    $api_key  = '${activeKeyString}';
    $slug     = '${slug}';

    $url = $base_url . '/api/v1/menus/' . $slug;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'x-api-key: ' . $api_key,
        'Accept: application/json'
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code === 200) {
        $json = json_decode($response, true);
        return $json['data'];
    }
    return null;
}

$menu_data = get_menuai_live_menu();
?>`,

    curl: `# 1. Fetch complete menu with authentication
curl -X GET "${baseUrl}/api/v1/menus/${slug}" \\
  -H "Accept: application/json" \\
  -H "x-api-key: ${activeKeyString}"

# 2. Verify API Key validity & permissions
curl -X GET "${baseUrl}/api/v1/apikeys/verify" \\
  -H "x-api-key: ${activeKeyString}"

# 3. Filter menu items by dietary tag (e.g. vegan / fasting)
curl -X GET "${baseUrl}/api/v1/menus/${slug}/items?dietary=vegan" \\
  -H "x-api-key: ${activeKeyString}"`,

    env: `# ============================================================
# .env Configuration for your External Web Server
# Copy these lines into your server's .env file
# ============================================================
MENUAI_API_BASE_URL=${baseUrl}
MENUAI_API_KEY=${activeKeyString}
MENUAI_MENU_SLUG=${slug}
MENUAI_ENVIRONMENT=production`
  };

  return (
    <div id="api-documentation" className="max-w-6xl mx-auto py-6 sm:py-8 px-3 sm:px-6">
      
      {/* Integration Method Tabs */}
      <div className="mb-6 bg-white border border-[#E5E7EB] rounded-2xl p-2 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('rest-api')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rest-api'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Method 1: Live REST API & Web Server Keys</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === 'rest-api' ? 'bg-orange-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              Active v1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'embed'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Method 2: App & Web Embed Studio</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 pr-2 text-xs text-gray-500 font-medium">
          <span>Active Slug: <strong className="text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">{slug}</strong></span>
        </div>
      </div>

      {activeTab === 'embed' ? (
        <EmbedStudio currentRestaurant={currentRestaurant} />
      ) : (
        <>
          {/* Header Banner */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Production REST API & Key Generator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                Connect Live Menu to Your External Web Server
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Generate real production API keys bound to your website domain and server address. Fetch categories, dishes, prices (ETB), Amharic translations, and dietary tags from any external server or client.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono border border-stone-700">
                <span className="text-gray-400 block text-[10px] uppercase font-sans">API Base Endpoint</span>
                <span className="text-emerald-400 font-bold">{baseUrl}/api/v1</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: Real API Key Generator Card */}
          <div className="mb-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-600" />
                  <span>Generate Real Production API Key for External Web Server</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure your website name and host address to mint an authentic cryptographic API key.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Key Minting</span>
              </span>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Website / Client Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Website / Web Server Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={keyForm.websiteName}
                    onChange={(e) => setKeyForm({ ...keyForm, websiteName: e.target.value })}
                    placeholder="e.g. Nebiyou Food Delivery Web"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Identifies this key in server logs</span>
                </div>

                {/* Target Website URL / Domain */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Target Website URL / Domain
                  </label>
                  <input
                    type="text"
                    value={keyForm.websiteUrl}
                    onChange={(e) => setKeyForm({ ...keyForm, websiteUrl: e.target.value })}
                    placeholder="e.g. https://myrestaurant.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Origin website consuming the API</span>
                </div>

                {/* Server Address / IP */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Server Address / Host IP
                  </label>
                  <input
                    type="text"
                    value={keyForm.serverAddress}
                    onChange={(e) => setKeyForm({ ...keyForm, serverAddress: e.target.value })}
                    placeholder="e.g. api.myrestaurant.com or *"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Allowed host address or * for any</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-600">Environment:</span>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      checked={keyForm.environment === 'production'}
                      onChange={() => setKeyForm({ ...keyForm, environment: 'production' })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-gray-800">Production (mak_live_*)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      checked={keyForm.environment === 'staging'}
                      onChange={() => setKeyForm({ ...keyForm, environment: 'staging' })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-gray-800">Staging (mak_test_*)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingKey}
                  className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all"
                >
                  {isGeneratingKey ? (
                    <span>Minting Cryptographic Key...</span>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Generate Real Production API Key</span>
                    </>
                  )}
                </button>
              </div>

              {keyGenerateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Real API Key generated successfully and stored in the database!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(keyGenerateSuccess, 'just-generated')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                  >
                    {copiedText === 'just-generated' ? 'Copied!' : 'Copy Key'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* SECTION 2: Active API Keys Table */}
          <div className="mb-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Active Registered API Keys ({apiKeys.length})</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real keys ready to be inserted into your other web server or client app.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchKeys}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 text-xs flex items-center gap-1"
                title="Refresh API Keys"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No custom API keys generated yet. Use the generator above to create your first real key.
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((k) => {
                  const isRevealed = !!revealedKeys[k.id];
                  const displayKey = isRevealed 
                    ? k.key 
                    : k.key.substring(0, 12) + '••••••••••••••••••••' + k.key.substring(k.key.length - 4);
                  const isSelected = selectedKeyForTest === k.key;

                  return (
                    <div 
                      key={k.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-orange-400 bg-orange-50/30 ring-1 ring-orange-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-900">{k.websiteName || k.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              k.environment === 'production' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {k.environment || 'production'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                              Status: Active
                            </span>
                            {k.requestCount !== undefined && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-orange-500" />
                                {k.requestCount} requests
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono flex-wrap">
                            {k.websiteUrl && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-gray-400" />
                                {k.websiteUrl}
                              </span>
                            )}
                            {k.serverAddress && (
                              <span className="flex items-center gap-1">
                                <Network className="w-3 h-3 text-gray-400" />
                                Host: {k.serverAddress}
                              </span>
                            )}
                            <span className="text-gray-400">Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Key String Box */}
                          <div className="flex items-center gap-1 pt-1">
                            <code className="text-xs font-mono font-bold bg-stone-900 text-emerald-400 px-3 py-1 rounded-lg select-all">
                              {displayKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => toggleRevealKey(k.id)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                              title={isRevealed ? "Hide full key" : "Reveal full key"}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(k.key, k.id)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1 text-xs"
                              title="Copy API Key"
                            >
                              {copiedText === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{copiedText === k.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKeyForTest(k.key);
                              runLiveTest(k.key, 'verify-key');
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            title="Send an authenticated test call to verify this key"
                          >
                            <Play className="w-3 h-3 text-emerald-600" />
                            <span>Test Connection</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadEnvFile(k)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            title="Download .env file for your other web server"
                          >
                            <Download className="w-3 h-3" />
                            <span>.env</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Revoke / Delete API Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Server Integration Code Snippets */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Insert on Other Web Server Hub */}
              <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-xs border border-gray-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Insert on Your Other Web Server</span>
                  </div>

                  {/* Framework Selector */}
                  <div className="flex flex-wrap gap-1 bg-gray-800 p-0.5 rounded-lg">
                    {(
                      [
                        { id: 'nodejs', label: 'Node.js' },
                        { id: 'nextjs', label: 'Next.js' },
                        { id: 'python', label: 'Python' },
                        { id: 'php', label: 'PHP' },
                        { id: 'curl', label: 'cURL' },
                        { id: 'env', label: '.env File' }
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTargetServerLang(item.id)}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          targetServerLang === item.id
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <pre className="text-xs font-mono bg-black/60 p-4 rounded-xl overflow-x-auto text-emerald-300 leading-relaxed max-h-80 select-all">
                    {serverSnippets[targetServerLang]}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(serverSnippets[targetServerLang], 'server-code')}
                    className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 border border-gray-700 shadow-sm"
                    title="Copy server code"
                  >
                    {copiedText === 'server-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'server-code' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  All requests should include the <code className="text-orange-400 font-mono">x-api-key</code> header or <code className="text-orange-400 font-mono">Authorization: Bearer {'<key>'}</code>.
                </p>
              </div>

              {/* REST Endpoints Reference */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  <span>REST API v1 Endpoints Reference</span>
                </h3>

                {/* Endpoint 1: Get Menu */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-[#1A1A1A]">/api/v1/menus/{slug}</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Retrieves full digital menu: categories, dishes, prices in ETB/USD, Amharic translations, dietary tags, theme colors, and restaurant contact metadata.
                  </p>
                </div>

                {/* Endpoint 2: Filter Items */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-[#1A1A1A]">/api/v1/menus/{slug}/items?dietary=vegan&search=kitfo</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Fetch flat items list with query filters for category, dietary tags (vegan, spicy, fasting, halal), or keyword search.
                  </p>
                </div>

                {/* Endpoint 3: Categories */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-[#1A1A1A]">/api/v1/menus/{slug}/categories</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Returns category hierarchy with English, Amharic, and Oromo titles and item counts.
                  </p>
                </div>

                {/* Endpoint 4: Verify Key */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-[#1A1A1A]">/api/v1/apikeys/verify</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Verifies key validity, returns bound website name, allowed host, and granted permissions.
                  </p>
                </div>

                {/* Endpoint 5: AI OCR Ingestion */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-orange-600 text-white text-[10px] font-mono font-bold">POST</span>
                    <code className="text-xs font-mono font-bold text-[#1A1A1A]">/api/v1/menus/extract-ocr</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Programmatically pass base64 menu photos from your server to run AI OCR extraction.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Live API Sandbox */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600" />
                    <span>Live API Request Sandbox</span>
                  </h3>
                  {sandboxStatus && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sandboxStatus === 200 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      HTTP {sandboxStatus} ({sandboxLatency}ms)
                    </span>
                  )}
                </div>

                {/* Select Key to Test */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Authenticate With API Key
                  </label>
                  <select
                    value={selectedKeyForTest}
                    onChange={(e) => setSelectedKeyForTest(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-orange-500"
                  >
                    {apiKeys.map((k) => (
                      <option key={k.id} value={k.key}>
                        {k.websiteName || k.name} ({k.key.substring(0, 16)}...)
                      </option>
                    ))}
                    {apiKeys.length === 0 && <option value="">No custom key (Test public call)</option>}
                  </select>
                </div>

                {/* Select Endpoint */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Endpoint Call
                  </label>
                  <select
                    value={sandboxEndpoint}
                    onChange={(e) => setSandboxEndpoint(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="get-menu">GET /api/v1/menus/{slug}</option>
                    <option value="get-items">GET /api/v1/menus/{slug}/items</option>
                    <option value="get-categories">GET /api/v1/menus/{slug}/categories</option>
                    <option value="list-restaurants">GET /api/v1/restaurants</option>
                    <option value="verify-key">GET /api/v1/apikeys/verify</option>
                    <option value="ping">GET /api/v1/ping</option>
                  </select>
                </div>

                {/* Query filters if get-items */}
                {sandboxEndpoint === 'get-items' && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Dietary Tag</label>
                      <select 
                        value={itemDietaryFilter} 
                        onChange={(e) => setItemDietaryFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                      >
                        <option value="">All Dishes</option>
                        <option value="vegan">Vegan / Fasting</option>
                        <option value="spicy">Spicy (ቃሪያ/በርበሬ)</option>
                        <option value="halal">Halal</option>
                        <option value="chef-special">Chef's Special</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Category ID</label>
                      <input
                        type="text"
                        placeholder="e.g. cat-traditional"
                        value={itemCategoryFilter}
                        onChange={(e) => setItemCategoryFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => runLiveTest()}
                  disabled={isLoadingSandbox}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all"
                >
                  {isLoadingSandbox ? (
                    <span>Executing Request to Backend...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Send Authenticated Request</span>
                    </>
                  )}
                </button>

                {/* Live Response Viewer */}
                {sandboxResponse && (
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Response JSON:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(sandboxResponse, 'sandbox-resp')}
                        className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedText === 'sandbox-resp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText === 'sandbox-resp' ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono bg-[#1A1A1A] text-emerald-300 p-3.5 rounded-xl overflow-y-auto max-h-72 leading-snug border border-gray-800">
                      {sandboxResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};


