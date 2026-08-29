import React, { useState } from 'react';
import { Restaurant } from '../../types/index.ts';
import { 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Code, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  CheckCircle2,
  Globe,
  Sliders
} from 'lucide-react';

interface EmbedStudioProps {
  currentRestaurant: Restaurant | null;
}

export const EmbedStudio: React.FC<EmbedStudioProps> = ({ currentRestaurant }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    'html' | 'react' | 'flutter' | 'react-native' | 'swift' | 'kotlin' | 'wordpress'
  >('html');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  
  // Customization controls
  const [embedHeight, setEmbedHeight] = useState<string>('850px');
  const [embedBorderRadius, setEmbedBorderRadius] = useState<string>('16px');
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [allowFullscreen, setAllowFullscreen] = useState<boolean>(true);

  const baseUrl = window.location.origin;
  const slug = currentRestaurant?.slug || 'addis-habesha';
  const restaurantName = currentRestaurant?.name || 'Lalibela Modern Kitchen';
  const liveMenuUrl = `${baseUrl}/menu/${slug}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Code Templates
  const htmlSnippet = `<!-- MenuAI Interactive Menu Embed -->
<div style="width: 100%; max-width: 1200px; margin: 0 auto; height: ${embedHeight}; border-radius: ${embedBorderRadius}; overflow: hidden; ${showBorder ? 'border: 1px solid #E5E7EB; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);' : ''}">
  <iframe
    src="${liveMenuUrl}"
    width="100%"
    height="100%"
    style="border: none; display: block;"
    allow="clipboard-write${allowFullscreen ? '; fullscreen' : ''}"
    loading="lazy"
    title="${restaurantName} Digital Menu"
  ></iframe>
</div>`;

  const reactSnippet = `import React from 'react';

interface MenuEmbedProps {
  slug?: string;
  height?: string;
  className?: string;
}

/**
 * Restaurant Digital Menu Webview Component
 * Auto-syncs live dishes, prices, photos, and translations in real-time.
 */
export const RestaurantMenuEmbed: React.FC<MenuEmbedProps> = ({
  slug = '${slug}',
  height = '${embedHeight}',
  className = ''
}) => {
  const menuUrl = \`${baseUrl}/menu/\${slug}\`;

  return (
    <div 
      className={\`w-full max-w-5xl mx-auto overflow-hidden rounded-2xl \${
        ${showBorder} ? 'border border-gray-200 shadow-lg shadow-black/5' : ''
      } \${className}\`}
      style={{ height }}
    >
      <iframe
        src={menuUrl}
        width="100%"
        height="100%"
        className="w-full h-full border-0 block"
        allow="clipboard-write${allowFullscreen ? '; fullscreen' : ''}"
        loading="lazy"
        title="Live Restaurant Menu"
      />
    </div>
  );
};

export default RestaurantMenuEmbed;`;

  const flutterSnippet = `import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Complete Flutter Webview Screen for ${restaurantName}
/// Make sure to add 'webview_flutter: ^4.7.0' in your pubspec.yaml
class RestaurantMenuScreen extends StatefulWidget {
  final String menuSlug;
  const RestaurantMenuScreen({
    Key? key, 
    this.menuSlug = '${slug}'
  }) : super(key: key);

  @override
  State<RestaurantMenuScreen> createState() => _RestaurantMenuScreenState();
}

class _RestaurantMenuScreenState extends State<RestaurantMenuScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFAF6EF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse('${baseUrl}/menu/\${widget.menuSlug}'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF6EF),
      appBar: AppBar(
        title: const Text(
          '${restaurantName}',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: const Color(0xFFC2410C),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _controller.reload(),
            tooltip: 'Refresh Menu',
          ),
        ],
      ),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFC2410C),
                ),
              ),
          ],
        ),
      ),
    );
  }
}`;

  const reactNativeSnippet = `import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * React Native & Expo Menu Screen Component
 * Install dependency: npx expo install react-native-webview
 * or: npm install react-native-webview
 */
export default function MenuScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />
      <WebView
        source={{ uri: '${liveMenuUrl}' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C2410C" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6EF',
  },
});`;

  const wordpressSnippet = `<!-- WordPress / Webflow / Shopify / Wix / Squarespace Embed Code -->
<div class="menu-ai-embed-wrapper" style="width: 100%; max-width: 1200px; margin: 20px auto; min-height: ${embedHeight};">
  <iframe
    src="${liveMenuUrl}"
    style="width: 100%; height: ${embedHeight}; border: none; border-radius: ${embedBorderRadius}; ${showBorder ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.06);' : ''}"
    allow="clipboard-write"
    loading="lazy"
    title="${restaurantName} Menu"
  ></iframe>
</div>`;

  const swiftSnippet = `import UIKit
import WebKit

class MenuWebViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    var activityIndicator: UIActivityIndicatorView!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "${restaurantName}"
        view.backgroundColor = UIColor(red: 0.98, green: 0.96, blue: 0.94, alpha: 1.0)
        
        let webConfiguration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        if let url = URL(string: "${liveMenuUrl}") {
            webView.load(URLRequest(url: url))
        }
    }
}`;

  const kotlinSnippet = `package com.example.restaurantmenu

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MenuActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        
        webView.loadUrl("${liveMenuUrl}")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`;

  const currentSnippet = {
    html: htmlSnippet,
    react: reactSnippet,
    flutter: flutterSnippet,
    'react-native': reactNativeSnippet,
    wordpress: wordpressSnippet,
    swift: swiftSnippet,
    kotlin: kotlinSnippet
  }[selectedPlatform];

  const currentDownloadMeta = {
    html: { filename: `menu-${slug}.html`, mime: 'text/html' },
    react: { filename: `RestaurantMenuEmbed.tsx`, mime: 'text/typescript' },
    flutter: { filename: `restaurant_menu_screen.dart`, mime: 'text/plain' },
    'react-native': { filename: `MenuScreen.tsx`, mime: 'text/typescript' },
    wordpress: { filename: `wordpress-menu-snippet.html`, mime: 'text/html' },
    swift: { filename: `MenuWebViewController.swift`, mime: 'text/plain' },
    kotlin: { filename: `MenuActivity.kt`, mime: 'text/plain' }
  }[selectedPlatform];

  return (
    <div id="embed-studio-container" className="space-y-8">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-950/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Method 2: Zero-Code Real-Time Embed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Embed Interactive Menu Inside Your Mobile App or Website
            </h2>
            <p className="text-orange-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Drop your live menu into your Flutter app, React Native app, iOS/Android codebase, or WordPress website. Any updates you make to dishes, prices, or themes sync instantly with zero app-store redeployments.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Real-Time Instant Price Sync</span>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Multilingual (Amharic & English)</span>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Interactive Filter & Search Tray</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Code Generator + Interactive Live Device Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Platform Selector & Code Exporter */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Framework / Tech Stack Selector */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-gray-800 tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-orange-600" />
                <span>1. Select Your App Framework</span>
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">Click to generate complete code</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'html' as const, label: 'HTML / iframe', icon: '🌐', tag: 'Websites' },
                { id: 'react' as const, label: 'React / Next.js', icon: '⚛️', tag: 'Component' },
                { id: 'flutter' as const, label: 'Flutter (Dart)', icon: '📱', tag: 'iOS & Android' },
                { id: 'react-native' as const, label: 'React Native', icon: '📱', tag: 'Expo / CLI' },
                { id: 'wordpress' as const, label: 'WordPress / CMS', icon: '📝', tag: 'No-Code' },
                { id: 'swift' as const, label: 'Swift (iOS)', icon: '🍏', tag: 'WKWebView' },
                { id: 'kotlin' as const, label: 'Kotlin (Android)', icon: '🤖', tag: 'WebView' },
              ].map((plat) => {
                const isSelected = selectedPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/70 shadow-xs ring-1 ring-orange-600'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{plat.icon}</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">{plat.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{plat.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Customization Settings */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Height</label>
                <select
                  value={embedHeight}
                  onChange={(e) => setEmbedHeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-orange-500"
                >
                  <option value="100%">100% (Fill Container)</option>
                  <option value="100vh">100vh (Full Screen)</option>
                  <option value="850px">850px (Standard)</option>
                  <option value="650px">650px (Compact)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Corner Radius</label>
                <select
                  value={embedBorderRadius}
                  onChange={(e) => setEmbedBorderRadius(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-orange-500"
                >
                  <option value="0px">Square (0px)</option>
                  <option value="12px">Rounded (12px)</option>
                  <option value="16px">Large (16px)</option>
                  <option value="24px">Extra Large (24px)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Styling</label>
                <button
                  type="button"
                  onClick={() => setShowBorder((prev) => !prev)}
                  className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                    showBorder ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span>Card Border & Shadow</span>
                  <span className="text-[10px] font-bold">{showBorder ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Code Display Box */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-md border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wide">
                  Ready-to-Use Code ({selectedPlatform.toUpperCase()})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadFile(currentDownloadMeta.filename, currentSnippet, currentDownloadMeta.mime)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-all border border-gray-700"
                  title="Download complete code file"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download File</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(currentSnippet, 'code-snippet')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-all"
                >
                  {copiedId === 'code-snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="text-xs font-mono bg-black/60 p-4 rounded-xl overflow-x-auto text-emerald-300 leading-relaxed max-h-[420px] scrollbar-thin">
                {currentSnippet}
              </pre>
            </div>

            {/* Quick installation / dependency reminder */}
            {selectedPlatform === 'flutter' && (
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-800/40 text-xs text-orange-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Flutter Quick Tip:</strong> Run <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">flutter pub add webview_flutter</code> in your terminal before building.
                </span>
              </div>
            )}

            {selectedPlatform === 'react-native' && (
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-800/40 text-xs text-orange-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>React Native Quick Tip:</strong> Run <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">npx expo install react-native-webview</code> for Expo or <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">npm install react-native-webview</code> for bare React Native.
                </span>
              </div>
            )}
          </div>

          {/* Direct Live URL card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                Direct Public Menu Web URL
              </span>
              <span className="text-xs font-mono font-bold text-gray-900 break-all select-all">
                {liveMenuUrl}
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(liveMenuUrl, 'direct-url')}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                {copiedId === 'direct-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy URL</span>
              </button>
              
              <a
                href={liveMenuUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-orange-500"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Live Device Simulator */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-gray-900">Interactive Embed Preview</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                  previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Mobile Phone View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                  previewDevice === 'tablet' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                  previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Desktop Browser View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>
          </div>

          {/* Simulator Container */}
          <div className="bg-gray-100 border border-gray-200 rounded-3xl p-4 flex justify-center items-center min-h-[640px] overflow-hidden">
            
            {previewDevice === 'mobile' && (
              <div className="w-[340px] h-[640px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-gray-800 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Speaker & camera notch */}
                <div className="w-24 h-4 bg-gray-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-800 mr-2"></div>
                  <div className="w-8 h-1.5 rounded-full bg-gray-800"></div>
                </div>

                <div className="flex-1 bg-[#FAF6EF] rounded-[28px] overflow-hidden relative">
                  <iframe
                    src={liveMenuUrl}
                    className="w-full h-full border-0"
                    title="Live Mobile Embed Simulator"
                  />
                </div>

                {/* Home indicator */}
                <div className="w-28 h-1 bg-gray-700 rounded-full mx-auto mt-2"></div>
              </div>
            )}

            {previewDevice === 'tablet' && (
              <div className="w-full max-w-[480px] h-[640px] bg-black rounded-[32px] p-3 shadow-2xl border-4 border-gray-800 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                <div className="w-3 h-3 rounded-full bg-gray-800 mx-auto mb-2"></div>
                <div className="flex-1 bg-[#FAF6EF] rounded-[22px] overflow-hidden relative">
                  <iframe
                    src={liveMenuUrl}
                    className="w-full h-full border-0"
                    title="Live Tablet Embed Simulator"
                  />
                </div>
              </div>
            )}

            {previewDevice === 'desktop' && (
              <div className="w-full h-[640px] bg-white rounded-2xl shadow-xl border border-gray-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Browser address bar */}
                <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 bg-white px-2.5 py-1 rounded-md text-[10px] text-gray-500 font-mono truncate border border-gray-200">
                    https://your-restaurant-app.com/menu
                  </div>
                </div>
                <div className="flex-1 bg-[#FAF6EF] overflow-hidden">
                  <iframe
                    src={liveMenuUrl}
                    className="w-full h-full border-0"
                    title="Live Desktop Embed Simulator"
                  />
                </div>
              </div>
            )}

          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full Cross-Origin Support Enabled</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              All menu views support unrestricted iframe embedding and responsive mobile gestures across iOS Safari, Chrome, Firefox, and WebViews.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
