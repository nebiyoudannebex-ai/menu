import React, { useState, useEffect } from 'react';
import { 
  Restaurant, 
  UploadedScanPage, 
  OCRExtractedData, 
  MenuTheme 
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { MenuUploader } from './components/Wizard/MenuUploader.tsx';
import { OCRReviewEditor } from './components/Wizard/OCRReviewEditor.tsx';
import { ThemeCustomizer } from './components/Wizard/ThemeCustomizer.tsx';
import { MenuManualEditor } from './components/Wizard/MenuManualEditor.tsx';
import { LiveMenuRenderer } from './components/PublicMenu/LiveMenuRenderer.tsx';
import { QRCodeSuite } from './components/Wizard/QRCodeSuite.tsx';
import { ApiDocumentation } from './components/ApiDocs/ApiDocumentation.tsx';
import { DEFAULT_THEME, THEME_PRESETS } from './utils/themePresets.ts';
import { SAMPLE_MENUS } from './utils/sampleMenus.ts';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'upload' | 'review' | 'theme' | 'editor' | 'public-menu' | 'qr' | 'api-docs'>('upload');
  
  // Always scroll to top when changing views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);
  
  // Wizard state
  const [uploadedPages, setUploadedPages] = useState<UploadedScanPage[]>([]);
  const [extractedData, setExtractedData] = useState<OCRExtractedData | null>(null);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);

  // Check URL on load for public menu path (e.g. /menu/addis-habesha)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/menu/')) {
      const slug = path.replace('/menu/', '').trim();
      fetchRestaurantBySlug(slug);
    } else {
      // Load or seed default restaurant for instant exploration
      fetchDefaultRestaurant();
    }
  }, []);

  const fetchDefaultRestaurant = async () => {
    try {
      const res = await fetch('/api/v1/restaurants');
      const data = await res.json();
      if (data.restaurants && data.restaurants.length > 0) {
        const firstSlug = data.restaurants[0].slug;
        const resDetail = await fetch(`/api/v1/menus/${firstSlug}`);
        const detailData = await resDetail.json();
        if (detailData.data) {
          setActiveRestaurant(detailData.data);
        }
      }
    } catch (e) {
      console.log('Error fetching default restaurant:', e);
    }
  };

  const fetchRestaurantBySlug = async (slug: string) => {
    try {
      const res = await fetch(`/api/v1/menus/${slug}`);
      const data = await res.json();
      if (data.data) {
        setActiveRestaurant(data.data);
        setCurrentView('public-menu');
      }
    } catch (e) {
      console.error('Failed to load menu by slug:', e);
    }
  };

  // Step 1 Finish: OCR Scan Complete
  const handleScanComplete = (pages: UploadedScanPage[], data: OCRExtractedData) => {
    setUploadedPages(pages);
    setExtractedData(data);
    setCurrentView('review');
  };

  // Step 2 Finish: OCR Review and Price Confirmation
  const handleOCRReviewConfirm = async (verifiedData: OCRExtractedData, targetView: 'theme' | 'public-menu' | 'editor' = 'theme') => {
    setExtractedData(verifiedData);

    // Form initial restaurant object
    const restId = activeRestaurant?.id || 'rest-' + Math.random().toString(36).substring(2, 9);
    const slug = verifiedData.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Adopt physical menu font, colors, background tone, and styling
    const presetKey = verifiedData.suggestedTheme || 'ethiopian-cultural';
    const basePreset = THEME_PRESETS[presetKey] || DEFAULT_THEME;
    const detected = verifiedData.detectedThemeStyle;

    const initialTheme: MenuTheme = {
      id: 'theme-' + restId,
      restaurantId: restId,
      themePreset: presetKey,
      primaryColor: detected?.primaryColor || basePreset.primaryColor || '#B45309',
      secondaryColor: detected?.secondaryColor || basePreset.secondaryColor || '#15803D',
      backgroundColor: detected?.backgroundColor || basePreset.backgroundColor || '#FAF6EF',
      textColor: detected?.textColor || basePreset.textColor || '#292524',
      cardBgColor: detected?.cardBgColor || basePreset.cardBgColor || '#FFFFFF',
      accentColor: detected?.accentColor || basePreset.accentColor || '#D97706',
      fontHeading: detected?.fontHeading || basePreset.fontHeading || 'Playfair Display, Georgia, serif',
      fontBody: detected?.fontBody || basePreset.fontBody || 'Plus Jakarta Sans, sans-serif',
      borderRadius: (detected?.borderRadius as any) || basePreset.borderRadius || 'md',
      layoutStyle: detected?.layoutStyle || basePreset.layoutStyle || 'grid-cards',
      showImages: detected?.showImages !== undefined ? detected.showImages : true,
      enableBorders: detected?.enableBorders !== undefined ? detected.enableBorders : true,
      moodDescription: detected?.moodDescription || ('description' in basePreset ? basePreset.description : basePreset.moodDescription) || 'Transferred directly from physical menu branding and color palette.'
    };

    const newRestaurant: Restaurant = {
      id: restId,
      name: verifiedData.restaurantName,
      slug: slug || 'my-restaurant-menu',
      tagline: verifiedData.tagline || '',
      cuisineType: verifiedData.cuisineType || 'Dining & Cafe',
      currency: verifiedData.currency || 'ETB',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'am'],
      theme: initialTheme,
      isPublished: true,
      categories: verifiedData.categories.map((c, cIdx) => ({
        id: `cat-${cIdx + 1}`,
        restaurantId: restId,
        name: c.name,
        amharicName: c.amharicName || '',
        sortOrder: cIdx + 1,
        items: c.items.map((it, itIdx) => ({
          id: `item-${cIdx + 1}-${itIdx + 1}`,
          categoryId: `cat-${cIdx + 1}`,
          restaurantId: restId,
          name: it.name,
          amharicName: it.amharicName || '',
          price: it.price,
          description: it.description,
          imageUrl: it.imageUrl,
          dietaryTags: it.dietaryTags || [],
          isAvailable: true,
          sortOrder: itIdx + 1
        }))
      }))
    };

    setActiveRestaurant(newRestaurant);

    // Auto-save to backend
    try {
      await fetch('/api/restaurant/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: newRestaurant })
      });
    } catch (e) {
      console.error('Failed to auto-save restaurant:', e);
    }

    setCurrentView(targetView);
  };

  // Step 3 Finish: Theme selection
  const handleThemeUpdate = (updatedTheme: MenuTheme) => {
    if (activeRestaurant) {
      setActiveRestaurant({ ...activeRestaurant, theme: updatedTheme });
    }
  };

  const handleFinishTheme = async () => {
    if (activeRestaurant) {
      // Save restaurant to backend
      try {
        await fetch('/api/restaurant/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurant: activeRestaurant })
        });
      } catch (e) {
        console.error('Failed to auto-save restaurant:', e);
      }
      setCurrentView('public-menu');
    }
  };

  // Save manual edits
  const handleSaveRestaurant = async (updated: Restaurant) => {
    setActiveRestaurant(updated);
    try {
      await fetch('/api/restaurant/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: updated })
      });
    } catch (e) {
      console.error('Failed to save restaurant:', e);
    }
  };

  // Start fresh blank menu (No demo data)
  const handleStartBlankMenu = async () => {
    try {
      const res = await fetch('/api/restaurant/blank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My New Restaurant',
          cuisineType: 'Dining & Cafe',
          currency: 'ETB'
        })
      });
      const resData = await res.json();
      if (resData.restaurant) {
        setActiveRestaurant(resData.restaurant);
        setCurrentView('editor');
        return;
      }
    } catch (e) {
      console.log('Error creating blank restaurant on server, fallback local:', e);
    }

    const restId = 'rest-' + Math.random().toString(36).substring(2, 9);
    const blank: Restaurant = {
      id: restId,
      name: 'My New Restaurant',
      slug: 'my-restaurant-' + Math.floor(Math.random() * 900 + 100),
      tagline: 'Fresh & Handcrafted Specialties',
      cuisineType: 'Dining & Cafe',
      currency: 'ETB',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'am'],
      theme: DEFAULT_THEME,
      isPublished: true,
      categories: []
    };
    setActiveRestaurant(blank);
    setCurrentView('editor');
  };

  return (
    <div className="min-h-screen bg-[#F9FAF8] text-[#1A1A1A] flex flex-col selection:bg-orange-200 selection:text-orange-950 font-sans">
      
      {/* App Header (Hidden when viewing standalone public menu on mobile) */}
      {currentView !== 'public-menu' && (
        <Header
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v as any)}
          onStartBlank={handleStartBlankMenu}
          restaurantName={activeRestaurant?.name}
          restaurantSlug={activeRestaurant?.slug}
        />
      )}

      {/* When in public menu view, provide a floating Admin Control bar so the owner can jump back */}
      {currentView === 'public-menu' && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
          <button
            onClick={() => setCurrentView('editor')}
            className="px-3.5 py-1.5 bg-[#1A1A1A]/90 backdrop-blur-md hover:bg-[#1A1A1A] text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-white/20"
          >
            <span>← Admin Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('api-docs')}
            className="px-3.5 py-1.5 bg-indigo-600/95 backdrop-blur-md hover:bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-white/20"
            title="Get embed and webview code for your app"
          >
            <span>Embed in App</span>
          </button>
          <button
            onClick={() => setCurrentView('qr')}
            className="px-3.5 py-1.5 bg-orange-600/95 backdrop-blur-md hover:bg-orange-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-white/20"
          >
            <span>QR & Print</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: UPLOAD & OCR SCAN */}
        {currentView === 'upload' && (
          <MenuUploader
            onScanComplete={handleScanComplete}
            onStartBlank={handleStartBlankMenu}
          />
        )}

        {/* VIEW 2: OCR REVIEW & PRICE VERIFICATION */}
        {currentView === 'review' && extractedData && (
          <OCRReviewEditor
            pages={uploadedPages}
            extractedData={extractedData}
            onConfirm={handleOCRReviewConfirm}
            onBack={() => setCurrentView('upload')}
          />
        )}

        {/* VIEW 3: AI THEME CUSTOMIZER */}
        {currentView === 'theme' && activeRestaurant && (
          <ThemeCustomizer
            theme={activeRestaurant.theme}
            restaurant={activeRestaurant}
            onUpdateTheme={handleThemeUpdate}
            onFinish={handleFinishTheme}
            onBack={() => setCurrentView('review')}
          />
        )}

        {/* VIEW 4: MANUAL MENU MANAGEMENT */}
        {currentView === 'editor' && activeRestaurant && (
          <MenuManualEditor
            restaurant={activeRestaurant}
            onSaveRestaurant={handleSaveRestaurant}
            onOpenQR={() => setCurrentView('qr')}
            onOpenPreview={() => setCurrentView('public-menu')}
          />
        )}

        {/* VIEW 5: LIVE PUBLIC DIGITAL MENU */}
        {currentView === 'public-menu' && activeRestaurant && (
          <LiveMenuRenderer
            restaurant={activeRestaurant}
            isStandalone={false}
          />
        )}

        {/* VIEW 6: QR CODE & TABLE TENT SUITE */}
        {currentView === 'qr' && activeRestaurant && (
          <QRCodeSuite
            restaurant={activeRestaurant}
            onBack={() => setCurrentView('editor')}
          />
        )}

        {/* VIEW 7: API DOCUMENTATION & LIVE SANDBOX */}
        {currentView === 'api-docs' && (
          <ApiDocumentation currentRestaurant={activeRestaurant} />
        )}

      </main>

      {/* Global Footer (shown in admin views) */}
      {currentView !== 'public-menu' && (
        <footer className="border-t border-[#E5E7EB] bg-white py-6 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>AI Digital Menu Generator • Ethiopian & Global Multilingual Support</p>
            <div className="flex items-center gap-4 text-gray-600 font-medium">
              <button onClick={() => setCurrentView('api-docs')} className="hover:text-orange-600">
                Developer REST API
              </button>
              <button onClick={() => setCurrentView('upload')} className="hover:text-orange-600">
                New Menu Scan
              </button>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
