import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadedScanPage, 
  OCRExtractedData, 
  CurrencyCode, 
  DietaryTag 
} from '../../types/index.ts';
import { 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Languages,
  Check,
  ZoomIn,
  Image as ImageIcon,
  RefreshCw,
  Crop,
  X,
  Maximize2
} from 'lucide-react';
import { getFoodImageForDish } from '../../utils/foodImages.ts';
import { cropImageFromBox } from '../../utils/imageCropper.ts';

interface OCRReviewEditorProps {
  pages: UploadedScanPage[];
  extractedData: OCRExtractedData;
  onConfirm: (finalData: OCRExtractedData, targetView?: 'theme' | 'public-menu' | 'editor') => void;
  onBack: () => void;
}

export const OCRReviewEditor: React.FC<OCRReviewEditorProps> = ({
  pages,
  extractedData,
  onConfirm,
  onBack
}) => {
  const [data, setData] = useState<OCRExtractedData>(extractedData);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [isAssigningAllImages, setIsAssigningAllImages] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<{ catIdx: number; itemIdx: number; url: string } | null>(null);

  // Manual Crop Modal State
  const [cropModal, setCropModal] = useState<{
    catIdx: number;
    itemIdx: number;
    pageIdx: number;
    box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
    isDragging: boolean;
    dragStart: { x: number; y: number } | null;
    options: {
      preset: 'enhanced' | 'crisp' | 'warm' | 'original';
      brightness: number;
      contrast: number;
      warmth: number;
      saturation: number;
      sharpness: number;
      burnNamePlate: boolean;
    };
  } | null>(null);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string>('');
  const [showScanRefMobile, setShowScanRefMobile] = useState<boolean>(false);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Generate live preview when cropModal changes
  useEffect(() => {
    let isCancelled = false;
    if (cropModal && pages[cropModal.pageIdx]?.dataUrl) {
      const item = data.categories[cropModal.catIdx]?.items[cropModal.itemIdx];
      cropImageFromBox(pages[cropModal.pageIdx].dataUrl, cropModal.box, {
        enhance: cropModal.options.preset !== 'original',
        brightness: cropModal.options.brightness,
        contrast: cropModal.options.contrast,
        warmth: cropModal.options.warmth,
        saturation: cropModal.options.saturation,
        sharpness: cropModal.options.sharpness,
        foodName: item?.name,
        amharicName: item?.amharicName,
        burnNamePlate: cropModal.options.burnNamePlate
      }).then((url) => {
        if (!isCancelled) {
          setCropPreviewUrl(url);
        }
      });
    } else {
      setCropPreviewUrl('');
    }
    return () => {
      isCancelled = true;
    };
  }, [cropModal?.box, cropModal?.pageIdx, cropModal?.options, cropModal?.catIdx, cropModal?.itemIdx]);

  // Toggle category collapse
  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Update item field
  const handleItemChange = (catIdx: number, itemIdx: number, field: string, value: any) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      const newItems = [...newCats[catIdx].items];
      newItems[itemIdx] = {
        ...newItems[itemIdx],
        [field]: value,
        needsReview: field === 'price' || field === 'name' ? false : newItems[itemIdx].needsReview
      };
      newCats[catIdx].items = newItems;
      return { ...prev, categories: newCats };
    });
  };

  // Mark item as verified
  const handleVerifyItem = (catIdx: number, itemIdx: number) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      const newItems = [...newCats[catIdx].items];
      newItems[itemIdx] = {
        ...newItems[itemIdx],
        needsReview: false,
        confidenceScore: 1.0
      };
      newCats[catIdx].items = newItems;
      return { ...prev, categories: newCats };
    });
  };

  // Remove item
  const handleRemoveItem = (catIdx: number, itemIdx: number) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      newCats[catIdx].items = newCats[catIdx].items.filter((_, i) => i !== itemIdx);
      return { ...prev, categories: newCats };
    });
  };

  // Add new item to category with auto-matched image
  const handleAddItem = (catIdx: number) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      const catName = newCats[catIdx]?.name || 'Specialty';
      const newItemName = 'New Menu Item';
      const initialImage = getFoodImageForDish(newItemName, catName, data.cuisineType);

      newCats[catIdx].items.push({
        name: newItemName,
        price: data.currency === 'ETB' ? 250 : 15,
        description: 'Freshly prepared specialty dish with authentic spices.',
        dietaryTags: [],
        confidenceScore: 1.0,
        needsReview: false,
        imageUrl: initialImage
      });
      return { ...prev, categories: newCats };
    });
  };

  // Toggle dietary tag
  const handleToggleTag = (catIdx: number, itemIdx: number, tag: DietaryTag) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      const currentTags = newCats[catIdx].items[itemIdx].dietaryTags || [];
      const updated = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      newCats[catIdx].items[itemIdx].dietaryTags = updated;
      return { ...prev, categories: newCats };
    });
  };

  // Auto-assign / match food photos for all items across all categories
  const handleAutoAssignAllImages = () => {
    setIsAssigningAllImages(true);
    setTimeout(() => {
      setData((prev) => {
        const updatedCats = prev.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => ({
            ...item,
            imageUrl: getFoodImageForDish(item.name, cat.name, prev.cuisineType, item.amharicName)
          }))
        }));
        return { ...prev, categories: updatedCats };
      });
      setIsAssigningAllImages(false);
    }, 400);
  };

  // Refresh single item image
  const handleRefreshItemImage = (catIdx: number, itemIdx: number) => {
    const item = data.categories[catIdx].items[itemIdx];
    const cat = data.categories[catIdx];
    const newImg = getFoodImageForDish(item.name, cat.name, data.cuisineType, item.amharicName);
    handleItemChange(catIdx, itemIdx, 'imageUrl', newImg);
  };

  // Open crop tool for specific item
  const handleOpenCropModal = (catIdx: number, itemIdx: number) => {
    const item = data.categories[catIdx].items[itemIdx];
    const initialPage = typeof item.pageIndex === 'number' && item.pageIndex >= 0 && item.pageIndex < pages.length
      ? item.pageIndex
      : selectedPageIndex;
    const initialBox: [number, number, number, number] = (item.imageBoundingBox && item.imageBoundingBox.length === 4)
      ? item.imageBoundingBox
      : [250, 250, 650, 650]; // Default initial crop box in center
    
    setCropModal({
      catIdx,
      itemIdx,
      pageIdx: initialPage,
      box: initialBox,
      isDragging: false,
      dragStart: null,
      options: {
        preset: 'enhanced',
        brightness: 6,
        contrast: 1.15,
        warmth: 1.08,
        saturation: 1.16,
        sharpness: 0.25,
        burnNamePlate: false
      }
    });
  };

  // Save manual crop with modifications
  const handleSaveCrop = async () => {
    if (!cropModal || !pages[cropModal.pageIdx]) return;
    try {
      const item = data.categories[cropModal.catIdx]?.items[cropModal.itemIdx];
      const croppedUrl = await cropImageFromBox(pages[cropModal.pageIdx].dataUrl, cropModal.box, {
        enhance: cropModal.options.preset !== 'original',
        brightness: cropModal.options.brightness,
        contrast: cropModal.options.contrast,
        warmth: cropModal.options.warmth,
        saturation: cropModal.options.saturation,
        sharpness: cropModal.options.sharpness,
        foodName: item?.name,
        amharicName: item?.amharicName,
        burnNamePlate: cropModal.options.burnNamePlate
      });

      if (croppedUrl) {
        setData((prev) => {
          const newCats = [...prev.categories];
          const newItems = [...newCats[cropModal.catIdx].items];
          newItems[cropModal.itemIdx] = {
            ...newItems[cropModal.itemIdx],
            imageUrl: croppedUrl,
            isMenuCroppedImage: true,
            hasMenuImage: true,
            imageBoundingBox: cropModal.box,
            pageIndex: cropModal.pageIdx
          };
          newCats[cropModal.catIdx].items = newItems;
          return { ...prev, categories: newCats };
        });
      }
    } catch (err) {
      console.error('Error saving manual crop:', err);
    } finally {
      setCropModal(null);
    }
  };

  // Preset enhancement changer
  const handleSetEnhancePreset = (preset: 'enhanced' | 'crisp' | 'warm' | 'original') => {
    if (!cropModal) return;
    let newOptions = { ...cropModal.options, preset };
    if (preset === 'enhanced') {
      newOptions = { ...newOptions, brightness: 6, contrast: 1.15, warmth: 1.08, saturation: 1.16, sharpness: 0.25 };
    } else if (preset === 'crisp') {
      newOptions = { ...newOptions, brightness: 4, contrast: 1.25, warmth: 1.02, saturation: 1.10, sharpness: 0.45 };
    } else if (preset === 'warm') {
      newOptions = { ...newOptions, brightness: 8, contrast: 1.12, warmth: 1.18, saturation: 1.22, sharpness: 0.20 };
    } else if (preset === 'original') {
      newOptions = { ...newOptions, brightness: 0, contrast: 1.0, warmth: 1.0, saturation: 1.0, sharpness: 0.0 };
    }
    setCropModal((prev) => prev ? { ...prev, options: newOptions } : null);
  };

  // Remove photo from item
  const handleRemoveItemPhoto = (catIdx: number, itemIdx: number) => {
    setData((prev) => {
      const newCats = [...prev.categories];
      const newItems = [...newCats[catIdx].items];
      newItems[itemIdx] = {
        ...newItems[itemIdx],
        imageUrl: undefined,
        isMenuCroppedImage: false,
        hasMenuImage: false,
        imageBoundingBox: undefined
      };
      newCats[catIdx].items = newItems;
      return { ...prev, categories: newCats };
    });
  };

  // Quick preset crop boxes
  const handleSetPresetBox = (preset: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'full') => {
    if (!cropModal) return;
    let newBox: [number, number, number, number];
    switch (preset) {
      case 'top-left':
        newBox = [80, 80, 480, 480];
        break;
      case 'top-right':
        newBox = [80, 520, 480, 920];
        break;
      case 'bottom-left':
        newBox = [520, 80, 920, 480];
        break;
      case 'bottom-right':
        newBox = [520, 520, 920, 920];
        break;
      case 'full':
        newBox = [50, 50, 950, 950];
        break;
      case 'center':
      default:
        newBox = [250, 250, 750, 750];
        break;
    }
    setCropModal((prev) => prev ? { ...prev, box: newBox } : null);
  };

  // Calculate unverified items & items with images
  const totalItems = data.categories.reduce((acc, c) => acc + c.items.length, 0);
  const itemsWithImages = data.categories.reduce((acc, c) => acc + c.items.filter((it) => !!it.imageUrl).length, 0);
  const flaggedCount = data.categories.reduce(
    (acc, c) => acc + c.items.filter((it) => it.needsReview).length,
    0
  );

  return (
    <div id="ocr-review-editor" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner & Instructions */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Extraction Verified ({Math.round(data.confidenceAverage * 100)}% Confidence)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-200">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{itemsWithImages}/{totalItems} Items with Food Photos</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Review & Verify Extracted Menu Data
          </h2>
          <p className="text-xs text-gray-500">
            Compare extracted categories, prices, and dish photos side-by-side with your original scan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAutoAssignAllImages}
            disabled={isAssigningAllImages}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all"
            title="Auto-match high-res food photo for every single dish"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isAssigningAllImages ? 'animate-spin' : ''}`} />
            <span>{isAssigningAllImages ? 'Matching Photos...' : 'Auto-Match All Dish Photos'}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
          >
            Back to Upload
          </button>
          <button
            type="button"
            onClick={() => onConfirm(data, 'public-menu')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-200 transition-all"
            title="Publish directly and open the live guest menu immediately"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Live Menu</span>
          </button>
          <button
            id="confirm-ocr-and-continue-btn"
            type="button"
            onClick={() => onConfirm(data, 'theme')}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-200 transition-all"
          >
            <span>Proceed to Theme Customizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flagged items notice if any */}
      {flaggedCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>
              <strong>{flaggedCount} item(s)</strong> have lower OCR confidence and are flagged for quick confirmation.
            </span>
          </div>
          <button
            onClick={() => {
              setData((prev) => ({
                ...prev,
                categories: prev.categories.map((c) => ({
                  ...c,
                  items: c.items.map((it) => ({ ...it, needsReview: false }))
                }))
              }));
            }}
            className="px-3 py-1 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-500 text-[11px]"
          >
            Confirm All Items
          </button>
        </div>
      )}

      {/* Mobile Toggle for Original Scan Image */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setShowScanRefMobile((prev) => !prev)}
          className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between shadow-2xs hover:bg-gray-50 transition-all"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-600" />
            <span>{showScanRefMobile ? 'Hide Original Menu Scan' : 'View Original Menu Scan Reference'}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold border border-orange-200">
            {showScanRefMobile ? 'Close' : 'Show Photo'}
          </span>
        </button>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Original Uploaded Image Viewer */}
        <div className={`lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col h-fit static lg:sticky lg:top-20 shadow-xs ${showScanRefMobile ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-[#1A1A1A]">Original Menu Photo Reference</span>
            </div>
            {pages.length > 1 && (
              <div className="flex gap-1">
                {pages.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      selectedPageIndex === idx
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Page {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {pages.length > 0 && (
            <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-[3/4] flex items-center justify-center border border-gray-200">
              <img
                src={pages[selectedPageIndex]?.dataUrl}
                alt="Original scanned menu"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] text-gray-300">
                {pages[selectedPageIndex]?.name || 'Scan page'}
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-3 text-center">
            Reference this image while verifying item prices, descriptions, and categories.
          </p>
        </div>

        {/* RIGHT COLUMN: Extracted Structured Menu Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Restaurant Global Info Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-600" />
                <span>Restaurant Information</span>
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">{totalItems} Extracted Items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={data.restaurantName}
                  onChange={(e) => setData({ ...data, restaurantName: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={data.tagline || ''}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  placeholder="e.g. Authentic Spiced Cuisine"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={data.cuisineType || ''}
                  onChange={(e) => setData({ ...data, cuisineType: e.target.value })}
                  placeholder="e.g. Ethiopian Traditional, Smash Burgers, Cafe"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Currency
                </label>
                <select
                  value={data.currency}
                  onChange={(e) => setData({ ...data, currency: e.target.value as CurrencyCode })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-orange-950"
                >
                  <option value="ETB">ETB (Ethiopian Birr - Br)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="SAR">SAR (﷼)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories and Items Accordions */}
          <div className="space-y-4">
            {data.categories.map((category, catIdx) => {
              const isExpanded = !!expandedCategories[catIdx];

              return (
                <div
                  key={catIdx}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategory(catIdx)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between select-none"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={category.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newCats = [...data.categories];
                          newCats[catIdx].name = e.target.value;
                          setData({ ...data, categories: newCats });
                        }}
                        className="font-bold text-sm text-[#1A1A1A] bg-transparent border-b border-dashed border-gray-300 focus:border-orange-600 focus:outline-none max-w-sm"
                      />
                      {category.amharicName && (
                        <span className="text-xs text-orange-800 font-medium px-2 py-0.5 rounded bg-orange-100/70">
                          {category.amharicName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 font-medium">
                        ({category.items.length} items)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(catIdx);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-gray-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Item
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Items List */}
                  {isExpanded && (
                    <div className="p-4 divide-y divide-gray-100 space-y-4">
                      {category.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`pt-3 first:pt-0 rounded-xl p-3 transition-colors ${
                            item.needsReview
                              ? 'bg-orange-50/60 border border-orange-300'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          {/* Item Alert Header if Needs Review */}
                          {item.needsReview && (
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-orange-200 text-orange-950 text-xs">
                              <span className="flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                                Please confirm extracted price & name
                              </span>
                              {item.originalText && (
                                <span className="text-[11px] text-orange-700 italic">
                                  Raw text: "{item.originalText}"
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleVerifyItem(catIdx, itemIdx)}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Confirm
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                            
                            {/* Food Photo Thumbnail */}
                            <div className="sm:col-span-3 flex flex-col items-center gap-1.5">
                              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-2 text-center">
                                    <ImageIcon className="w-5 h-5 mb-1 opacity-50 text-gray-400" />
                                    <span className="text-[10px] text-gray-500 font-medium leading-tight">No image on menu</span>
                                    <span className="text-[9px] text-gray-400">Text-only dish</span>
                                  </div>
                                )}

                                {item.isMenuCroppedImage && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-900/85 text-emerald-200 text-[9px] font-bold flex items-center gap-1 shadow-xs">
                                    📸 Cropped from Menu
                                  </span>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCropModal(catIdx, itemIdx)}
                                    title="Crop photo directly from scanned menu"
                                    className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] flex items-center gap-1 shadow-sm font-bold"
                                  >
                                    <Crop className="w-3.5 h-3.5" />
                                    <span>{item.imageUrl ? 'Re-crop' : 'Crop'}</span>
                                  </button>
                                  {item.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemPhoto(catIdx, itemIdx)}
                                      title="Remove photo (make text-only)"
                                      className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenCropModal(catIdx, itemIdx)}
                                  className="text-[10px] text-orange-600 hover:text-orange-700 hover:underline font-bold inline-flex items-center gap-1"
                                >
                                  <Crop className="w-3 h-3" />
                                  <span>{item.imageUrl ? 'Re-crop Scan' : 'Crop from Menu Scan'}</span>
                                </button>
                                <span className="text-gray-300 text-[10px]">•</span>
                                <button
                                  type="button"
                                  onClick={() => handleRefreshItemImage(catIdx, itemIdx)}
                                  className="text-[10px] text-gray-500 hover:text-gray-700 hover:underline"
                                  title="Match stock culinary image"
                                >
                                  Stock Photo
                                </button>
                              </div>
                            </div>

                            {/* Name, Amharic & Description */}
                            <div className="sm:col-span-6 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(catIdx, itemIdx, 'name', e.target.value)}
                                  placeholder="Food Item Name"
                                  className="w-full text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                                />
                              </div>

                              {item.amharicName !== undefined && (
                                <input
                                  type="text"
                                  value={item.amharicName || ''}
                                  onChange={(e) => handleItemChange(catIdx, itemIdx, 'amharicName', e.target.value)}
                                  placeholder="የምግብ ስም በግዕዝ / አማርኛ (Optional Amharic)"
                                  className="w-full text-xs text-orange-950 bg-orange-50/50 border border-orange-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-orange-500"
                                />
                              )}

                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleItemChange(catIdx, itemIdx, 'description', e.target.value)}
                                placeholder="Description and ingredients..."
                                className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-orange-500"
                              />

                              {/* Dietary Tags Pill Bar */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {(
                                  [
                                    { tag: 'vegan', label: 'Vegan' },
                                    { tag: 'fasting', label: 'የጾም (Fasting)' },
                                    { tag: 'spicy', label: 'Spicy' },
                                    { tag: 'vegetarian', label: 'Vegetarian' },
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

                            {/* Price and Delete */}
                            <div className="sm:col-span-3 flex flex-col items-end gap-2">
                              <div className="relative w-full">
                                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-400">
                                  {data.currency === 'ETB' ? 'Br' : '$'}
                                </span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(catIdx, itemIdx, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-8 pr-2.5 py-1.5 text-sm font-bold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg text-right focus:ring-1 focus:ring-orange-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(catIdx, itemIdx)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 flex items-center gap-1 text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Delete</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
            >
              ← Back to Upload
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => onConfirm(data, 'public-menu')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200 transition-all"
                title="Publish directly and open the live guest menu immediately"
              >
                <Eye className="w-4 h-4" />
                <span>Publish Directly & Open Live Menu</span>
              </button>

              <button
                type="button"
                onClick={() => onConfirm(data, 'theme')}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 transition-all"
              >
                <span>Looks Good — Proceed to Theme Customizer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Menu Scan Cropper Modal */}
      {cropModal && pages[cropModal.pageIdx] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                    <Crop className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    Crop Dish Photo from Menu Scan
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Target item:{' '}
                  <span className="font-bold text-orange-700">
                    {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.name}
                  </span>
                  {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.amharicName && (
                    <span className="text-gray-500 ml-1">
                      ({data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.amharicName})
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCropModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
              
              {/* Left Column: Menu Page with Interactive Bounding Box */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                {/* Page Selection Bar if multiple pages */}
                {pages.length > 1 && (
                  <div className="flex items-center gap-2 pb-1 overflow-x-auto">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Page:</span>
                    {pages.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCropModal((prev) => prev ? { ...prev, pageIdx: idx } : null)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          cropModal.pageIdx === idx
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Page {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Scanned Image Container with Selection Overlay */}
                <div
                  ref={cropContainerRef}
                  onClick={(e) => {
                    if (!cropContainerRef.current) return;
                    const rect = cropContainerRef.current.getBoundingClientRect();
                    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
                    const clickY = ((e.clientY - rect.top) / rect.height) * 1000;
                    const boxW = cropModal.box[3] - cropModal.box[1];
                    const boxH = cropModal.box[2] - cropModal.box[0];
                    const newXmin = Math.max(0, Math.min(1000 - boxW, clickX - boxW / 2));
                    const newYmin = Math.max(0, Math.min(1000 - boxH, clickY - boxH / 2));
                    setCropModal((prev) => prev ? {
                      ...prev,
                      box: [newYmin, newXmin, newYmin + boxH, newXmin + boxW]
                    } : null);
                  }}
                  className="relative w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-300 cursor-crosshair select-none aspect-[3/4] max-h-[420px] flex items-center justify-center"
                >
                  <img
                    src={pages[cropModal.pageIdx].dataUrl}
                    alt={`Menu Page ${cropModal.pageIdx + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Visual Crop Box Overlay */}
                  <div
                    style={{
                      top: `${cropModal.box[0] / 10}%`,
                      left: `${cropModal.box[1] / 10}%`,
                      height: `${(cropModal.box[2] - cropModal.box[0]) / 10}%`,
                      width: `${(cropModal.box[3] - cropModal.box[1]) / 10}%`
                    }}
                    className="absolute border-2 border-orange-500 bg-orange-500/20 shadow-lg pointer-events-none rounded-lg transition-all"
                  >
                    {/* Firmly anchored, grounded label inside top corner */}
                    <div className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md border border-white/20 whitespace-nowrap flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.name || 'Dish Photo'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets & Click hint */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500">Quick Areas:</span>
                  {(
                    [
                      { id: 'top-left', label: 'Top Left' },
                      { id: 'top-right', label: 'Top Right' },
                      { id: 'center', label: 'Center' },
                      { id: 'bottom-left', label: 'Bottom Left' },
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'full', label: 'Full Page' }
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSetPresetBox(p.id)}
                      className="px-2.5 py-1 rounded bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-700 text-[11px] font-medium border border-gray-200 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">
                  Tip: Click anywhere on the menu scan above to frame the dish photo.
                </p>
              </div>

              {/* Right Column: Live Cropped Preview with Food Name & Modifications */}
              <div className="lg:col-span-5 bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-3.5">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Live Cropped Food Photo
                  </h4>
                  <p className="text-xs text-gray-500">
                    Grounded with the dish name and culinary tone enhancements:
                  </p>
                </div>

                {/* Cropped Food Card Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {cropPreviewUrl ? (
                      <img
                        src={cropPreviewUrl}
                        alt="Cropped Food"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Rendering cropped preview...
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-900/85 text-emerald-200 text-[10px] font-bold shadow-xs">
                      📸 Cropped from Menu
                    </span>
                  </div>

                  {/* Food Name & Details - Grounded in card */}
                  <div className="p-3 bg-white">
                    <h5 className="font-bold text-sm text-gray-900">
                      {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.name}
                    </h5>
                    {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.amharicName && (
                      <p className="text-xs text-orange-950 font-medium">
                        {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.amharicName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.description || 'Authentic specialty dish.'}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-orange-600">
                        {data.currency === 'ETB' ? 'Br ' : '$'}
                        {data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.price}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready to Attach
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image Enhancement & Modifications Controls */}
                <div className="bg-white rounded-xl p-3 border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>✨</span> Image Modifications
                    </span>
                    <span className="text-[10px] text-orange-600 font-semibold">Auto-Culinary Polish</span>
                  </div>

                  {/* Filter Presets */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'enhanced', label: '🌟 Culinary Pop', desc: 'Warm & Appetizing' },
                      { id: 'crisp', label: '💎 Crisp Details', desc: 'High Sharpness' },
                      { id: 'warm', label: '🌅 Cozy Warmth', desc: 'Golden Amber' },
                      { id: 'original', label: '📷 Original Scan', desc: 'No Filter' },
                    ].map((pst) => (
                      <button
                        key={pst.id}
                        type="button"
                        onClick={() => handleSetEnhancePreset(pst.id as any)}
                        className={`p-1.5 rounded-lg text-left border text-xs transition-all ${
                          cropModal.options.preset === pst.id
                            ? 'bg-orange-50 border-orange-500 text-orange-900 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{pst.label}</div>
                        <div className="text-[9px] text-gray-400 font-normal">{pst.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Burn Nameplate Option */}
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cropModal.options.burnNamePlate}
                      onChange={(e) =>
                        setCropModal((prev) =>
                          prev ? { ...prev, options: { ...prev.options, burnNamePlate: e.target.checked } } : null
                        )
                      }
                      className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-gray-700 font-medium">
                      Burn dish name banner directly onto photo file
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCrop}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-orange-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Attach Photo to &ldquo;{data.categories[cropModal.catIdx]?.items[cropModal.itemIdx]?.name}&rdquo;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModal(null)}
                    className="w-full py-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Quick Image URL Modal */}
      {editingImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-600" />
              <span>Set Dish Image URL</span>
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Enter a direct image link or choose from our culinary matcher.
            </p>

            <input
              type="text"
              value={editingImageUrl.url}
              onChange={(e) => setEditingImageUrl({ ...editingImageUrl, url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingImageUrl(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleItemChange(editingImageUrl.catIdx, editingImageUrl.itemIdx, 'imageUrl', editingImageUrl.url);
                  setEditingImageUrl(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-xs"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
