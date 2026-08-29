/**
 * Comprehensive Culinary Image Dictionary & Intelligent Food Image Matcher
 * Maps Ethiopian, Eritrean, and Global culinary dish names, Amharic translations,
 * and categories to high-resolution, vivid food photography.
 */

export interface FoodImageMapping {
  keywords: string[];
  imageUrl: string;
  categoryHint?: string;
}

// Curated high-resolution food photography for specific dishes
export const CULINARY_IMAGE_COLLECTION: FoodImageMapping[] = [
  // --- ETHIOPIAN & ERITREAN SPECIALTIES ---
  {
    keywords: ['doro', 'doro wat', 'doro wot', 'ዶሮ', 'ዶሮ ወጥ', 'chicken wat', 'dorowat'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Traditional'
  },
  {
    keywords: ['shekla tibs', 'derek tibs', 'awaze tibs', 'tibs', 'ጥብስ', 'የሸክላ ጥብስ', 'የለመለመ ጥብስ', 'የቁንጣ ጥብስ'],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Traditional'
  },
  {
    keywords: ['kitfo', 'ክትፎ', 'ጎረድ ጎረድ', 'gored gored', 'lebleb', 'special kitfo', 'ክትፎ በቅቤ'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Traditional'
  },
  {
    keywords: ['shiro', 'ሽሮ', 'ሽሮ ተጋቢኖ', 'shiro tegabino', 'shiro bozena', 'shiro mitten', 'ሽሮ ፍትፍት'],
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Fasting'
  },
  {
    keywords: ['beyaynetu', 'በያይነቱ', 'የጾም በያይነቱ', 'fasting platter', 'veggie combo', 'injera platter', 'mahabrawi', 'ማህበራዊ'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Fasting'
  },
  {
    keywords: ['firfir', 'fitfit', 'ፍርፍር', 'ፍትፍት', 'ቋንጣ ፍርፍር', 'kuanta firfir', 'tibs firfir', 'quanta firfir'],
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Breakfast'
  },
  {
    keywords: ['chechebsa', 'ጨጨብሳ', 'ኪታ ፍርፍር', 'kita firfir', 'kitta'],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Breakfast'
  },
  {
    keywords: ['dulet', 'ዱለት', 'የበግ ዱለት', 'የከብት ዱለት'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Traditional'
  },
  {
    keywords: ['sambusa', 'ሳምቡሳ', 'samosa', 'lentil sambusa', 'meat sambusa'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Appetizers'
  },
  {
    keywords: ['genfo', 'ገንፎ', 'የገብስ ገንፎ', 'bula', 'ቡላ'],
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Breakfast'
  },
  {
    keywords: ['gomen', 'ጎመን', 'kik alicha', 'ክክ አልጫ', 'misir', 'ምስር', 'atkilt', 'አትክልት'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Vegetarian'
  },
  {
    keywords: ['ethiopian coffee', 'buna', 'ቡና', 'የጀበና ቡና', 'jebena buna', 'coffee ceremony'],
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['spris', 'ስፕሪስ', 'special juice', 'layered juice', 'avocado mango', 'fresh juice', 'ጭማቂ'],
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['tej', 'ጠጅ', 'honey wine'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },

  // --- BURGERS & SANDWICHES ---
  {
    keywords: ['cheeseburger', 'burger', 'hamburger', 'beef burger', 'smash burger', 'በርገር'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Burgers'
  },
  {
    keywords: ['chicken burger', 'crispy chicken', 'fried chicken sandwich', 'zinger'],
    imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Burgers'
  },
  {
    keywords: ['club sandwich', 'sandwich', 'panini', 'wrap', 'ሳንድዊች'],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Sandwiches'
  },
  {
    keywords: ['shawarma', 'shwarma', 'doner', 'gyro', 'ሻዋርማ', 'የዶሮ ሻዋርማ', 'የስጋ ሻዋርማ'],
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Sandwiches'
  },

  // --- PIZZAS & ITALIAN ---
  {
    keywords: ['margherita', 'cheese pizza', 'margherita pizza', 'ፒዛ'],
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Pizza'
  },
  {
    keywords: ['pepperoni', 'pepperoni pizza', 'meat pizza', 'supreme pizza'],
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Pizza'
  },
  {
    keywords: ['pasta', 'spaghetti', 'carbonara', 'bolognese', 'ፓስታ', 'ስፓጌቲ'],
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Pasta'
  },
  {
    keywords: ['lasagna', 'lasagne', 'ላዛኛ'],
    imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Pasta'
  },
  {
    keywords: ['alfredo', 'fettuccine', 'penne', 'macaroni', 'ravioli'],
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Pasta'
  },

  // --- MEATS, STEAKS & GRILLS ---
  {
    keywords: ['steak', 'ribeye', 'sirloin', 'beef tenderloin', 't-bone', 'ስቴክ'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Grill'
  },
  {
    keywords: ['grilled chicken', 'roasted chicken', 'roast chicken', 'bbq chicken'],
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Grill'
  },
  {
    keywords: ['bbq ribs', 'ribs', 'lamb chops', 'kebab', 'kebabs', 'mixed grill'],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Grill'
  },

  // --- SEAFOOD & FISH ---
  {
    keywords: ['fish', 'tilapia', 'asa', 'ዓሳ', 'የተጠበሰ ዓሳ', 'grilled fish', 'fried fish'],
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Seafood'
  },
  {
    keywords: ['salmon', 'grilled salmon', 'seafood paella', 'tuna', 'shrimp', 'prawns', 'calamari'],
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Seafood'
  },

  // --- SALADS & SOUPS ---
  {
    keywords: ['salad', 'caesar salad', 'greek salad', 'garden salad', 'ሰላጣ'],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Salads'
  },
  {
    keywords: ['soup', 'cream of mushroom', 'lentil soup', 'chicken soup', 'መረቅ', 'ሾርባ'],
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Soups'
  },

  // --- APPETIZERS & SIDES ---
  {
    keywords: ['french fries', 'fries', 'chips', 'potato wedges', 'ድንች ጥብስ'],
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Sides'
  },
  {
    keywords: ['chicken wings', 'buffalo wings', 'wings', 'nuggets'],
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Appetizers'
  },
  {
    keywords: ['hummus', 'falafel', 'pita bread', 'nachos', 'bruschetta'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Appetizers'
  },

  // --- BREAKFAST & EGGS ---
  {
    keywords: ['omelette', 'omelet', 'scrambled eggs', 'fried eggs', 'እንቁላል ፍርፍር', 'እንቁላል'],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Breakfast'
  },
  {
    keywords: ['pancake', 'pancakes', 'waffles', 'french toast', 'croissant'],
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Breakfast'
  },

  // --- DESSERTS & SWEETS ---
  {
    keywords: ['cheesecake', 'cake', 'chocolate cake', 'lava cake', 'ኬክ', 'tiramisu', 'brownie'],
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Desserts'
  },
  {
    keywords: ['ice cream', 'gelato', 'sundae', 'አይስ ክሬም', 'fruit salad'],
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Desserts'
  },
  {
    keywords: ['baklava', 'pastry', 'churros', 'tarts', 'donut', 'doughnut'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Desserts'
  },

  // --- BEVERAGES & DRINKS ---
  {
    keywords: ['cappuccino', 'latte', 'espresso', 'macchiato', 'ማኪያቶ', 'ካፑቺኖ', 'black coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['tea', 'chai', 'shai', 'ሻይ', 'green tea', 'herbal tea'],
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['smoothie', 'mango juice', 'avocado juice', 'orange juice', 'lemonade', 'ጭማቂ', 'ብርቱካን'],
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['mojito', 'cocktail', 'mocktail', 'margarita', 'cocktails'],
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  },
  {
    keywords: ['beer', 'draft beer', 'craft beer', 'wine', 'red wine', 'white wine', 'ቢራ', 'ወይን'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Beverages'
  }
];

// Fallback high-quality food image categories if no direct keyword matches
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  traditional: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  ethiopian: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  habesha: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  mains: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=800&q=80',
  appetizers: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  starters: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  sides: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
  salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  soups: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  sweets: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  beverages: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  drinks: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
  coffee: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
  fasting: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  vegetarian: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  grill: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_GOURMET_DISH_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

/**
 * Intelligent matcher that assigns a gorgeous, authentic food photo to any dish name.
 */
export function getFoodImageForDish(
  dishName: string,
  categoryName?: string,
  cuisineType?: string,
  amharicName?: string
): string {
  const combined = `${dishName || ''} ${amharicName || ''} ${categoryName || ''} ${cuisineType || ''}`.toLowerCase();

  // 1. Direct keyword search across the rich curated collection
  for (const item of CULINARY_IMAGE_COLLECTION) {
    for (const kw of item.keywords) {
      if (combined.includes(kw.toLowerCase())) {
        return item.imageUrl;
      }
    }
  }

  // 2. Category fallback matching
  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (catLower.includes(key)) {
        return url;
      }
    }
  }

  // 3. Cuisine fallback matching
  if (cuisineType) {
    const cuisLower = cuisineType.toLowerCase();
    if (cuisLower.includes('ethiopian') || cuisLower.includes('habesha') || cuisLower.includes('cultural')) {
      return CATEGORY_FALLBACK_IMAGES.ethiopian;
    }
    if (cuisLower.includes('cafe') || cuisLower.includes('bakery')) {
      return CATEGORY_FALLBACK_IMAGES.coffee;
    }
    if (cuisLower.includes('burger')) {
      return CATEGORY_FALLBACK_IMAGES.burgers;
    }
    if (cuisLower.includes('pizza') || cuisLower.includes('italian')) {
      return CATEGORY_FALLBACK_IMAGES.pizza;
    }
  }

  // 4. Default high-end gourmet plating photo
  return DEFAULT_GOURMET_DISH_IMAGE;
}
