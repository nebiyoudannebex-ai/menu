import fs from 'fs';
import path from 'path';
import { Restaurant, Category, MenuItem, MenuTheme, ApiKeyRecord } from '../types/index.ts';

const DB_FILE = path.join(process.cwd(), 'database.json');

export interface DatabaseSchema {
  restaurants: Restaurant[];
  apiKeys: ApiKeyRecord[];
}

const DEFAULT_ETHIOPIAN_RESTAURANT: Restaurant = {
  id: 'rest-addis-habesha-01',
  slug: 'addis-habesha',
  name: 'Addis Habesha Cultural Restaurant',
  tagline: 'Authentic Traditional Ethiopian & Gourmet Cuisine',
  cuisineType: 'Ethiopian Traditional & Grill',
  currency: 'ETB',
  defaultLanguage: 'en',
  phone: '+251 91 123 4567',
  address: 'Bole Medhanialem, Addis Ababa, Ethiopia',
  wifiSSID: 'AddisHabesha_Guest',
  wifiPass: 'injera2026',
  logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
  coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  isPublished: true,
  tableCount: 24,
  theme: {
    id: 'theme-01',
    restaurantId: 'rest-addis-habesha-01',
    themePreset: 'ethiopian-cultural',
    primaryColor: '#B45309', // Warm amber / berbere tone
    secondaryColor: '#15803D', // Traditional emerald green
    backgroundColor: '#FAF6EF', // Soft warm parchment
    textColor: '#292524', // Deep charcoal
    cardBgColor: '#FFFFFF',
    accentColor: '#D97706',
    fontHeading: 'Playfair Display, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'md',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true,
    moodDescription: 'Warm Ethiopian cultural ambiance with rich berbere tones, gold accents, and heritage motifs'
  },
  categories: [
    {
      id: 'cat-traditional-mains',
      restaurantId: 'rest-addis-habesha-01',
      name: 'Traditional Specials (ልዩ የባህል ምግቦች)',
      amharicName: 'ልዩ የባህል ምግቦች',
      oromoName: 'Nyaata Aadaa Addaa',
      description: 'Served with freshly baked Teff Injera, salad, and house-made Ayib cheese.',
      sortOrder: 1,
      items: [
        {
          id: 'item-doro-wat',
          categoryId: 'cat-traditional-mains',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Special Doro Wat (ልዩ የዶሮ ወጥ)',
          amharicName: 'ልዩ የዶሮ ወጥ',
          price: 780,
          description: 'Slow-simmered tender chicken drumstick marinated in rich spiced berbere stew with hard-boiled farm egg and cottage cheese.',
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['spicy', 'chef-special', 'halal'],
          isAvailable: true,
          confidenceScore: 0.98,
          needsReview: false,
          sortOrder: 1
        },
        {
          id: 'item-special-kitfo',
          categoryId: 'cat-traditional-mains',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Gurage Style Kitfo (ክትርፍ ክትፎ)',
          amharicName: 'ክትፎ (በጎመን እና አይብ)',
          price: 850,
          description: 'Prime minced lean beef warmed in spiced clarified butter (Niter Kibbeh) and fiery Mitmita. Served with Gomen and Ayib.',
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['spicy', 'chef-special'],
          isAvailable: true,
          confidenceScore: 0.99,
          needsReview: false,
          sortOrder: 2
        },
        {
          id: 'item-shekla-tibs',
          categoryId: 'cat-traditional-mains',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Clay Pot Shekla Tibs (የሸክላ ጥብስ)',
          amharicName: 'የሸክላ ጥብስ',
          price: 750,
          description: 'Tender cubed prime beef sizzled with rosemary, sliced jalapeños, red onions, and aromatic garlic served on a smoking clay burner.',
          imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['spicy'],
          isAvailable: true,
          confidenceScore: 0.95,
          needsReview: false,
          sortOrder: 3
        },
        {
          id: 'item-beyaynetu-fasting',
          categoryId: 'cat-traditional-mains',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Grand Fasting Platter (የፆም በያይነቱ)',
          amharicName: 'የፆም በያይነቱ',
          price: 520,
          description: 'Vibrant feast of 8 fasting dishes: Shiro, Misir Wat (red lentils), Kik Alicha (yellow peas), Gomen (collards), Fasolia, and Timatim Fitfit.',
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegan', 'fasting', 'vegetarian'],
          isAvailable: true,
          confidenceScore: 0.99,
          needsReview: false,
          sortOrder: 4
        }
      ]
    },
    {
      id: 'cat-breakfast-quick',
      restaurantId: 'rest-addis-habesha-01',
      name: 'Breakfast & Morning Bites (ቁርስ)',
      amharicName: 'ቁርስ',
      oromoName: 'Ciree',
      description: 'Morning specialties made to order.',
      sortOrder: 2,
      items: [
        {
          id: 'item-chechebsa',
          categoryId: 'cat-breakfast-quick',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Chechebsa with Honey (ጨጨብሳ በማር)',
          amharicName: 'ጨጨብሳ',
          price: 360,
          description: 'Torn flatbread lightly fried in fragrant spiced butter and berbere, drizzled with pure honey and served with plain yogurt.',
          imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegetarian'],
          isAvailable: true,
          confidenceScore: 0.96,
          needsReview: false,
          sortOrder: 1
        },
        {
          id: 'item-special-ful',
          categoryId: 'cat-breakfast-quick',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Special Fava Bean Ful (ልዩ ፉል)',
          amharicName: 'ልዩ ፉል',
          price: 320,
          description: 'Slow-cooked fava beans with spiced butter, boiled egg, chopped tomato, onions, and fresh warm bread rolls.',
          imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegetarian', 'fasting'],
          isAvailable: true,
          confidenceScore: 0.94,
          needsReview: false,
          sortOrder: 2
        }
      ]
    },
    {
      id: 'cat-beverages-coffee',
      restaurantId: 'rest-addis-habesha-01',
      name: 'Coffee Ceremony & Drinks (ቡና እና መጠጦች)',
      amharicName: 'ቡና እና መጠጦች',
      oromoName: 'Buna fi Dhugaatii',
      description: 'Fresh roast Yirgacheffe coffee ceremony and natural juices.',
      sortOrder: 3,
      items: [
        {
          id: 'item-traditional-buna',
          categoryId: 'cat-beverages-coffee',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Traditional Jebena Coffee Ceremony (የጀበና ቡና)',
          amharicName: 'የጀበና ቡና',
          price: 180,
          description: 'Authentic 3-round clay pot brew served with roasted barley snack (Kolo), popcorn, and aromatic Frankincense.',
          imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegan', 'organic'],
          isAvailable: true,
          confidenceScore: 0.99,
          needsReview: false,
          sortOrder: 1
        },
        {
          id: 'item-spris-juice',
          categoryId: 'cat-beverages-coffee',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Layered Fresh Spris Juice (ስፕሪስ ጁስ)',
          amharicName: 'ስፕሪስ ጁስ',
          price: 240,
          description: 'Beautiful tri-color layers of freshly pressed Avocado, Mango, and Papaya with a squeeze of fresh lime.',
          imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegan', 'fasting', 'organic'],
          isAvailable: true,
          confidenceScore: 0.97,
          needsReview: false,
          sortOrder: 2
        },
        {
          id: 'item-tej-honey-wine',
          categoryId: 'cat-beverages-coffee',
          restaurantId: 'rest-addis-habesha-01',
          name: 'House Special Tej (የማር ጠጅ)',
          amharicName: 'የማር ጠጅ',
          price: 320,
          description: 'Traditional Ethiopian fermented honey wine aged in-house, served in traditional Berele flask.',
          imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['gluten-free'],
          isAvailable: true,
          confidenceScore: 0.98,
          needsReview: false,
          sortOrder: 3
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEFAULT_MODERN_BURGER: Restaurant = {
  id: 'rest-urban-grill-02',
  slug: 'urban-patty-grill',
  name: 'Urban Patty & Smash Bar',
  tagline: 'Gourmet Smashed Burgers & Craft Shakes',
  cuisineType: 'Modern Fast Food & Smash Burgers',
  currency: 'USD',
  defaultLanguage: 'en',
  phone: '+1 (555) 234-5678',
  address: '420 West 14th St, Meatpacking District, NY',
  wifiSSID: 'UrbanPatty_Free',
  wifiPass: 'smashburger2026',
  logoUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=200&q=80',
  coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  isPublished: true,
  tableCount: 16,
  theme: {
    id: 'theme-02',
    restaurantId: 'rest-urban-grill-02',
    themePreset: 'bold-street',
    primaryColor: '#DC2626', // Bold crimson
    secondaryColor: '#F59E0B', // Amber cheddar
    backgroundColor: '#0F172A', // Dark charcoal/slate
    textColor: '#F8FAFC',
    cardBgColor: '#1E293B',
    accentColor: '#EF4444',
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'xl',
    layoutStyle: 'grid-cards',
    showImages: true,
    enableBorders: true,
    moodDescription: 'Vibrant neon street diner aesthetic with bold typography and high-contrast smash cards'
  },
  categories: [
    {
      id: 'cat-burgers',
      restaurantId: 'rest-urban-grill-02',
      name: 'Signature Smash Burgers',
      description: 'Double 3.5oz Certified Angus Beef patties, smashed crisp on 450° chrome flattop.',
      sortOrder: 1,
      items: [
        {
          id: 'item-truffle-smash',
          categoryId: 'cat-burgers',
          restaurantId: 'rest-urban-grill-02',
          name: 'The Truffle Beast Smash',
          price: 16.50,
          description: 'Double crisp smashed patties, melted aged Gruyère, black truffle aioli, crispy shallots on buttered brioche.',
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['chef-special'],
          isAvailable: true,
          confidenceScore: 0.99,
          needsReview: false,
          sortOrder: 1
        },
        {
          id: 'item-smoky-bbq-bacon',
          categoryId: 'cat-burgers',
          restaurantId: 'rest-urban-grill-02',
          name: 'Smoky Bourbon Bacon Burger',
          price: 15.00,
          description: 'Applewood smoked thick-cut bacon, sharp Vermont cheddar, house bourbon BBQ glaze, beer-battered onion ring.',
          imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: [],
          isAvailable: true,
          confidenceScore: 0.96,
          needsReview: false,
          sortOrder: 2
        }
      ]
    },
    {
      id: 'cat-sides',
      restaurantId: 'rest-urban-grill-02',
      name: 'Loaded Fries & Wings',
      description: 'Double-fried Kennebec potato fries and jumbo crispy wings.',
      sortOrder: 2,
      items: [
        {
          id: 'item-parmesan-truffle-fries',
          categoryId: 'cat-sides',
          restaurantId: 'rest-urban-grill-02',
          name: 'Garlic Parmesan Truffle Fries',
          price: 8.50,
          description: 'Hand-cut russet fries tossed in white truffle oil, shaved 24-month Parmigiano-Reggiano, and chopped rosemary.',
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          isAiGeneratedImage: false,
          dietaryTags: ['vegetarian'],
          isAvailable: true,
          confidenceScore: 0.98,
          needsReview: false,
          sortOrder: 1
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read database.json, initializing defaults:', e);
    }
    const initial: DatabaseSchema = {
      restaurants: [DEFAULT_ETHIOPIAN_RESTAURANT, DEFAULT_MODERN_BURGER],
      apiKeys: [
        {
          id: 'key-dev-master',
          restaurantId: 'rest-addis-habesha-01',
          name: 'Default Master Integration Key',
          key: 'rest_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          createdAt: new Date().toISOString()
        }
      ]
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database.json:', e);
    }
  }

  // Restaurant operations
  getAllRestaurants(): Restaurant[] {
    return this.data.restaurants;
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.data.restaurants.find((r) => r.id === id);
  }

  getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.data.restaurants.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
  }

  createRestaurant(restaurant: Restaurant): Restaurant {
    // ensure unique slug
    let baseSlug = restaurant.slug || restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (this.data.restaurants.some((r) => r.slug === slug && r.id !== restaurant.id)) {
      slug = `${baseSlug}-${counter++}`;
    }
    restaurant.slug = slug;

    this.data.restaurants.unshift(restaurant);
    this.save(this.data);
    return restaurant;
  }

  updateRestaurant(id: string, updates: Partial<Restaurant>): Restaurant | null {
    const index = this.data.restaurants.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = this.data.restaurants[index];
    const updated: Restaurant = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.restaurants[index] = updated;
    this.save(this.data);
    return updated;
  }

  deleteRestaurant(id: string): boolean {
    const prevLen = this.data.restaurants.length;
    this.data.restaurants = this.data.restaurants.filter((r) => r.id !== id);
    if (this.data.restaurants.length !== prevLen) {
      this.save(this.data);
      return true;
    }
    return false;
  }

  // API Keys Management
  getApiKeys(restaurantId?: string): ApiKeyRecord[] {
    if (restaurantId && restaurantId !== 'global') {
      return this.data.apiKeys.filter((k) => k.restaurantId === restaurantId || k.restaurantId === 'global');
    }
    return this.data.apiKeys;
  }

  createApiKey(options: {
    restaurantId: string;
    name: string;
    websiteName?: string;
    websiteUrl?: string;
    serverAddress?: string;
    environment?: 'production' | 'staging' | 'development';
    permissions?: string[];
  }): ApiKeyRecord {
    const env = options.environment || 'production';
    const prefix = env === 'production' ? 'mak_live_' : 'mak_test_';
    const randPart = Buffer.from(Math.random().toString(36) + Date.now().toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
    const key = `${prefix}${randPart}`;

    const record: ApiKeyRecord = {
      id: 'key-' + Math.random().toString(36).substring(2, 9),
      restaurantId: options.restaurantId || 'global',
      name: options.name,
      websiteName: options.websiteName || options.name,
      websiteUrl: options.websiteUrl || '',
      serverAddress: options.serverAddress || '',
      environment: env,
      permissions: options.permissions && options.permissions.length > 0 
        ? options.permissions 
        : ['read:menu', 'read:items', 'read:categories', 'extract:ocr'],
      status: 'active',
      key,
      createdAt: new Date().toISOString(),
      requestCount: 0
    };

    if (!this.data.apiKeys) {
      this.data.apiKeys = [];
    }
    this.data.apiKeys.unshift(record);
    this.save(this.data);
    return record;
  }

  deleteApiKey(id: string): boolean {
    if (!this.data.apiKeys) return false;
    const prev = this.data.apiKeys.length;
    this.data.apiKeys = this.data.apiKeys.filter((k) => k.id !== id && k.key !== id);
    if (this.data.apiKeys.length !== prev) {
      this.save(this.data);
      return true;
    }
    return false;
  }

  recordApiKeyUsage(idOrKey: string): void {
    if (!this.data.apiKeys) return;
    const keyRecord = this.data.apiKeys.find((k) => k.id === idOrKey || k.key === idOrKey);
    if (keyRecord) {
      keyRecord.lastUsedAt = new Date().toISOString();
      keyRecord.requestCount = (keyRecord.requestCount || 0) + 1;
      this.save(this.data);
    }
  }

  validateApiKey(key: string): ApiKeyRecord | undefined {
    if (!this.data.apiKeys) return undefined;
    const trimmed = key.trim();
    const found = this.data.apiKeys.find((k) => k.key === trimmed && k.status !== 'revoked');
    return found;
  }
}

export const db = new Database();
