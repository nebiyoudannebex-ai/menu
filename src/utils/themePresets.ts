import { MenuTheme, ThemePreset } from '../types/index.ts';

export interface ThemeConfig {
  preset: ThemePreset;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBgColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  layoutStyle: 'grid-cards' | 'magazine-list' | 'bento' | 'compact-rows' | 'editorial';
  showImages: boolean;
  enableBorders: boolean;
}

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  'ethiopian-cultural': {
    preset: 'ethiopian-cultural',
    name: 'Addis Heritage & Cultural',
    description: 'Warm amber, berbere spices, rich gold, and emerald tones tailored for Ethiopian restaurants and cafes.',
    primaryColor: '#B45309', // Warm amber
    secondaryColor: '#15803D', // Traditional forest green
    backgroundColor: '#FAF6EF', // Soft warm parchment
    textColor: '#292524', // Deep charcoal
    cardBgColor: '#FFFFFF',
    accentColor: '#D97706',
    fontHeading: 'Playfair Display, Georgia, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'md',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true
  },
  'modern-bento': {
    preset: 'modern-bento',
    name: 'Modern Bento & Neo-Clean',
    description: 'Crisp high-contrast structure, rounded geometry, and sleek glass micro-borders for contemporary restaurants.',
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    backgroundColor: '#F8FAFC',
    textColor: '#0F172A',
    cardBgColor: '#FFFFFF',
    accentColor: '#3B82F6',
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'xl',
    layoutStyle: 'bento',
    showImages: true,
    enableBorders: true
  },
  'luxury-noir': {
    preset: 'luxury-noir',
    name: 'Luxury Noir & Gold',
    description: 'Deep velvet charcoal, refined gold accents, and serif headings for upscale fine dining and steak lounges.',
    primaryColor: '#D97706', // Burnished gold
    secondaryColor: '#CA8A04',
    backgroundColor: '#121212', // Obsidian dark
    textColor: '#F5F5F4',
    cardBgColor: '#1C1917',
    accentColor: '#F59E0B',
    fontHeading: 'Cinzel, Playfair Display, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'sm',
    layoutStyle: 'magazine-list',
    showImages: true,
    enableBorders: true
  },
  'warm-cafe': {
    preset: 'warm-cafe',
    name: 'Warm Artisan Bakery & Roastery',
    description: 'Earthy terracotta, oat milk cream, rustic typography for coffee shops, bakeries, and brunch spots.',
    primaryColor: '#9A3412', // Terracotta
    secondaryColor: '#78350F', // Roasted espresso
    backgroundColor: '#FFFBEB', // Warm cream
    textColor: '#451A03',
    cardBgColor: '#FFFFFF',
    accentColor: '#C2410C',
    fontHeading: 'DM Serif Display, serif',
    fontBody: 'Outfit, sans-serif',
    borderRadius: 'lg',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true
  },
  'bold-street': {
    preset: 'bold-street',
    name: 'Bold Street & Smash Diner',
    description: 'High energy, vibrant reds and cheddars, punchy badges for fast food, smash burgers, and food trucks.',
    primaryColor: '#DC2626',
    secondaryColor: '#F59E0B',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    cardBgColor: '#1E293B',
    accentColor: '#EF4444',
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'xl',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true
  },
  'minimalist': {
    preset: 'minimalist',
    name: 'Minimalist Nordic',
    description: 'Clean typography-first layout with generous whitespace, subtle dividers, and timeless elegance.',
    primaryColor: '#18181B',
    secondaryColor: '#71717A',
    backgroundColor: '#FFFFFF',
    textColor: '#18181B',
    cardBgColor: '#FAFAFA',
    accentColor: '#3F3F46',
    fontHeading: 'Plus Jakarta Sans, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'none',
    layoutStyle: 'compact-rows',
    showImages: false,
    enableBorders: false
  },
  'custom-ai': {
    preset: 'custom-ai',
    name: 'AI Bespoke Theme',
    description: 'Custom AI-generated palette tailored to your restaurant identity and mood.',
    primaryColor: '#6366F1',
    secondaryColor: '#EC4899',
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    cardBgColor: '#FFFFFF',
    accentColor: '#4F46E5',
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'lg',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true
  }
};

export const FONT_PAIRS = [
  { name: 'Heritage Serif + Sans', heading: 'Playfair Display, serif', body: 'Plus Jakarta Sans, sans-serif' },
  { name: 'Modern Tech + Clean', heading: 'Space Grotesk, sans-serif', body: 'Plus Jakarta Sans, sans-serif' },
  { name: 'Editorial Luxury', heading: 'Cinzel, serif', body: 'Outfit, sans-serif' },
  { name: 'Cozy Artisan', heading: 'DM Serif Display, serif', body: 'Outfit, sans-serif' },
  { name: 'Pure Minimalist', heading: 'Plus Jakarta Sans, sans-serif', body: 'Plus Jakarta Sans, sans-serif' }
];

export const DEFAULT_THEME: MenuTheme = {
  id: 'theme-default',
  restaurantId: 'default',
  themePreset: 'ethiopian-cultural',
  primaryColor: '#B45309',
  secondaryColor: '#15803D',
  backgroundColor: '#FAF6EF',
  textColor: '#292524',
  cardBgColor: '#FFFFFF',
  accentColor: '#D97706',
  fontHeading: 'Playfair Display, Georgia, serif',
  fontBody: 'Plus Jakarta Sans, sans-serif',
  borderRadius: 'md',
  layoutStyle: 'grid-cards',
  showImages: true,
  enableBorders: true,
  moodDescription: 'Warm amber, berbere spices, rich gold, and emerald tones tailored for Ethiopian restaurants and cafes.'
};
