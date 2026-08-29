import { DietaryTag } from '../types/index.ts';

export interface SampleMenuPreset {
  id: string;
  name: string;
  cuisine: string;
  country: string;
  thumbnail: string;
  description: string;
  pages: {
    pageNumber: number;
    title: string;
    imageUrl: string;
  }[];
  mockExtracted: {
    restaurantName: string;
    tagline: string;
    cuisineType: string;
    currency: 'ETB' | 'USD' | 'EUR';
    suggestedTheme: 'ethiopian-cultural' | 'bold-street' | 'warm-cafe' | 'luxury-noir';
    notes: string;
    categories: {
      name: string;
      amharicName?: string;
      items: {
        name: string;
        amharicName?: string;
        price: number;
        description: string;
        dietaryTags: DietaryTag[];
        confidenceScore: number;
        needsReview: boolean;
        originalText: string;
        imageUrl?: string;
      }[];
    }[];
  };
}

export const SAMPLE_MENUS: SampleMenuPreset[] = [
  {
    id: 'sample-ethiopian',
    name: 'Habesha Traditional Feast',
    cuisine: 'Ethiopian Cultural Restaurant',
    country: 'Addis Ababa, Ethiopia (ETB)',
    thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    description: 'Bilingual English & Ge\'ez paper menu featuring Tibs, Doro Wat, Beyaynetu, and Traditional Buna.',
    pages: [
      {
        pageNumber: 1,
        title: 'Mains & Traditional Specials',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
      }
    ],
    mockExtracted: {
      restaurantName: 'Addis Heritage Traditional Kitchen',
      tagline: 'Authentic Spiced Cuisine & Organic Teff Injera',
      cuisineType: 'Ethiopian Traditional',
      currency: 'ETB',
      suggestedTheme: 'ethiopian-cultural',
      notes: 'Clean scan. Ge\'ez and English typography detected.',
      categories: [
        {
          name: 'Special Traditional Mains (ልዩ የባህል ምግቦች)',
          amharicName: 'ልዩ የባህል ምግቦች',
          items: [
            {
              name: 'Special Doro Wat with Farm Egg',
              amharicName: 'ልዩ የዶሮ ወጥ ከእንቁላል ጋር',
              price: 750,
              description: 'Slow-simmered organic chicken in caramelized onions and berbere stew.',
              dietaryTags: ['spicy', 'chef-special', 'halal'],
              confidenceScore: 0.99,
              needsReview: false,
              originalText: 'Special Doro Wat w/ Egg - 750 ETB',
              imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Clay Pot Shekla Tibs',
              amharicName: 'የሸክላ ጥብስ',
              price: 720,
              description: 'Prime beef sauteed with fresh rosemary, garlic, and jalapeños on charcoal.',
              dietaryTags: ['spicy'],
              confidenceScore: 0.98,
              needsReview: false,
              originalText: 'Shekla Tibs (Beef) - 720 ETB',
              imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Grand Fasting Beyaynetu',
              amharicName: 'የፆም በያይነቱ',
              price: 490,
              description: 'Assortment of 8 vegan fasting dishes: Shiro, Misir, Gomen, Kik Alicha, and Fosolia.',
              dietaryTags: ['vegan', 'fasting', 'vegetarian'],
              confidenceScore: 0.98,
              needsReview: false,
              originalText: 'Fasting Beyaynetu (8 dishes) - 490 ETB',
              imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
            }
          ]
        },
        {
          name: 'Coffee Ceremony & Beverages (ቡና እና መጠጦች)',
          amharicName: 'ቡና እና መጠጦች',
          items: [
            {
              name: 'Jebena Buna Coffee Ceremony',
              amharicName: 'የጀበና ቡና ስነስርዓት',
              price: 180,
              description: 'Traditional 3-step clay brew with frankincense, kolo roasted barley, and popcorn.',
              dietaryTags: ['vegan'],
              confidenceScore: 0.99,
              needsReview: false,
              originalText: 'Jebena Buna Ceremony - 180 ETB',
              imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Triple Layer Spris Juice',
              amharicName: 'ስፕሪስ ጁስ',
              price: 220,
              description: 'Fresh blended Avocado, Mango, and Papaya juice layers.',
              dietaryTags: ['vegan', 'fasting'],
              confidenceScore: 0.96,
              needsReview: false,
              originalText: 'Spris Juice (Avo/Mango/Papaya) - 220 ETB',
              imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'sample-burger-bar',
    name: 'Sizzle & Smash Burger Bar',
    cuisine: 'Gourmet Smash Burgers & Shakes',
    country: 'New York, USA (USD)',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    description: 'Contemporary double-sided burger menu with sides, sauces, craft brews, and shakes.',
    pages: [
      {
        pageNumber: 1,
        title: 'Smash Burgers & Loaded Fries',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
      }
    ],
    mockExtracted: {
      restaurantName: 'Sizzle & Smash Bar',
      tagline: 'Fresh Griddled Smashed Patties & Crisp Fries',
      cuisineType: 'Fast Casual Burgers',
      currency: 'USD',
      suggestedTheme: 'bold-street',
      notes: 'Menu scanned cleanly. Currency verified as USD.',
      categories: [
        {
          name: 'Double Smash Burgers',
          items: [
            {
              name: 'Classic Bacon Cheddar Smash',
              price: 14.50,
              description: 'Crispy lacy edges, double American cheese, applewood bacon, special smash sauce.',
              dietaryTags: ['chef-special'],
              confidenceScore: 0.99,
              needsReview: false,
              originalText: 'Bacon Cheddar Smash $14.50',
              imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Jalapeño Inferno Burger',
              price: 15.00,
              description: 'Pepper jack, charred jalapeños, spicy habanero ranch, crispy onion straws.',
              dietaryTags: ['spicy'],
              confidenceScore: 0.97,
              needsReview: false,
              originalText: 'Jalapeno Inferno $15.00',
              imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
            }
          ]
        },
        {
          name: 'Sides & Shakes',
          items: [
            {
              name: 'Truffle Herb Fries',
              price: 7.50,
              description: 'Sea salt, white truffle oil, grated parmesan, fresh rosemary.',
              dietaryTags: ['vegetarian'],
              confidenceScore: 0.98,
              needsReview: false,
              originalText: 'Truffle Herb Fries $7.50',
              imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Salted Caramel Pretzel Shake',
              price: 8.00,
              description: 'Hand-spun Madagascar vanilla gelato, house sea salt caramel, crushed butter pretzels.',
              dietaryTags: ['vegetarian'],
              confidenceScore: 0.95,
              needsReview: false,
              originalText: 'Salted Caramel Pretzel Shake $8.00',
              imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'sample-cafe-bistro',
    name: 'Artisan Roast & Botanical Cafe',
    cuisine: 'Specialty Coffee & Brunch',
    country: 'London / Paris (EUR)',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    description: 'Minimalist cafe menu with pour-overs, organic sourdough toasts, and matcha lattes.',
    pages: [
      {
        pageNumber: 1,
        title: 'Coffee & Brunch Menu',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
      }
    ],
    mockExtracted: {
      restaurantName: 'Botanical Roastery & Brunch',
      tagline: 'Single Origin Espresso & Sourdough Kitchen',
      cuisineType: 'Specialty Coffee & Bistro',
      currency: 'EUR',
      suggestedTheme: 'warm-cafe',
      notes: 'Clear minimal layout detected.',
      categories: [
        {
          name: 'Specialty Coffee & Matcha',
          items: [
            {
              name: 'Ethiopian Yirgacheffe Pour Over (V60)',
              price: 5.50,
              description: 'Washed process with floral jasmine notes, bergamot, and sweet peach finish.',
              dietaryTags: ['vegan'],
              confidenceScore: 0.99,
              needsReview: false,
              originalText: 'Yirgacheffe V60 - €5.50',
              imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Ceremonial Uji Matcha Latte',
              price: 6.00,
              description: 'Stone-ground Japanese matcha whisked with organic oat milk and raw agave.',
              dietaryTags: ['vegan'],
              confidenceScore: 0.98,
              needsReview: false,
              originalText: 'Ceremonial Matcha Latte - €6.00',
              imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80'
            }
          ]
        },
        {
          name: 'Brunch & Artisan Bakery',
          items: [
            {
              name: 'Avocado Tartine on Spelt Sourdough',
              price: 11.50,
              description: 'Smashed Hass avocado, pickled shallots, dukkah crunch, chili flakes, microgreens.',
              dietaryTags: ['vegan', 'organic'],
              confidenceScore: 0.98,
              needsReview: false,
              originalText: 'Avocado Tartine - €11.50',
              imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    }
  }
];
