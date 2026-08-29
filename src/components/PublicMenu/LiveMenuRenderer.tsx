import React, { useState, useMemo } from 'react';
import { 
  Restaurant, 
  MenuItem, 
  LanguageCode, 
  DietaryTag, 
  CartItem 
} from '../../types/index.ts';
import { 
  Search, 
  Globe, 
  Languages,
  Wifi, 
  Phone, 
  MapPin, 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  Share2, 
  Check, 
  Flame, 
  Leaf, 
  Award,
  Bell,
  UtensilsCrossed,
  Info,
  ArrowLeftRight
} from 'lucide-react';

interface LiveMenuRendererProps {
  restaurant: Restaurant;
  isStandalone?: boolean;
}

export const LiveMenuRenderer: React.FC<LiveMenuRendererProps> = ({
  restaurant,
  isStandalone = false
}) => {
  const [activeLang, setActiveLang] = useState<LanguageCode>(restaurant.defaultLanguage || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    restaurant.categories[0]?.id || ''
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('5');
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [selectedItemModal, setSelectedItemModal] = useState<MenuItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);

  const theme = restaurant.theme;

  const toggleLanguage = (targetLang?: LanguageCode) => {
    const nextLang = targetLang || (activeLang === 'en' ? 'am' : 'en');
    setActiveLang(nextLang);
    const toastMsg = nextLang === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል (Amharic Active)' : 'Language switched to English';
    setLangToast(toastMsg);
    setTimeout(() => setLangToast(null), 2200);
  };

  // Language dictionary translations
  const t = {
    en: {
      search: 'Search food, drinks & dishes...',
      all: 'All Items',
      fasting: 'Fasting (የጾም)',
      vegan: 'Vegan',
      vegetarian: 'Vegetarian',
      spicy: 'Spicy',
      special: "Chef's Special",
      orderTray: 'Your Table Order',
      callWaiter: 'Call Waiter',
      subtotal: 'Estimated Total',
      sendOrder: 'Send Order to Kitchen',
      wifi: 'Guest Wi-Fi',
      viewItem: 'View Details',
      added: 'Item Added',
      table: 'Table #'
    },
    am: {
      search: 'ምግቦችን ወይም መጠጦችን ይፈልጉ...',
      all: 'ሁሉም ምግቦች',
      fasting: 'የጾም ምግቦች',
      vegan: 'ቪጋን',
      vegetarian: 'አትክልት',
      spicy: 'ቃሪያ / ሚስማር',
      special: 'ልዩ የሼፍ ምርጫ',
      orderTray: 'የትዕዛዝ ቅርጫት',
      callWaiter: 'አስተናጋጅ ጥራ',
      subtotal: 'ጠቅላላ ዋጋ',
      sendOrder: 'ትዕዛዝ ወደ ማብሰያ ላክ',
      wifi: 'የእንግዳ ዋይፋይ',
      viewItem: 'ዝርዝር ይመልከቱ',
      added: 'ተጨምሯል',
      table: 'ጠረጴዛ ቁጥር'
    },
    om: {
      search: 'Nyaata fi dhugaatii barbaadi...',
      all: 'Hundumaa',
      fasting: 'Soomaa',
      vegan: 'Vegan',
      vegetarian: 'Vegetarian',
      spicy: 'Qaraa',
      special: 'Filatamaa',
      orderTray: 'Ajaja Keessan',
      callWaiter: 'Keessummeessituu Waami',
      subtotal: 'Waliigala',
      sendOrder: 'Ajaja Ergi',
      wifi: 'Wi-Fi',
      viewItem: 'Bal\'inaan Ilaali',
      added: 'Dabalameera',
      table: 'Gabatee #'
    },
    ti: {
      search: 'ምግቢ ወይ መስተ ድለዩ...',
      all: 'ኩሉ',
      fasting: 'ናይ ጾም',
      vegan: 'ቪጋን',
      vegetarian: 'ኣትክልቲ',
      spicy: 'በርበረ',
      special: 'ፍሉይ ምርጫ',
      orderTray: 'ትእዛዝኩም',
      callWaiter: 'ኣተኣናጋዲ ጸውዕ',
      subtotal: 'ድምር ዋጋ',
      sendOrder: 'ትእዛዝ ስደድ',
      wifi: 'ዋይፋይ',
      viewItem: 'ዝርዝር ርአ',
      added: 'ተወሲኹ',
      table: 'ጠረጴዛ #'
    }
  }[activeLang] || {
    search: 'Search food & drinks...',
    all: 'All',
    fasting: 'Fasting',
    vegan: 'Vegan',
    vegetarian: 'Vegetarian',
    spicy: 'Spicy',
    special: "Chef's Special",
    orderTray: 'Your Order',
    callWaiter: 'Call Waiter',
    subtotal: 'Total',
    sendOrder: 'Submit Order',
    wifi: 'Wi-Fi',
    viewItem: 'View Details',
    added: 'Added',
    table: 'Table #'
  };

  // Filtered categories & items
  const filteredCategories = useMemo(() => {
    return restaurant.categories
      .map((cat) => {
        const items = cat.items.filter((it) => {
          if (!it.isAvailable) return false;
          
          // Dietary Filter
          if (selectedTag !== 'all') {
            if (selectedTag === 'fasting' && !it.dietaryTags.includes('fasting') && !it.dietaryTags.includes('vegan')) return false;
            if (selectedTag === 'vegan' && !it.dietaryTags.includes('vegan')) return false;
            if (selectedTag === 'vegetarian' && !it.dietaryTags.includes('vegetarian') && !it.dietaryTags.includes('vegan')) return false;
            if (selectedTag === 'spicy' && !it.dietaryTags.includes('spicy')) return false;
            if (selectedTag === 'chef-special' && !it.dietaryTags.includes('chef-special')) return false;
          }

          // Search Filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesName = it.name.toLowerCase().includes(query);
            const matchesAmharic = it.amharicName?.toLowerCase().includes(query);
            const matchesDesc = it.description.toLowerCase().includes(query);
            return matchesName || matchesAmharic || matchesDesc;
          }

          return true;
        });

        return { ...cat, items };
      })
      .filter((cat) => cat.items.length > 0);
  }, [restaurant.categories, searchQuery, selectedTag]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.menuItem.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0);
  const cartCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);

  const formatPrice = (price: number) => {
    if (restaurant.currency === 'ETB') return `${price.toLocaleString()} Br`;
    if (restaurant.currency === 'USD') return `$${price.toFixed(2)}`;
    if (restaurant.currency === 'EUR') return `€${price.toFixed(2)}`;
    if (restaurant.currency === 'GBP') return `£${price.toFixed(2)}`;
    return `${price} ${restaurant.currency}`;
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: restaurant.name, text: restaurant.tagline, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendOrder = () => {
    setOrderSentSuccess(true);
    setTimeout(() => {
      setOrderSentSuccess(false);
      setCart([]);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <div
      id="public-live-menu"
      className="min-h-screen pb-24 transition-colors"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontBody
      }}
    >
      {/* Restaurant Hero Cover Banner */}
      <div className="relative w-full h-44 sm:h-64 bg-stone-900 overflow-hidden">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-900 to-stone-900 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Controls: Language Switcher & Share */}
        <div className="absolute top-4 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between z-10">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-lg">
            <button
              type="button"
              onClick={() => toggleLanguage('en')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                activeLang === 'en'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage('am')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                activeLang === 'am'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Languages className="w-3 h-3" />
              <span>አማርኛ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors"
            title="Share Menu"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Restaurant Title Info in Hero */}
        <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto flex items-end justify-between">
          <div className="text-white">
            <h1
              className="text-xl sm:text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: theme.fontHeading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && (
              <p className="text-xs sm:text-sm text-stone-200 mt-0.5 line-clamp-1">
                {restaurant.tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 relative z-20">
        
        {/* Info Pill Bar (Wifi, Phone, Table) */}
        <div
          className="rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: theme.cardBgColor,
            borderColor: theme.enableBorders ? theme.primaryColor + '25' : 'transparent'
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {restaurant.wifiSSID && (
              <div className="flex items-center gap-1.5 opacity-80">
                <Wifi className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                <span>Wi-Fi: <strong>{restaurant.wifiSSID}</strong> ({restaurant.wifiPass})</span>
              </div>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 opacity-80 hover:underline">
                <Phone className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                <span>{restaurant.phone}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="opacity-75">{t.table}</span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-12 px-2 py-0.5 text-center font-bold rounded-lg border text-xs"
              style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.backgroundColor }}
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 shadow-xs transition-all"
            style={{
              backgroundColor: theme.cardBgColor,
              borderColor: theme.enableBorders ? theme.primaryColor + '30' : 'transparent',
              color: theme.textColor
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {[
            { id: 'all', label: t.all },
            { id: 'fasting', label: t.fasting, icon: Leaf },
            { id: 'vegan', label: t.vegan, icon: Leaf },
            { id: 'vegetarian', label: t.vegetarian },
            { id: 'spicy', label: t.spicy, icon: Flame },
            { id: 'chef-special', label: t.special, icon: Award }
          ].map(({ id, label, icon: Icon }) => {
            const isActive = selectedTag === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTag(id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shadow-2xs"
                style={{
                  backgroundColor: isActive ? theme.primaryColor : theme.cardBgColor,
                  color: isActive ? '#FFFFFF' : theme.textColor,
                  border: `1px solid ${isActive ? theme.primaryColor : theme.primaryColor + '20'}`
                }}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Sticky Category Tabs Bar */}
        <div className="sticky top-0 z-30 py-2.5 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 border-b"
             style={{ borderColor: theme.primaryColor + '15', backgroundColor: theme.backgroundColor + 'E6' }}>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-4xl mx-auto">
            {restaurant.categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="px-3.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  backgroundColor: activeCategoryId === cat.id ? theme.primaryColor : 'transparent',
                  color: activeCategoryId === cat.id ? '#FFFFFF' : theme.textColor,
                  opacity: activeCategoryId === cat.id ? 1 : 0.75
                }}
              >
                {activeLang === 'am' && cat.amharicName ? cat.amharicName : cat.name}
              </a>
            ))}
          </div>
        </div>

        {/* Categories & Items Sections */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No food items matching your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((cat) => (
              <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20">
                
                {/* Category Header */}
                <div className="mb-4 pb-2 border-b flex items-baseline justify-between gap-2" style={{ borderColor: theme.primaryColor + '25' }}>
                  <div>
                    <h2
                      className="text-base sm:text-lg font-bold"
                      style={{ fontFamily: theme.fontHeading, color: theme.textColor }}
                    >
                      {activeLang === 'am' && cat.amharicName ? cat.amharicName : cat.name}
                    </h2>
                    {/* Secondary alternate language subtitle */}
                    {activeLang === 'am' && cat.name && cat.amharicName && (
                      <span className="text-xs opacity-60 block mt-0.5 font-sans">
                        {cat.name}
                      </span>
                    )}
                    {activeLang !== 'am' && cat.amharicName && (
                      <span className="text-xs opacity-60 block mt-0.5 font-sans">
                        {cat.amharicName}
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs opacity-70 text-right max-w-xs">{cat.description}</p>
                  )}
                </div>

                {/* Items Grid Based on Layout Style */}
                <div className={`grid gap-4 ${
                  theme.layoutStyle === 'bento' || theme.layoutStyle === 'grid-cards'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1'
                }`}>
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemModal(item)}
                      className="group rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md border relative"
                      style={{
                        backgroundColor: theme.cardBgColor,
                        borderColor: theme.enableBorders ? theme.primaryColor + '20' : 'transparent'
                      }}
                    >
                      <div>
                        {/* Image if available */}
                        {theme.showImages && item.imageUrl && (
                          <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-3 bg-stone-100 border border-black/5">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {item.isMenuCroppedImage && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-200 text-[9px] font-bold border border-emerald-500/30 shadow-xs">
                                📸 Menu Photo
                              </span>
                            )}
                            {item.isAiGeneratedImage && !item.isMenuCroppedImage && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/90 text-amber-300 text-[9px] font-bold border border-amber-500/30 shadow-xs">
                                ✨ AI Photo
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className="text-sm font-bold tracking-tight"
                              style={{ fontFamily: theme.fontHeading }}
                            >
                              {activeLang === 'am' && item.amharicName ? item.amharicName : item.name}
                            </h3>
                            {/* Secondary Language Title */}
                            {activeLang === 'am' && item.name && item.amharicName ? (
                              <span className="text-[10px] opacity-60 block mt-0.5 font-sans">
                                {item.name}
                              </span>
                            ) : (
                              item.amharicName && (
                                <span className="text-[10px] opacity-60 block mt-0.5 font-sans">
                                  {item.amharicName}
                                </span>
                              )
                            )}
                          </div>

                          <span
                            className="text-sm font-extrabold whitespace-nowrap ml-2"
                            style={{ color: theme.primaryColor }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs opacity-75 mt-1.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Dietary Tags & Add Button */}
                      <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.dietaryTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                              style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}
                            >
                              {tag === 'fasting' ? 'የጾም' : tag}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95 transition-transform"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </section>
            ))}
          </div>
        )}

      </div>

      {/* Floating Language Switcher Pill Button (English ⇋ Amharic) */}
      <aside 
        id="floating-language-switcher"
        aria-label="Language Switcher"
        className={`fixed ${
          cartCount > 0 ? 'bottom-20' : 'bottom-6'
        } right-4 sm:right-6 z-40 flex flex-col items-end gap-2 transition-all duration-300 pointer-events-auto`}
      >
        {langToast && (
          <div className="bg-stone-900/95 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {langToast}
          </div>
        )}

        <div className="bg-stone-950/90 text-white rounded-full p-1 shadow-2xl border border-white/25 backdrop-blur-md flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleLanguage('en')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLang === 'en'
                ? 'bg-orange-600 text-white shadow-md ring-1 ring-white/30'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
            title="Switch Menu to English"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLanguage('am')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeLang === 'am'
                ? 'bg-orange-600 text-white shadow-md ring-1 ring-white/30'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
            title="ወደ አማርኛ ይቀይሩ (Switch Menu to Amharic)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>አማርኛ</span>
          </button>
        </div>
      </aside>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-between transition-transform active:scale-95"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {cartCount}
              </span>
              <span>{t.orderTray}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatPrice(cartTotal)}</span>
              <span className="text-xs opacity-80">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="rounded-3xl max-w-md w-full overflow-hidden p-6 shadow-2xl relative"
            style={{ backgroundColor: theme.cardBgColor, color: theme.textColor }}
          >
            <button
              onClick={() => setSelectedItemModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedItemModal.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-4 bg-stone-100 border border-black/5">
                <img
                  src={selectedItemModal.imageUrl}
                  alt={selectedItemModal.name}
                  className="w-full h-full object-cover"
                />
                {selectedItemModal.isMenuCroppedImage && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-200 text-[10px] font-bold border border-emerald-500/30 shadow-xs">
                    📸 Cropped from Physical Menu
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: theme.fontHeading }}>
                  {activeLang === 'am' && selectedItemModal.amharicName
                    ? selectedItemModal.amharicName
                    : selectedItemModal.name}
                </h3>
                {selectedItemModal.amharicName && (
                  <p className="text-xs opacity-60">{selectedItemModal.amharicName}</p>
                )}
              </div>
              <span className="text-base font-extrabold" style={{ color: theme.primaryColor }}>
                {formatPrice(selectedItemModal.price)}
              </span>
            </div>

            <p className="text-xs opacity-80 leading-relaxed mb-4">
              {selectedItemModal.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedItemModal.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                addToCart(selectedItemModal);
                setSelectedItemModal(null);
              }}
              className="w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Add to Order ({formatPrice(selectedItemModal.price)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Guest Order Tray Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col justify-between"
            style={{ backgroundColor: theme.cardBgColor, color: theme.textColor }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  <h3 className="font-bold text-base">{t.orderTray} ({t.table} {tableNumber})</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full hover:bg-black/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderSentSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-800">Order Sent to Table {tableNumber}!</h4>
                  <p className="text-xs opacity-75">Your server has received your dishes and is preparing your meal.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5 space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold">{item.menuItem.name}</h4>
                        <p className="text-[11px] opacity-60">{formatPrice(item.menuItem.price)} each</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.menuItem.id, -1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold hover:bg-black/5"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.menuItem.id, 1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold hover:bg-black/5"
                        >
                          +
                        </button>
                        <span className="text-xs font-extrabold w-16 text-right" style={{ color: theme.primaryColor }}>
                          {formatPrice(item.menuItem.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!orderSentSuccess && (
              <div className="pt-4 border-t border-black/10 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>{t.subtotal}</span>
                  <span className="text-base font-extrabold" style={{ color: theme.primaryColor }}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`A notification has been sent to table ${tableNumber} waiter.`);
                    }}
                    className="py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black/5"
                    style={{ borderColor: theme.primaryColor + '40', color: theme.textColor }}
                  >
                    <Bell className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <span>{t.callWaiter}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOrder}
                    className="py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.sendOrder}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
