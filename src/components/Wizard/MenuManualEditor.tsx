import React, { useState, useMemo } from 'react';
import { 
  Restaurant, 
  Category, 
  MenuItem, 
  DietaryTag, 
  CurrencyCode 
} from '../../types/index.ts';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  Image as ImageIcon, 
  Check, 
  DollarSign, 
  AlertCircle,
  QrCode,
  Globe,
  Utensils,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  AlertTriangle,
  RotateCcw,
  Search,
  X,
  Filter,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_MENUS } from '../../utils/sampleMenus.ts';
import { getFoodImageForDish } from '../../utils/foodImages.ts';

interface MenuManualEditorProps {
  restaurant: Restaurant;
  onSaveRestaurant: (updated: Restaurant) => void;
  onOpenQR: () => void;
  onOpenPreview: () => void;
}

export const MenuManualEditor: React.FC<MenuManualEditorProps> = ({
  restaurant,
  onSaveRestaurant,
  onOpenQR,
  onOpenPreview
}) => {
  const [data, setData] = useState<Restaurant>(restaurant);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState<string | null>(null);
  const [isAutoAssigningAll, setIsAutoAssigningAll] = useState(false);
  const [editingItemModal, setEditingItemModal] = useState<{ catIdx: number; itemIdx: number } | null>(null);
  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [isConfirmClearModal, setIsConfirmClearModal] = useState(false);
  
  // Real-time search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState<DietaryTag | 'all'>('all');

  // Unified Item Update Helper
  const handleUpdateItem = (catIdx: number, itemIdx: number, updates: Partial<MenuItem>) => {
    const newCats = [...data.categories];
    if (!newCats[catIdx] || !newCats[catIdx].items[itemIdx]) return;
    newCats[catIdx].items[itemIdx] = {
      ...newCats[catIdx].items[itemIdx],
      ...updates
    };
    const updatedData = { ...data, categories: newCats };
    setData(updatedData);
    onSaveRestaurant(updatedData);
  };

  // Search and Filter computation
  const isSearchActive = searchQuery.trim().length > 0 || selectedDietaryFilter !== 'all';

  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];

    const query = searchQuery.toLowerCase().trim();

    const matches: Array<{
      category: Category;
      catIdx: number;
      item: MenuItem;
      itemIdx: number;
    }> = [];

    data.categories.forEach((cat, catIdx) => {
      cat.items.forEach((item, itemIdx) => {
        // Tag filter match
        if (selectedDietaryFilter !== 'all') {
          if (!item.dietaryTags || !item.dietaryTags.includes(selectedDietaryFilter)) {
            return;
          }
        }

        // Search text match across Name, Amharic name, Description (ingredients), and Dietary tags
        if (query) {
          const nameMatch = item.name.toLowerCase().includes(query);
          const amharicMatch = (item.amharicName || '').toLowerCase().includes(query);
          const descMatch = (item.description || '').toLowerCase().includes(query);
          const tagsMatch = (item.dietaryTags || []).some(t => t.toLowerCase().includes(query));
          const catNameMatch = cat.name.toLowerCase().includes(query) || (cat.amharicName || '').toLowerCase().includes(query);

          if (!nameMatch && !amharicMatch && !descMatch && !tagsMatch && !catNameMatch) {
            return;
          }
        }

        matches.push({
          category: cat,
          catIdx,
          item,
          itemIdx
        });
      });
    });

    return matches;
  }, [data.categories, searchQuery, selectedDietaryFilter, isSearchActive]);

  // Count matches per category for badges in sidebar
  const categoryMatchCounts = useMemo(() => {
    if (!isSearchActive) return {};
    const counts: Record<string, number> = {};
    searchResults.forEach(res => {
      counts[res.category.id] = (counts[res.category.id] || 0) + 1;
    });
    return counts;
  }, [searchResults, isSearchActive]);

  // Clear search and filters
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedDietaryFilter('all');
  };

  // Save changes
  const handleSave = () => {
    onSaveRestaurant(data);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  // Add Category
  const handleAddCategory = () => {
    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      restaurantId: data.id,
      name: 'New Category ' + (data.categories.length + 1),
      amharicName: '',
      sortOrder: data.categories.length + 1,
      items: []
    };
    const updatedCats = [...data.categories, newCat];
    const updatedData = { ...data, categories: updatedCats };
    setData(updatedData);
    setActiveCategoryIndex(updatedCats.length - 1);
    onSaveRestaurant(updatedData);
  };

  // Remove Category (Allow deleting ANY category including the last one)
  const handleRemoveCategory = (index: number) => {
    const updatedCats = data.categories.filter((_, i) => i !== index);
    const updatedData = { ...data, categories: updatedCats };
    setData(updatedData);
    setActiveCategoryIndex(Math.max(0, Math.min(index, updatedCats.length - 1)));
    onSaveRestaurant(updatedData);
  };

  // Clear all demo data
  const handleClearAllDemoData = () => {
    const cleared: Restaurant = {
      ...data,
      categories: []
    };
    setData(cleared);
    setActiveCategoryIndex(0);
    onSaveRestaurant(cleared);
    setIsConfirmClearModal(false);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  // Restore sample demo items
  const handleLoadSampleDemoItems = () => {
    const sample = SAMPLE_MENUS[0];
    const sampleCats: Category[] = sample.mockExtracted.categories.map((c, idx) => ({
      id: `cat-demo-${idx + 1}`,
      restaurantId: data.id,
      name: c.name,
      amharicName: c.amharicName || '',
      sortOrder: idx + 1,
      items: c.items.map((it, itIdx) => ({
        id: `item-demo-${idx + 1}-${itIdx + 1}`,
        categoryId: `cat-demo-${idx + 1}`,
        restaurantId: data.id,
        name: it.name,
        amharicName: it.amharicName || '',
        price: it.price,
        description: it.description,
        imageUrl: it.imageUrl || getFoodImageForDish(it.name, c.name, sample.cuisine, it.amharicName),
        dietaryTags: it.dietaryTags,
        isAvailable: true,
        sortOrder: itIdx + 1
      }))
    }));

    const updated: Restaurant = {
      ...data,
      categories: sampleCats
    };
    setData(updated);
    setActiveCategoryIndex(0);
    onSaveRestaurant(updated);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  // Add Item to active category with auto-matched image
  const handleAddItem = (catIdx: number) => {
    if (!data.categories[catIdx]) return;
    const catName = data.categories[catIdx].name;
    const itemName = 'Specialty Dish';
    const initialImage = getFoodImageForDish(itemName, catName, data.cuisineType);

    const newItem: MenuItem = {
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      categoryId: data.categories[catIdx].id,
      restaurantId: data.id,
      name: itemName,
      amharicName: '',
      price: data.currency === 'ETB' ? 350 : 15,
      description: 'Handcrafted with signature spices and fresh ingredients.',
      imageUrl: initialImage,
      dietaryTags: [],
      isAvailable: true,
      sortOrder: data.categories[catIdx].items.length + 1
    };

    const newCats = [...data.categories];
    newCats[catIdx].items.push(newItem);
    const updatedData = { ...data, categories: newCats };
    setData(updatedData);
    onSaveRestaurant(updatedData);
  };

  // Delete Item
  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    const newCats = [...data.categories];
    newCats[catIdx].items = newCats[catIdx].items.filter((_, i) => i !== itemIdx);
    const updatedData = { ...data, categories: newCats };
    setData(updatedData);
    onSaveRestaurant(updatedData);
    if (editingItemModal?.catIdx === catIdx && editingItemModal?.itemIdx === itemIdx) {
      setEditingItemModal(null);
    }
  };

  // Toggle Tag
  const handleToggleTag = (catIdx: number, itemIdx: number, tag: DietaryTag) => {
    const newCats = [...data.categories];
    const item = newCats[catIdx].items[itemIdx];
    const tags = item.dietaryTags || [];
    item.dietaryTags = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    const updatedData = { ...data, categories: newCats };
    setData(updatedData);
    onSaveRestaurant(updatedData);
  };

  // Auto-assign / match food photos for all items in all categories
  const handleAutoAssignAllImages = () => {
    setIsAutoAssigningAll(true);
    setTimeout(() => {
      const updatedCats = data.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((it) => ({
          ...it,
          imageUrl: getFoodImageForDish(it.name, cat.name, data.cuisineType, it.amharicName)
        }))
      }));

      const updatedData = { ...data, categories: updatedCats };
      setData(updatedData);
      onSaveRestaurant(updatedData);
      setIsAutoAssigningAll(false);
      setIsSavedBanner(true);
      setTimeout(() => setIsSavedBanner(false), 3000);
    }, 400);
  };

  // AI Generate Image for item
  const handleGenerateAiImage = async (catIdx: number, itemIdx: number) => {
    const item = data.categories[catIdx].items[itemIdx];
    setIsGeneratingAiImage(item.id);

    try {
      const res = await fetch('/api/food/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.name,
          name: item.name,
          description: item.description,
          cuisine: data.cuisineType
        })
      });

      const resData = await res.json();
      if (resData.imageUrl) {
        const newCats = [...data.categories];
        newCats[catIdx].items[itemIdx] = {
          ...newCats[catIdx].items[itemIdx],
          imageUrl: resData.imageUrl,
          isAiGeneratedImage: true
        };
        const updated = { ...data, categories: newCats };
        setData(updated);
        onSaveRestaurant(updated);
      }
    } catch (e) {
      console.error('Failed to generate AI image:', e);
    } finally {
      setIsGeneratingAiImage(null);
    }
  };

  const activeCategory = data.categories[activeCategoryIndex];
  const totalItemCount = data.categories.reduce((acc, c) => acc + c.items.length, 0);
  const itemsWithImages = data.categories.reduce((acc, c) => acc + c.items.filter((it) => !!it.imageUrl).length, 0);

  return (
    <div id="manual-menu-editor" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Confirm Clear Modal */}
      {isConfirmClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Clear All Demo Items?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This will remove all {totalItemCount} demo items and {data.categories.length} categories, giving you a fresh, clean menu canvas to add your own dishes.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmClearModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllDemoData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-200"
              >
                Yes, Clear All Demo Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Quick Actions */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Digital Menu Items & Categories
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
              Live Editor
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.cuisineType} • {totalItemCount} Items ({itemsWithImages} with food photos) across {data.categories.length} Categories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {totalItemCount > 0 && (
            <button
              type="button"
              onClick={handleAutoAssignAllImages}
              disabled={isAutoAssigningAll}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Automatically match food photography for all dishes"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isAutoAssigningAll ? 'animate-spin' : ''}`} />
              <span>{isAutoAssigningAll ? 'Matching Photos...' : 'Auto-Match All Dish Photos'}</span>
            </button>
          )}

          {totalItemCount > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmClearModal(true)}
              className="px-3.5 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Delete all demo items and start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Demo Items</span>
            </button>
          )}

          {data.categories.length === 0 && (
            <button
              type="button"
              onClick={handleLoadSampleDemoItems}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Items</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQR}
            className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-gray-600" />
            <span>QR & Print</span>
          </button>

          <button
            type="button"
            onClick={onOpenPreview}
            className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-orange-600" />
            <span>Guest Preview</span>
          </button>

          <button
            id="save-menu-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-200 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Saved Toast */}
      {isSavedBanner && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Menu and items saved successfully!
        </div>
      )}

      {/* Restaurant Overview Settings */}
      <div className="mb-6 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
          Restaurant Profile & Guest Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Restaurant Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-bold text-[#1A1A1A] bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cuisine / Tagline</label>
            <input
              type="text"
              value={data.tagline || ''}
              onChange={(e) => setData({ ...data, tagline: e.target.value })}
              className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Currency</label>
            <select
              value={data.currency}
              onChange={(e) => setData({ ...data, currency: e.target.value as CurrencyCode })}
              className="w-full px-3 py-1.5 text-xs font-bold text-orange-950 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500"
            >
              <option value="ETB">ETB (Ethiopian Birr - Br)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SAR">SAR (﷼)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Guest Wi-Fi Info</label>
            <input
              type="text"
              value={data.wifiSSID ? `${data.wifiSSID} / ${data.wifiPass}` : ''}
              onChange={(e) => {
                const parts = e.target.value.split('/');
                setData({ ...data, wifiSSID: parts[0]?.trim(), wifiPass: parts[1]?.trim() });
              }}
              placeholder="SSID / Password"
              className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Real-time Search & Filter Toolbar */}
      <div className="mb-6 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="menu-item-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name (e.g. Doro Wat), ingredients (e.g. beef, berbere, lentils), or Amharic..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Status & Clear Button */}
          {isSearchActive && (
            <div className="flex items-center gap-2 self-end md:self-center">
              <span className="text-xs font-bold text-orange-950 bg-orange-50 border border-orange-200/80 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                {searchResults.length} {searchResults.length === 1 ? 'dish found' : 'dishes found'}
              </span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs text-gray-600 hover:text-rose-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                title="Clear active search and filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Dietary Tag Quick Filter Chips */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3 h-3 text-gray-400" /> Filter:
          </span>
          {(
            [
              { tag: 'all', label: 'All Dishes' },
              { tag: 'fasting', label: 'የጾም (Fasting)' },
              { tag: 'vegan', label: 'Vegan' },
              { tag: 'vegetarian', label: 'Vegetarian' },
              { tag: 'spicy', label: 'Spicy' },
              { tag: 'halal', label: 'Halal' },
              { tag: 'chef-special', label: "Chef's Special" }
            ] as Array<{ tag: DietaryTag | 'all'; label: string }>
          ).map(({ tag, label }) => {
            const isSelected = selectedDietaryFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedDietaryFilter(tag)}
                className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Categories Navigation & Items Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CATEGORIES SIDEBAR */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs h-fit">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
              Menu Categories ({data.categories.length})
            </h3>
            <button
              type="button"
              onClick={handleAddCategory}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {data.categories.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              <p className="text-xs">No categories yet.</p>
              <button
                type="button"
                onClick={handleAddCategory}
                className="mt-2 text-xs text-orange-600 font-bold hover:underline"
              >
                + Add First Category
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {data.categories.map((cat, idx) => {
                const isActive = idx === activeCategoryIndex && !isSearchActive;
                const matchCount = categoryMatchCounts[cat.id];

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setActiveCategoryIndex(idx);
                      if (isSearchActive) {
                        handleClearSearch();
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <p className="text-xs truncate">{cat.name}</p>
                      {cat.amharicName && (
                        <p className={`text-[10px] truncate ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>
                          {cat.amharicName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      {isSearchActive && matchCount !== undefined ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {matchCount} match{matchCount === 1 ? '' : 'es'}
                        </span>
                      ) : (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-orange-700 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cat.items.length}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(idx);
                        }}
                        title="Delete category"
                        className={`p-1 rounded hover:bg-rose-600 hover:text-white ${
                          isActive ? 'text-orange-200' : 'text-gray-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ITEMS LIST FOR ACTIVE CATEGORY OR SEARCH RESULTS */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
          {isSearchActive ? (
            /* SEARCH RESULTS VIEW */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-orange-600" />
                    <h3 className="text-base font-bold text-gray-900">
                      Search Results ({searchResults.length})
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {searchQuery ? `Matching "${searchQuery}"` : 'Filtered by dietary tags'} 
                    {selectedDietaryFilter !== 'all' ? ` • ${selectedDietaryFilter}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Back to Category View</span>
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3 text-orange-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No matching dishes found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    We couldn't find any items matching your keywords, ingredients, or dietary filters.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search & Filters</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map(({ category, catIdx, item, itemIdx }) => (
                    <div
                      key={item.id}
                      className="border border-[#E5E7EB] rounded-xl p-4 hover:border-gray-300 transition-all bg-gray-50/50"
                    >
                      {/* Category origin badge & Jump link */}
                      <div className="mb-3 pb-2 border-b border-gray-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category:</span>
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold">
                            {category.name} {category.amharicName ? `(${category.amharicName})` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategoryIndex(catIdx);
                            handleClearSearch();
                          }}
                          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                        >
                          <span>Open in Category</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Image Preview / Generator Box */}
                        <div className="md:col-span-3">
                          <div className="relative rounded-lg overflow-hidden bg-gray-200 aspect-[4/3] flex items-center justify-center group border border-gray-200">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-2 text-gray-400">
                                <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                <span className="text-[10px]">No Image (Text only)</span>
                              </div>
                            )}

                            {item.isMenuCroppedImage && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-200 text-[9px] font-bold flex items-center gap-1 border border-emerald-500/30 shadow-xs">
                                📸 Menu Photo
                              </span>
                            )}
                            {item.isAiGeneratedImage && !item.isMenuCroppedImage && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-stone-900/90 text-orange-300 text-[9px] font-bold border border-amber-500/30 shadow-xs">
                                ✨ AI Photo
                              </span>
                            )}
                          </div>

                          {/* Image Actions */}
                          <div className="mt-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleGenerateAiImage(catIdx, itemIdx)}
                              disabled={isGeneratingAiImage === item.id}
                              className="w-full py-1 bg-white hover:bg-orange-50 text-orange-700 border border-gray-200 rounded-md text-[10px] font-bold flex items-center justify-center gap-1"
                            >
                              {isGeneratingAiImage === item.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-orange-500" />
                              )}
                              <span>{item.imageUrl ? 'Re-match' : 'Match Photo'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newImg = getFoodImageForDish(item.name, category.name, data.cuisineType, item.amharicName);
                                handleUpdateItem(catIdx, itemIdx, { imageUrl: newImg });
                              }}
                              className="p-1 bg-white text-gray-600 hover:text-orange-600 border border-gray-200 rounded-md text-[10px]"
                              title="Reset to smart matched photo"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            {item.imageUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateItem(catIdx, itemIdx, { imageUrl: undefined, isAiGeneratedImage: false });
                                }}
                                className="p-1 bg-white text-gray-400 hover:text-rose-600 border border-gray-200 rounded-md"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Item Details Form */}
                        <div className="md:col-span-9 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(catIdx, itemIdx, { name: e.target.value })}
                                placeholder="Item name"
                                className="w-full text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-400">
                                  {data.currency === 'ETB' ? 'Br' : '$'}
                                </span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleUpdateItem(catIdx, itemIdx, { price: parseFloat(e.target.value) || 0 })}
                                  className="w-24 pl-7 pr-2 py-1.5 text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg text-right"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                title="Delete food item"
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={item.amharicName || ''}
                            onChange={(e) => handleUpdateItem(catIdx, itemIdx, { amharicName: e.target.value })}
                            placeholder="Amharic item name (አማርኛ ስም) e.g. የዶሮ ወጥ"
                            className="w-full text-xs text-orange-950 bg-white border border-gray-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-orange-500"
                          />

                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(catIdx, itemIdx, { description: e.target.value })}
                            placeholder="Ingredients and description..."
                            className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                          />

                          {/* Dietary Tags Selector */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Tags:</span>
                            {(
                              [
                                { tag: 'fasting', label: 'የጾም (Fasting)' },
                                { tag: 'vegan', label: 'Vegan' },
                                { tag: 'vegetarian', label: 'Vegetarian' },
                                { tag: 'spicy', label: 'Spicy' },
                                { tag: 'halal', label: 'Halal' },
                                { tag: 'chef-special', label: "Chef's Special" }
                              ] as { tag: DietaryTag; label: string }[]
                            ).map(({ tag, label }) => {
                              const isActive = (item.dietaryTags || []).includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleTag(catIdx, itemIdx, tag)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-all ${
                                    isActive
                                      ? 'bg-orange-600 text-white border-orange-600'
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeCategory ? (
            /* STANDARD CATEGORY VIEW */
            <div>
              {/* Category Title & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeCategory.name}
                      onChange={(e) => {
                        const newCats = [...data.categories];
                        newCats[activeCategoryIndex].name = e.target.value;
                        const updatedData = { ...data, categories: newCats };
                        setData(updatedData);
                        onSaveRestaurant(updatedData);
                      }}
                      className="text-base font-bold text-[#1A1A1A] bg-transparent border-b border-dashed border-gray-300 focus:border-orange-600 focus:outline-none w-full max-w-md"
                    />
                  </div>
                  <input
                    type="text"
                    value={activeCategory.amharicName || ''}
                    onChange={(e) => {
                      const newCats = [...data.categories];
                      newCats[activeCategoryIndex].amharicName = e.target.value;
                      const updatedData = { ...data, categories: newCats };
                      setData(updatedData);
                      onSaveRestaurant(updatedData);
                    }}
                    placeholder="Amharic name (አማርኛ ስም) e.g. ልዩ የባህል ምግቦች"
                    className="text-xs text-orange-950 bg-transparent focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(activeCategoryIndex)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg flex items-center gap-1 border border-rose-200"
                    title="Delete this category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Category</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddItem(activeCategoryIndex)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Food Item
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              {activeCategory.items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No items in this category yet.</p>
                  <button
                    type="button"
                    onClick={() => handleAddItem(activeCategoryIndex)}
                    className="mt-3 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add First Item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCategory.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="border border-[#E5E7EB] rounded-xl p-4 hover:border-gray-300 transition-all bg-gray-50/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        {/* Image Preview / Generator Box */}
                        <div className="md:col-span-3">
                          <div className="relative rounded-lg overflow-hidden bg-gray-200 aspect-[4/3] flex items-center justify-center group border border-gray-200">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-2 text-gray-400">
                                <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                <span className="text-[10px]">No Image (Text only)</span>
                              </div>
                            )}

                            {item.isMenuCroppedImage && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-200 text-[9px] font-bold flex items-center gap-1 border border-emerald-500/30 shadow-xs">
                                📸 Menu Photo
                              </span>
                            )}
                            {item.isAiGeneratedImage && !item.isMenuCroppedImage && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-stone-900/90 text-orange-300 text-[9px] font-bold border border-amber-500/30 shadow-xs">
                                ✨ AI Photo
                              </span>
                            )}
                          </div>

                          {/* Image Actions */}
                          <div className="mt-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleGenerateAiImage(activeCategoryIndex, itemIdx)}
                              disabled={isGeneratingAiImage === item.id}
                              className="w-full py-1 bg-white hover:bg-orange-50 text-orange-700 border border-gray-200 rounded-md text-[10px] font-bold flex items-center justify-center gap-1"
                            >
                              {isGeneratingAiImage === item.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-orange-500" />
                              )}
                              <span>{item.imageUrl ? 'Re-match' : 'Match Photo'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newImg = getFoodImageForDish(item.name, activeCategory.name, data.cuisineType, item.amharicName);
                                handleUpdateItem(activeCategoryIndex, itemIdx, { imageUrl: newImg });
                              }}
                              className="p-1 bg-white text-gray-600 hover:text-orange-600 border border-gray-200 rounded-md text-[10px]"
                              title="Reset to smart matched photo"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            {item.imageUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateItem(activeCategoryIndex, itemIdx, { imageUrl: undefined, isAiGeneratedImage: false });
                                }}
                                className="p-1 bg-white text-gray-400 hover:text-rose-600 border border-gray-200 rounded-md"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Item Details Form */}
                        <div className="md:col-span-9 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, { name: e.target.value })}
                                placeholder="Item name"
                                className="w-full text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-400">
                                  {data.currency === 'ETB' ? 'Br' : '$'}
                                </span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, { price: parseFloat(e.target.value) || 0 })}
                                  className="w-24 pl-7 pr-2 py-1.5 text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg text-right"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(activeCategoryIndex, itemIdx)}
                                title="Delete food item"
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={item.amharicName || ''}
                            onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, { amharicName: e.target.value })}
                            placeholder="Amharic item name (አማርኛ ስም) e.g. የዶሮ ወጥ"
                            className="w-full text-xs text-orange-950 bg-white border border-gray-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-orange-500"
                          />

                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, { description: e.target.value })}
                            placeholder="Ingredients and description..."
                            className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                          />

                          {/* Dietary Tags Selector */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Tags:</span>
                            {(
                              [
                                { tag: 'fasting', label: 'የጾም (Fasting)' },
                                { tag: 'vegan', label: 'Vegan' },
                                { tag: 'vegetarian', label: 'Vegetarian' },
                                { tag: 'spicy', label: 'Spicy' },
                                { tag: 'halal', label: 'Halal' },
                                { tag: 'chef-special', label: "Chef's Special" }
                              ] as { tag: DietaryTag; label: string }[]
                            ).map(({ tag, label }) => {
                              const isActive = (item.dietaryTags || []).includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleTag(activeCategoryIndex, itemIdx, tag)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-all ${
                                    isActive
                                      ? 'bg-orange-600 text-white border-orange-600'
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-600">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Menu is Empty</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                All demo items and categories have been cleared. You can start creating your own categories and dishes from scratch, or reload sample presets.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-orange-200 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Custom Category</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleDemoItems}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Demo Items</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
