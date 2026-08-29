import React, { useState } from 'react';
import { 
  Sparkles, 
  QrCode, 
  ExternalLink, 
  Layers, 
  Code2, 
  Eye, 
  Plus,
  Menu as MenuIcon,
  X,
  Palette
} from 'lucide-react';

interface HeaderProps {
  currentView: 'upload' | 'review' | 'theme' | 'editor' | 'public-menu' | 'qr' | 'api-docs';
  onSelectView: (view: 'upload' | 'review' | 'theme' | 'editor' | 'public-menu' | 'qr' | 'api-docs') => void;
  onStartBlank?: () => void;
  restaurantName?: string;
  restaurantSlug?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onStartBlank,
  restaurantName = 'Lalibela Modern Kitchen',
  restaurantSlug = 'addis-habesha'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'upload' as const, label: 'AI Scan Menu', icon: Sparkles, activeWhen: ['upload', 'review'] },
    { id: 'theme' as const, label: 'Theme Studio', icon: Palette, activeWhen: ['theme'] },
    { id: 'editor' as const, label: 'Menu Items', icon: Layers, activeWhen: ['editor'] },
    { id: 'qr' as const, label: 'QR Studio', icon: QrCode, activeWhen: ['qr'] },
    { id: 'public-menu' as const, label: 'Live Menu', icon: Eye, activeWhen: ['public-menu'] },
    { id: 'api-docs' as const, label: 'Embed & Connect', icon: Code2, activeWhen: ['api-docs'] },
  ];

  const handleNavClick = (view: typeof currentView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand (Always shrink-0 to prevent squishing on mobile) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <button 
              id="header-brand-logo-btn"
              onClick={() => handleNavClick('upload')}
              className="flex items-center gap-2 text-left group focus:outline-none shrink-0"
            >
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
                M
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-base sm:text-lg text-[#1A1A1A] tracking-tight whitespace-nowrap">
                  MenuAI
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Bento Studio
                </span>
              </div>
            </button>

            {/* Restaurant Subtitle Pill */}
            {restaurantName && (
              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#E5E7EB] text-xs">
                <span className="font-semibold text-gray-800 truncate max-w-[150px]">{restaurantName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs (Hidden on small mobile screens) */}
          <nav id="header-nav-tabs" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeWhen.includes(currentView);
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Mobile Menu Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onStartBlank && (
              <button
                id="header-start-blank-btn"
                type="button"
                onClick={onStartBlank}
                title="Start a new blank menu"
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-orange-600" />
                <span>Blank</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('public-menu')}
              className={`flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'public-menu'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>

            <a
              id="header-live-menu-link"
              href={`/menu/${restaurantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-500 transition-colors shadow-sm shadow-orange-200"
            >
              <span>Guest Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-Down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-3 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeWhen.includes(currentView);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-orange-50 text-orange-800 border border-orange-300 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 shadow-xs'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            {restaurantName && (
              <span className="text-[11px] text-gray-500 truncate font-medium">
                {restaurantName}
              </span>
            )}
            <a
              href={`/menu/${restaurantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>Guest Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
