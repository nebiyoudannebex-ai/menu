import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Camera, 
  FileText, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Utensils, 
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  QrCode,
  Layers,
  Palette,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { UploadedScanPage, OCRExtractedData } from '../../types/index.ts';
import { SAMPLE_MENUS, SampleMenuPreset } from '../../utils/sampleMenus.ts';
import { cropDishImagesFromScans } from '../../utils/imageCropper.ts';

interface MenuUploaderProps {
  onScanComplete: (pages: UploadedScanPage[], result: OCRExtractedData) => void;
  onStartBlank?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export const MenuUploader: React.FC<MenuUploaderProps> = ({
  onScanComplete,
  onStartBlank,
  isLoading: propIsLoading,
  setIsLoading: propSetIsLoading
}) => {
  const [pages, setPages] = useState<UploadedScanPage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('Reading menu pages...');
  const [showDemoList, setShowDemoList] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('menuai_show_demo_list');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleDemoList = (val: boolean) => {
    setShowDemoList(val);
    try {
      localStorage.setItem('menuai_show_demo_list', String(val));
    } catch (e) {}
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isLoading = propIsLoading !== undefined ? propIsLoading : internalLoading;
  const setIsLoading = propSetIsLoading || setInternalLoading;

  // File input handler
  const handleFiles = (files: FileList | File[]) => {
    setErrorMsg(null);

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrorMsg('Please upload JPG, PNG, WebP or PDF files.');
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds 25MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPages((prev) => [
          ...prev,
          {
            id: 'page-' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            dataUrl,
            mimeType: file.type,
            pageNumber: prev.length + 1
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePage = (id: string) => {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Camera capture handlers
  const startCamera = async () => {
    setErrorMsg(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access camera. Please allow camera permissions or upload a photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPages((prev) => [
        ...prev,
        {
          id: 'cam-' + Math.random().toString(36).substring(2, 9),
          name: `Camera Snapshot #${prev.length + 1}.jpg`,
          dataUrl,
          mimeType: 'image/jpeg',
          pageNumber: prev.length + 1
        }
      ]);
    }
    stopCamera();
  };

  // Run AI Vision Scan
  const handleStartScan = async () => {
    if (pages.length === 0) {
      setErrorMsg('Please upload at least one menu page or photo.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Uploading high-res scans to AI Vision pipeline...');

    try {
      setTimeout(() => setLoadingStep('Analyzing typography, layout & multilingual text...'), 1200);
      setTimeout(() => setLoadingStep('Detecting printed dish photos & bounding boxes on menu...'), 2400);
      setTimeout(() => setLoadingStep('Extracting items, prices, and dietary indicators...'), 3600);

      const response = await fetch('/api/menu/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: pages.map((p) => ({ data: p.dataUrl, mimeType: p.mimeType }))
        })
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        let msg = res.error || 'Failed to analyze menu';
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          msg = 'The AI Vision model is temporarily experiencing high server demand. Please retry in a moment or open a sample preset.';
        }
        throw new Error(msg);
      }

      setLoadingStep('Cropping food photos and attaching dishes...');
      // Automatically crop food images from the uploaded menu pages
      const processedData = await cropDishImagesFromScans(pages, res.data);

      onScanComplete(pages, processedData);
    } catch (err: any) {
      console.error('Scan error:', err);
      let cleanMsg = err?.message || 'AI Vision Scan encountered an issue. You can retry or pick a sample preset.';
      if (cleanMsg.includes('503') || cleanMsg.includes('high demand') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = 'The AI Vision model is temporarily experiencing high server demand. Please click "Retry AI Scan" in a moment, or use the Sample Preset / Manual Editor.';
      }
      setErrorMsg(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick sample loader
  const handleLoadSample = (sample: SampleMenuPreset) => {
    setErrorMsg(null);
    const samplePages: UploadedScanPage[] = sample.pages.map((p, idx) => ({
      id: `sample-page-${idx}`,
      name: `${sample.name} - Page ${p.pageNumber}.jpg`,
      dataUrl: p.imageUrl,
      mimeType: 'image/jpeg',
      pageNumber: p.pageNumber
    }));

    setPages(samplePages);

    const converted: OCRExtractedData = {
      restaurantName: sample.mockExtracted.restaurantName,
      tagline: sample.mockExtracted.tagline,
      cuisineType: sample.mockExtracted.cuisineType,
      currency: sample.mockExtracted.currency,
      suggestedTheme: sample.mockExtracted.suggestedTheme,
      notes: sample.mockExtracted.notes,
      confidenceAverage: 0.98,
      needsReviewCount: 0,
      categories: sample.mockExtracted.categories.map((c) => ({
        name: c.name,
        amharicName: c.amharicName,
        items: c.items.map((it) => ({
          name: it.name,
          amharicName: it.amharicName,
          price: it.price,
          description: it.description,
          dietaryTags: it.dietaryTags,
          confidenceScore: it.confidenceScore,
          needsReview: it.needsReview,
          originalText: it.originalText,
          imageUrl: it.imageUrl,
          isMenuCroppedImage: !!it.imageUrl,
          hasMenuImage: !!it.imageUrl
        }))
      }))
    };

    onScanComplete(samplePages, converted);
  };

  return (
    <div id="menu-uploader-container" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Restaurant Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
              AI Vision
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Lalibela Modern Kitchen • Addis Ababa & Global Digital Menus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pages.length > 0 && (
            <button
              onClick={() => setPages([])}
              className="px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear Scans
            </button>
          )}

          {onStartBlank && (
            <button
              type="button"
              onClick={onStartBlank}
              className="px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Start Blank Menu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleDemoList(!showDemoList)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
              showDemoList
                ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
            }`}
          >
            {showDemoList ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                <span>Turn Off Demo List</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-orange-600" />
                <span>Turn On Demo List</span>
              </>
            )}
          </button>

          {showDemoList && (
            <button
              onClick={() => handleLoadSample(SAMPLE_MENUS[0])}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-500 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Ethiopian Preset</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Service Status Notice</p>
              <p className="text-rose-800 mt-0.5 text-xs">{errorMsg}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {pages.length > 0 && (
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isLoading}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Retry AI Scan</span>
              </button>
            )}
            {onStartBlank && (
              <button
                type="button"
                onClick={onStartBlank}
                className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Manual Editor
              </button>
            )}
            <button 
              onClick={() => setErrorMsg(null)} 
              className="p-1 text-rose-500 hover:text-rose-800 rounded-md hover:bg-rose-100/50"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden p-5 text-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-400" /> Align Menu Page Inside Camera
              </span>
              <button onClick={stopCamera} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4 border border-gray-800 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg pointer-events-none" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
              >
                <Camera className="w-5 h-5" /> Take Snapshot
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BENTO GRID MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        
        {/* CARD 1: Upload Dropzone (col-span-12 md:col-span-4) */}
        <div
          id="dropzone-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-4 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50/30 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-center cursor-pointer transition-all group min-h-[260px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />

          <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#1A1A1A]">Upload New Menu</h3>
            <p className="text-xs text-gray-400 mt-1">Drop JPG, PNG, WebP or PDF (up to 25MB)</p>
          </div>

          <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
            >
              Select Files
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Live Mini Theme Preview Box (col-span-12 md:col-span-5) */}
        <div className="md:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Live Preview: Lalibela Modern Theme
            </span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            </div>
          </div>

          <div className="flex-1 p-5 bg-[#111111] text-white font-serif flex flex-col justify-between">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-light tracking-widest text-amber-100">LALIBELA</h2>
              <div className="w-8 h-[1px] bg-orange-400 mx-auto mt-1.5"></div>
              <p className="text-[10px] text-gray-400 font-sans tracking-wide mt-1">Modern Ethiopian & Cultural Kitchen</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-2 border-b border-white/10 pb-0.5 flex justify-between">
                  <span>Appetizers (መክሰስ)</span>
                  <span className="text-[9px] text-gray-400">ETB</span>
                </div>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold">Sambussa Trio (የስጋ ሳምቡሳ)</span>
                  <span className="text-xs font-sans font-bold text-amber-300">450 ETB</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">Lentil, beef, and vegetable fillings served with spiced awaze dip.</p>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-2 border-b border-white/10 pb-0.5 flex justify-between">
                  <span>Mains (ዋና ምግቦች)</span>
                  <span className="text-[9px] text-gray-400">ETB</span>
                </div>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold">Special Tibs (ልዩ ጥብስ)</span>
                  <span className="text-xs font-sans font-bold text-amber-300">850 ETB</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">Tender prime beef sautéed with onions, rosemary, garlic & green chili.</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-sans text-gray-400">
              <span>Ge'ez & English Multilingual</span>
              <span className="text-emerald-400 font-bold">● Fasting / Vegan Ready</span>
            </div>
          </div>
        </div>

        {/* CARD 3: AI Extraction & Accuracy (col-span-12 md:col-span-3) */}
        <div className="md:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-sm text-[#1A1A1A]">AI Extraction</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold">
                98% ACCURACY
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px] bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden leading-relaxed">
              <div className="text-blue-600">"restaurant": "Lalibela Modern",</div>
              <div className="text-purple-600">"currency": "ETB",</div>
              <div className="text-amber-700">"script": "Latin + Ge'ez",</div>
              <div className="text-gray-700">"categories": [</div>
              <div className="pl-3 text-green-600">"Appetizers", "Mains", "Drinks"</div>
              <div className="text-gray-700">]</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleLoadSample(SAMPLE_MENUS[0])}
              className="w-full py-2 border border-orange-200 text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-50 transition-colors text-center"
            >
              Load Full OCR Sample
            </button>
          </div>
        </div>

        {/* CARD 4: Branding & Palette Archetypes (col-span-12 md:col-span-4) */}
        <div className="md:col-span-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-600" />
              <span>Theme Archetypes</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 border border-orange-500 bg-orange-50 rounded-xl text-xs font-bold text-center text-orange-800">
                Cultural Heritage
              </div>
              <div className="p-2.5 border border-gray-200 rounded-xl text-xs font-bold text-center text-gray-600 hover:bg-gray-50">
                Luxury Noir
              </div>
              <div className="p-2.5 border border-gray-200 rounded-xl text-xs font-bold text-center text-gray-600 hover:bg-gray-50">
                Modern Bento
              </div>
              <div className="p-2.5 border border-gray-200 rounded-xl text-xs font-bold text-center text-gray-600 hover:bg-gray-50">
                Artisan Cafe
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Signature Color Palette</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-600 shadow-sm" title="Warm Amber / Berbere"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-700 shadow-sm" title="Forest Green / Emerald"></div>
              <div className="w-6 h-6 rounded-full bg-amber-800 shadow-sm" title="Clay Pot / Roastery"></div>
              <div className="w-6 h-6 rounded-full bg-stone-900 shadow-sm" title="Noir Gold"></div>
              <span className="text-[10px] text-gray-500 ml-auto font-medium">Auto-matched</span>
            </div>
          </div>
        </div>

        {/* CARD 5: QR Code Table Tent Tile (col-span-12 md:col-span-3) */}
        <div className="md:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col items-center justify-between text-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">Instant QR</h3>
            <span className="text-[10px] font-bold text-orange-600">300 DPI</span>
          </div>

          <div className="bg-gray-50 p-3 border border-gray-100 rounded-xl shadow-inner my-1">
            <div className="w-20 h-20 bg-gray-900 flex items-center justify-center p-1.5 rounded-lg">
              <div className="w-full h-full border border-white grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5">
                <div className="bg-white"></div>
                <div className="bg-transparent"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-transparent"></div>
                <div className="bg-white"></div>
                <div className="bg-transparent"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-transparent"></div>
                <div className="bg-white"></div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900">Table QR Code</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Scan to view mobile menu</p>
          </div>
        </div>

        {/* CARD 6: Ready to Publish Action Banner (col-span-12 md:col-span-5) */}
        <div className="md:col-span-5 bg-orange-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-orange-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Step 1 of 3</span>
            </div>
            <h3 className="text-lg font-bold">Ready to Scan or Design?</h3>
            <p className="text-xs text-orange-100 mt-1">
              Upload photos of your physical menu, or try a 1-click preset.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {pages.length > 0 ? (
              <button
                id="start-ai-scan-btn"
                onClick={handleStartScan}
                disabled={isLoading}
                className="px-5 py-2.5 bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <span>Extract with AI ({pages.length} Pages)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleLoadSample(SAMPLE_MENUS[0])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-xs font-bold transition-all text-center"
              >
                Explore Sample Menu
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Uploaded Scans Gallery if user added files */}
      {pages.length > 0 && (
        <div className="mb-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Uploaded Menu Pages ({pages.length})</span>
            </h4>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Page
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pages.map((p, idx) => (
              <div key={p.id} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                <img
                  src={p.dataUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                  Page {idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePage(p.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 bg-white text-[11px] text-gray-600 truncate border-t border-gray-100">
                  {p.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              Ready to extract categories, food items, prices, and descriptions.
            </span>
            <button
              id="start-ai-scan-btn-bottom"
              onClick={handleStartScan}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-200" />
                  <span>Scan Menu with AI Vision</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 1-Click Sample Menus Section (Collapsible & Toggleable) */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              {showDemoList ? 'Test Instantly with 1-Click Sample Menus' : 'Demo Sample Menus'}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => toggleDemoList(!showDemoList)}
            className="text-xs font-semibold text-gray-500 hover:text-orange-600 flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {showDemoList ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Turn Off Demo List</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-orange-600" />
                <span>Turn On Demo List</span>
              </>
            )}
          </button>
        </div>

        {showDemoList ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_MENUS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className="group bg-white border border-[#E5E7EB] hover:border-orange-500 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-gray-100 relative">
                    <img
                      src={sample.thumbnail}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {sample.country}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-[#1A1A1A] group-hover:text-orange-600 transition-colors">
                    {sample.name}
                  </h5>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{sample.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>Load & Test OCR</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400">
              <EyeOff className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Demo list is turned off</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Upload your own menu pages above or click "Turn On Demo List" whenever you want to test with presets.
            </p>
            <button
              type="button"
              onClick={() => toggleDemoList(true)}
              className="mt-3 px-3.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-xs font-bold rounded-lg text-gray-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Turn On Demo List</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

