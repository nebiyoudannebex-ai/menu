import { UploadedScanPage, OCRExtractedData } from '../types/index.ts';

export interface CropEnhancementOptions {
  enhance?: boolean;
  brightness?: number; // -50 to 50
  contrast?: number; // 0.8 to 1.6
  warmth?: number; // 0.8 to 1.4
  saturation?: number; // 0.8 to 1.5
  sharpness?: number; // 0 to 1
  foodName?: string;
  amharicName?: string;
  burnNamePlate?: boolean;
}

/**
 * Applies culinary image enhancements to 2D Canvas context:
 * - Dynamic range boost & contrast optimization (removes dull paper-gray scan wash)
 * - Warm culinary tone & vibrance adjustment (enhances food appeal)
 * - Light unsharp sharpening convolution (sharpens textures and garnish)
 * - Soft edge focus vignette
 */
function applyCulinaryEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options?: CropEnhancementOptions
) {
  const enhance = options?.enhance !== false;
  if (!enhance) return;

  const brightness = options?.brightness ?? 6;
  const contrast = options?.contrast ?? 1.14;
  const warmth = options?.warmth ?? 1.08;
  const saturation = options?.saturation ?? 1.15;
  const sharpness = options?.sharpness ?? 0.25;

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const len = d.length;

    // First Pass: Brightness, Contrast, Culinary Warmth & Saturation
    for (let i = 0; i < len; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      // Brightness & Contrast
      r = (r - 128) * contrast + 128 + brightness;
      g = (g - 128) * contrast + 128 + brightness;
      b = (b - 128) * contrast + 128 + brightness;

      // Culinary Warmth: boost red and amber, slightly preserve greens, soften harsh cold blues
      r *= warmth;
      g *= (warmth * 0.5 + 0.5);
      b *= (2 - warmth);

      // Saturation (vibrance calculation)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturation;
      g = gray + (g - gray) * saturation;
      b = gray + (b - gray) * saturation;

      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, b));
    }

    // Second Pass: Sharpening Kernel if requested
    if (sharpness > 0.05 && width > 30 && height > 30) {
      const srcCopy = new Uint8ClampedArray(d);
      const w4 = width * 4;
      const strength = Math.min(0.5, sharpness);
      const centerWeight = 1 + 4 * strength;
      const sideWeight = -strength;

      for (let y = 1; y < height - 1; y++) {
        const rowOffset = y * w4;
        for (let x = 1; x < width - 1; x++) {
          const idx = rowOffset + x * 4;
          for (let c = 0; c < 3; c++) {
            const center = srcCopy[idx + c];
            const top = srcCopy[idx - w4 + c];
            const bottom = srcCopy[idx + w4 + c];
            const left = srcCopy[idx - 4 + c];
            const right = srcCopy[idx + 4 + c];

            const sharpVal = center * centerWeight + (top + bottom + left + right) * sideWeight;
            d[idx + c] = Math.max(0, Math.min(255, sharpVal));
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Subtle culinary edge vignette for polished presentation
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.45,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

  } catch (err) {
    console.warn('Canvas pixel enhancement fallback:', err);
  }
}

/**
 * Renders a grounded, clean nameplate overlay at the bottom of the cropped image
 */
function renderFoodNamePlate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  foodName: string,
  amharicName?: string
) {
  if (!foodName) return;

  const barHeight = Math.max(38, Math.round(height * 0.16));
  const gradient = ctx.createLinearGradient(0, height - barHeight - 15, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.35, 'rgba(15, 12, 10, 0.75)');
  gradient.addColorStop(1, 'rgba(15, 12, 10, 0.94)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - barHeight - 15, width, barHeight + 15);

  // Text styling
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  const fontSize = Math.max(14, Math.round(width * 0.042));
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';

  const textY = amharicName ? height - (barHeight * 0.58) : height - (barHeight * 0.45);
  ctx.fillText(foodName, 14, textY, width - 28);

  if (amharicName) {
    const amhFontSize = Math.max(11, Math.round(fontSize * 0.78));
    ctx.font = `600 ${amhFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#FDBA74'; // Warm amber
    ctx.fillText(amharicName, 14, textY + fontSize * 0.92, width - 28);
  }

  ctx.restore();
}

/**
 * Crops a specific bounding box [ymin, xmin, ymax, xmax] from an image data URL using Canvas 2D.
 * Automatically enhances contrast, vibrance, and sharpness for culinary food photos.
 */
export async function cropImageFromBox(
  imageDataUrl: string,
  box: [number, number, number, number] | number[],
  options?: CropEnhancementOptions
): Promise<string> {
  if (!imageDataUrl || !box || box.length < 4) {
    return '';
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let [ymin, xmin, ymax, xmax] = box;

        if (ymax <= 1.0 && xmax <= 1.0 && (ymax > 0 || xmax > 0)) {
          ymin *= 1000;
          xmin *= 1000;
          ymax *= 1000;
          xmax *= 1000;
        }

        ymin = Math.max(0, Math.min(1000, ymin));
        xmin = Math.max(0, Math.min(1000, xmin));
        ymax = Math.max(0, Math.min(1000, ymax));
        xmax = Math.max(0, Math.min(1000, xmax));

        if (ymax <= ymin || xmax <= xmin) {
          resolve('');
          return;
        }

        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        let pixelX = Math.round((xmin / 1000) * naturalWidth);
        let pixelY = Math.round((ymin / 1000) * naturalHeight);
        let pixelWidth = Math.round(((xmax - xmin) / 1000) * naturalWidth);
        let pixelHeight = Math.round(((ymax - ymin) / 1000) * naturalHeight);

        // Add 1.5% margin padding to ensure the full dish is captured nicely without clipping
        const padX = Math.round(pixelWidth * 0.015);
        const padY = Math.round(pixelHeight * 0.015);

        pixelX = Math.max(0, pixelX - padX);
        pixelY = Math.max(0, pixelY - padY);
        pixelWidth = Math.min(naturalWidth - pixelX, pixelWidth + padX * 2);
        pixelHeight = Math.min(naturalHeight - pixelY, pixelHeight + padY * 2);

        if (pixelWidth < 15 || pixelHeight < 15) {
          resolve('');
          return;
        }

        const maxDimension = 800;
        let outWidth = pixelWidth;
        let outHeight = pixelHeight;

        if (outWidth > maxDimension || outHeight > maxDimension) {
          const ratio = Math.min(maxDimension / outWidth, maxDimension / outHeight);
          outWidth = Math.round(outWidth * ratio);
          outHeight = Math.round(outHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, outWidth);
        canvas.height = Math.max(1, outHeight);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          pixelX,
          pixelY,
          pixelWidth,
          pixelHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Apply Culinary Enhancements (Dynamic range stretch, appetizing color warmth, sharpening)
        applyCulinaryEnhancements(ctx, canvas.width, canvas.height, options);

        // Optionally burn grounded food name plate into image file
        if (options?.burnNamePlate && options.foodName) {
          renderFoodNamePlate(ctx, canvas.width, canvas.height, options.foodName, options.amharicName);
        }

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.94);
        resolve(croppedDataUrl);
      } catch (err) {
        console.error('Error during food photo crop:', err);
        resolve('');
      }
    };

    img.onerror = () => {
      console.warn('Failed to load menu scan image for cropping');
      resolve('');
    };

    img.src = imageDataUrl;
  });
}

/**
 * Iterates through all extracted menu categories and dishes.
 * If a dish has an actual physical photo detected on the menu page:
 * - Automatically crops that photo from the scan page with culinary auto-enhancement
 * - Sets the cropped image to `item.imageUrl`
 * - Flags `item.isMenuCroppedImage = true`
 * If a dish has no photo on the menu:
 * - Keeps `item.imageUrl = undefined` (text-only, no unwanted stock images)
 */
export async function cropDishImagesFromScans(
  pages: UploadedScanPage[],
  extractedData: OCRExtractedData
): Promise<OCRExtractedData> {
  if (!extractedData || !extractedData.categories || !pages || pages.length === 0) {
    return extractedData;
  }

  const updatedCategories = await Promise.all(
    extractedData.categories.map(async (category) => {
      const updatedItems = await Promise.all(
        category.items.map(async (item) => {
          const hasBox = item.imageBoundingBox && item.imageBoundingBox.length === 4;
          const hasImageFlag = item.hasMenuImage !== false && hasBox;

          if (hasImageFlag && item.imageBoundingBox) {
            const pageIdx = typeof item.pageIndex === 'number' && item.pageIndex >= 0 && item.pageIndex < pages.length
              ? item.pageIndex
              : 0;

            const scanPage = pages[pageIdx] || pages[0];

            if (scanPage && scanPage.dataUrl) {
              try {
                const croppedUrl = await cropImageFromBox(scanPage.dataUrl, item.imageBoundingBox, {
                  enhance: true,
                  foodName: item.name,
                  amharicName: item.amharicName,
                  burnNamePlate: false // Keep image clean with UI nameplate, but enhanced
                });
                if (croppedUrl && croppedUrl.length > 50) {
                  return {
                    ...item,
                    imageUrl: croppedUrl,
                    isMenuCroppedImage: true,
                    hasMenuImage: true
                  };
                }
              } catch (cropErr) {
                console.warn(`Could not crop image for item "${item.name}":`, cropErr);
              }
            }
          }

          if (item.isMenuCroppedImage && item.imageUrl) {
            return item;
          }

          return {
            ...item,
            imageUrl: undefined,
            isMenuCroppedImage: false,
            hasMenuImage: false
          };
        })
      );

      return {
        ...category,
        items: updatedItems
      };
    })
  );

  return {
    ...extractedData,
    categories: updatedCategories
  };
}
