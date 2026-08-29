export type CurrencyCode = 'ETB' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'CAD';

export type LanguageCode = 'en' | 'am' | 'om' | 'ti';

export type DietaryTag = 
  | 'vegetarian'
  | 'vegan'
  | 'fasting' // Ethiopian Tsom (የጾም)
  | 'spicy'
  | 'gluten-free'
  | 'halal'
  | 'chef-special'
  | 'organic';

export type ThemePreset = 
  | 'ethiopian-cultural'
  | 'modern-bento'
  | 'luxury-noir'
  | 'warm-cafe'
  | 'bold-street'
  | 'minimalist'
  | 'custom-ai';

export type LayoutStyle = 'grid-cards' | 'magazine-list' | 'bento' | 'compact-rows' | 'editorial';

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  amharicName?: string;
  oromoName?: string;
  price: number;
  description: string;
  imageUrl?: string;
  isAiGeneratedImage?: boolean;
  isMenuCroppedImage?: boolean; // true when automatically cropped from the physical menu photo
  hasMenuImage?: boolean;
  imageBoundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  pageIndex?: number;
  dietaryTags: DietaryTag[];
  isAvailable: boolean;
  confidenceScore?: number; // 0.0 to 1.0 from OCR
  needsReview?: boolean;    // flagged if price or text OCR confidence was low
  originalText?: string;   // what OCR originally saw for comparison
  sortOrder: number;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  amharicName?: string;
  oromoName?: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface MenuTheme {
  id: string;
  restaurantId: string;
  themePreset: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBgColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string; // 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  layoutStyle: LayoutStyle;
  showImages: boolean;
  enableBorders: boolean;
  customCssVariables?: Record<string, string>;
  moodDescription?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  cuisineType: string;
  currency: CurrencyCode;
  defaultLanguage: LanguageCode;
  supportedLanguages?: LanguageCode[];
  phone?: string;
  address?: string;
  wifiSSID?: string;
  wifiPass?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isPublished: boolean;
  tableCount?: number;
  theme: MenuTheme;
  categories: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadedScanPage {
  id: string;
  name: string;
  dataUrl: string; // base64 string
  mimeType: string;
  pageNumber: number;
}

export interface OCRExtractedData {
  restaurantName: string;
  tagline?: string;
  cuisineType?: string;
  currency: CurrencyCode;
  notes?: string;
  confidenceAverage: number;
  needsReviewCount: number;
  suggestedTheme: ThemePreset;
  detectedThemeStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    cardBgColor?: string;
    accentColor?: string;
    fontHeading?: string;
    fontBody?: string;
    borderRadius?: string;
    layoutStyle?: LayoutStyle;
    showImages?: boolean;
    enableBorders?: boolean;
    moodDescription?: string;
  };
  categories: {
    name: string;
    amharicName?: string;
    items: {
      name: string;
      amharicName?: string;
      price: number;
      description?: string;
      dietaryTags?: DietaryTag[];
      confidenceScore: number;
      needsReview: boolean;
      originalText?: string;
      imageUrl?: string;
      hasMenuImage?: boolean;
      imageBoundingBox?: [number, number, number, number];
      pageIndex?: number;
      isMenuCroppedImage?: boolean;
    }[];
  }[];
}

export interface ApiKeyRecord {
  id: string;
  restaurantId: string;
  name: string;
  websiteName?: string;
  websiteUrl?: string;
  serverAddress?: string;
  environment?: 'production' | 'staging' | 'development';
  permissions?: string[];
  status?: 'active' | 'revoked';
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  requestCount?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}
