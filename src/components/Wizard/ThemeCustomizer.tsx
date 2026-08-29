import React, { useState } from 'react';
import { 
  MenuTheme, 
  ThemePreset, 
  LayoutStyle, 
  Restaurant 
} from '../../types/index.ts';
import { 
  THEME_PRESETS, 
  FONT_PAIRS 
} from '../../utils/themePresets.ts';
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layout, 
  Check, 
  ArrowRight, 
  Wand2, 
  RefreshCw,
  Smartphone,
  Eye,
  Sliders
} from 'lucide-react';

interface ThemeCustomizerProps {
  theme: MenuTheme;
  restaurant: Partial<Restaurant>;
  onUpdateTheme: (theme: MenuTheme) => void;
  onFinish: () => void;
  onBack: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  theme,
  restaurant,
  onUpdateTheme,
  onFinish,
  onBack
}) => {
  const [currentTheme, setCurrentTheme] = useState<MenuTheme>(theme);
  const [vibePrompt, setVibePrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'ai'>('presets');

  React.useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  // Switch preset
  const handleSelectPreset = (presetKey: ThemePreset) => {
    const config = THEME_PRESETS[presetKey];
    if (!config) return;

    const updated: MenuTheme = {
      ...currentTheme,
      themePreset: presetKey,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      cardBgColor: config.cardBgColor,
      accentColor: config.accentColor,
      fontHeading: config.fontHeading,
      fontBody: config.fontBody,
      borderRadius: config.borderRadius,
      layoutStyle: config.layoutStyle,
      showImages: config.showImages,
      enableBorders: config.enableBorders,
      moodDescription: config.description
    };
    setCurrentTheme(updated);
    onUpdateTheme(updated);
  };

  // Generate Theme with AI
  const handleGenerateAiTheme = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/theme/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurant.name || 'Gourmet Dining',
          cuisineType: restaurant.cuisineType || 'Contemporary',
          vibePrompt: vibePrompt || 'Unique tailored aesthetic for this dining concept'
        })
      });
      const data = await res.json();
      if (data.success && data.theme) {
        const generated = {
          ...currentTheme,
          ...data.theme,
          themePreset: 'custom-ai' as ThemePreset
        };
        setCurrentTheme(generated);
        onUpdateTheme(generated);
      }
    } catch (e) {
      console.error('Failed to generate AI theme:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const updateField = (field: keyof MenuTheme, val: any) => {
    const updated = { ...currentTheme, [field]: val };
    setCurrentTheme(updated);
    onUpdateTheme(updated);
  };

  return (
    <div id="theme-customizer" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[11px] font-bold mb-1 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Step 3: AI Brand & Digital Menu Styling</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Generate & Customize Unique Menu Design
          </h2>
          <p className="text-xs text-gray-500">
            Tailor colors, typography, card shapes, and responsive layouts to match your restaurant's atmosphere.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
          >
            Back
          </button>
          <button
            id="finish-theme-btn"
            type="button"
            onClick={onFinish}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-md shadow-orange-200 transition-all"
          >
            <span>Save & Open Public Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT CONFIGURATION PANEL */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Mood Generator Box */}
          <div className="bg-[#1A1A1A] text-white rounded-2xl p-5 shadow-xs border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-orange-400">Prompt AI Theme Generator</h3>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Describe the vibe (e.g. "Warm Addis Ababa cultural lounge with rich amber, woven textures and candlelit warmth"):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={vibePrompt}
                onChange={(e) => setVibePrompt(e.target.value)}
                placeholder="e.g. Traditional Ethiopian tea house with emerald and gold accents..."
                className="flex-1 px-3 py-2 text-xs bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
              />
              <button
                type="button"
                onClick={handleGenerateAiTheme}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Designing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Theme Presets Grid */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-600" />
                <span>Curated Restaurant Theme Archetypes</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
                const p = THEME_PRESETS[key];
                const isSelected = currentTheme.themePreset === key;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                        : 'border-[#E5E7EB] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-xs text-[#1A1A1A]">{p.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-6 h-6 rounded-md shadow-inner" style={{ backgroundColor: p.primaryColor }} title="Primary" />
                      <div className="w-6 h-6 rounded-md shadow-inner" style={{ backgroundColor: p.secondaryColor }} title="Secondary" />
                      <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: p.backgroundColor }} title="Background" />
                      <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: p.cardBgColor }} title="Card BG" />
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-2">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fine Tuning Controls */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>Fine-Tune Palette & Typography</span>
            </h3>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{currentTheme.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme.backgroundColor}
                    onChange={(e) => updateField('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{currentTheme.backgroundColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Card Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme.cardBgColor}
                    onChange={(e) => updateField('cardBgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{currentTheme.cardBgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme.textColor}
                    onChange={(e) => updateField('textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{currentTheme.textColor}</span>
                </div>
              </div>
            </div>

            {/* Typography Pairing */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-2">Typography Font Pairing</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FONT_PAIRS.map((pair, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateField('fontHeading', pair.heading);
                      updateField('fontBody', pair.body);
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                      currentTheme.fontHeading.includes(pair.heading.split(',')[0])
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>{pair.name}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{pair.heading.split(',')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Style */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-2">Card Layout Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'grid-cards', label: 'Grid Cards' },
                  { id: 'bento', label: 'Bento Box' },
                  { id: 'magazine-list', label: 'Magazine Editorial' },
                  { id: 'compact-rows', label: 'Compact Rows' }
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateField('layoutStyle', style.id as LayoutStyle)}
                    className={`p-2 text-center rounded-xl border text-xs font-semibold ${
                      currentTheme.layoutStyle === style.id
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT LIVE MOBILE PREVIEW STAGE */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="static lg:sticky lg:top-20 w-full max-w-sm">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-600" /> Live Mobile Phone Preview
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Reactive
              </span>
            </div>

            {/* Smartphone Bezel */}
            <div className="relative rounded-[40px] border-[8px] border-[#1A1A1A] bg-[#1A1A1A] p-1 shadow-2xl overflow-hidden aspect-[9/18]">
              {/* Dynamic Theme Canvas */}
              <div
                className="w-full h-full rounded-[32px] overflow-y-auto p-4 flex flex-col justify-between"
                style={{
                  backgroundColor: currentTheme.backgroundColor,
                  color: currentTheme.textColor,
                  fontFamily: currentTheme.fontBody
                }}
              >
                <div>
                  {/* Mock Header */}
                  <div className="text-center pt-4 pb-3 border-b" style={{ borderColor: currentTheme.primaryColor + '30' }}>
                    <h4
                      className="text-base font-bold tracking-tight"
                      style={{
                        color: currentTheme.textColor,
                        fontFamily: currentTheme.fontHeading
                      }}
                    >
                      {restaurant.name || 'Addis Habesha Kitchen'}
                    </h4>
                    <p className="text-[10px] opacity-75 mt-0.5">
                      {restaurant.tagline || 'Traditional Spiced Cuisine & Coffee'}
                    </p>

                    {/* Category tabs */}
                    <div className="flex gap-1.5 justify-center mt-3 overflow-x-auto pb-1">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: currentTheme.primaryColor }}
                      >
                        Specials
                      </span>
                      <span
                        className="text-[10px] px-2.5 py-1 rounded-full opacity-60"
                        style={{ backgroundColor: currentTheme.cardBgColor }}
                      >
                        Breakfast
                      </span>
                      <span
                        className="text-[10px] px-2.5 py-1 rounded-full opacity-60"
                        style={{ backgroundColor: currentTheme.cardBgColor }}
                      >
                        Coffee
                      </span>
                    </div>
                  </div>

                  {/* Mock Menu Items */}
                  <div className="mt-4 space-y-3">
                    {/* Item 1 */}
                    <div
                      className="p-3 rounded-xl shadow-xs border"
                      style={{
                        backgroundColor: currentTheme.cardBgColor,
                        borderColor: currentTheme.enableBorders ? currentTheme.primaryColor + '20' : 'transparent'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold" style={{ fontFamily: currentTheme.fontHeading }}>
                            Special Doro Wat (ልዩ የዶሮ ወጥ)
                          </h5>
                          <p className="text-[10px] opacity-70 line-clamp-2 mt-0.5">
                            Slow-simmered tender chicken in spiced berbere with hard-boiled egg.
                          </p>
                        </div>
                        <span
                          className="text-xs font-extrabold ml-2"
                          style={{ color: currentTheme.primaryColor }}
                        >
                          750 Br
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div
                      className="p-3 rounded-xl shadow-xs border"
                      style={{
                        backgroundColor: currentTheme.cardBgColor,
                        borderColor: currentTheme.enableBorders ? currentTheme.primaryColor + '20' : 'transparent'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold" style={{ fontFamily: currentTheme.fontHeading }}>
                            Gurage Style Kitfo (ክትፎ)
                          </h5>
                          <p className="text-[10px] opacity-70 line-clamp-2 mt-0.5">
                            Prime minced beef in spiced clarified butter & mitmita with ayib.
                          </p>
                        </div>
                        <span
                          className="text-xs font-extrabold ml-2"
                          style={{ color: currentTheme.primaryColor }}
                        >
                          850 Br
                        </span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div
                      className="p-3 rounded-xl shadow-xs border"
                      style={{
                        backgroundColor: currentTheme.cardBgColor,
                        borderColor: currentTheme.enableBorders ? currentTheme.primaryColor + '20' : 'transparent'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold" style={{ fontFamily: currentTheme.fontHeading }}>
                            Traditional Jebena Buna (የጀበና ቡና)
                          </h5>
                          <p className="text-[10px] opacity-70 line-clamp-2 mt-0.5">
                            Fresh 3-round clay pot brew served with roasted barley & frankincense.
                          </p>
                        </div>
                        <span
                          className="text-xs font-extrabold ml-2"
                          style={{ color: currentTheme.primaryColor }}
                        >
                          180 Br
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Bottom Sticky Order Action */}
                <div
                  className="mt-4 p-2.5 rounded-xl text-center text-white text-xs font-bold shadow-md"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  View Full Live Digital Menu
                </div>

              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              This preview reflects the live guest experience when scanned via QR code.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

