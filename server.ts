import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import QRCode from 'qrcode';
import { db } from './src/server/db.ts';
import { extractMenuFromImages, generateThemeWithAI, generateFoodImagePrompt } from './src/server/ai.ts';
import { Restaurant, Category, MenuItem, MenuTheme, ThemePreset } from './src/types/index.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support high-resolution camera captures and multi-page menu uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Cross-Origin Resource Sharing (CORS) and iframe embed permissions
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization');
    
    // Explicitly allow embedding inside iframes and mobile webviews across all external domains
    res.removeHeader('X-Frame-Options');
    res.header('Content-Security-Policy', "frame-ancestors *;");

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Middleware for API Key verification and usage recording on v1 routes
  app.use('/api/v1', (req, res, next) => {
    // Check for API key in headers, Bearer authorization, or query params
    let apiKey = (req.headers['x-api-key'] || req.headers['x-apikey']) as string;
    if (!apiKey && req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        apiKey = authHeader.substring(7).trim();
      } else {
        apiKey = authHeader.trim();
      }
    }
    if (!apiKey && (req.query.api_key || req.query.apiKey || req.query.key)) {
      apiKey = (req.query.api_key || req.query.apiKey || req.query.key) as string;
    }

    if (apiKey) {
      const record = db.validateApiKey(apiKey);
      if (!record && !apiKey.startsWith('demo-') && !apiKey.startsWith('test-') && apiKey !== 'sample_key') {
        res.status(401).json({ 
          status: 401, 
          error: 'Unauthorized: Invalid or revoked API Key',
          message: 'The provided API key is invalid or inactive. Please generate a valid production key from the MenuAI Embed & Connect Studio.'
        });
        return;
      }
      if (record) {
        db.recordApiKeyUsage(record.id);
        (req as any).apiKeyRecord = record;
      }
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. AI Vision OCR Extraction endpoint
  app.post('/api/menu/extract', async (req, res) => {
    try {
      const { images } = req.body; // Array of { data: string (base64), mimeType: string }
      if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({ error: 'No menu images provided for OCR analysis.' });
        return;
      }

      const extracted = await extractMenuFromImages(images);
      res.json({ success: true, data: extracted });
    } catch (error: any) {
      console.error('Menu extraction endpoint error:', error);
      res.status(500).json({ 
        error: error?.message || 'Failed to extract menu via AI Vision OCR. Please verify your photo is clear and try again.' 
      });
    }
  });

  // 2. AI Theme Generator endpoint
  app.post('/api/theme/generate', async (req, res) => {
    try {
      const { restaurantName, cuisineType, vibePrompt } = req.body;
      const theme = await generateThemeWithAI(
        restaurantName || 'Gourmet Restaurant',
        cuisineType || 'Contemporary Dining',
        vibePrompt
      );
      res.json({ success: true, theme });
    } catch (error: any) {
      console.error('Theme generation error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate AI theme.' });
    }
  });

  // 3. AI Food Image Generator endpoint (both /api/ai/food-image and /api/food/generate-photo)
  app.post('/api/ai/food-image', async (req, res) => {
    try {
      const { itemName, name, description, cuisine } = req.body;
      const result = await generateFoodImagePrompt(itemName || name || 'Specialty Dish', description || '', cuisine || 'Gourmet');
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Food image generation error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate food photo.' });
    }
  });

  app.post('/api/food/generate-photo', async (req, res) => {
    try {
      const { itemName, name, description, cuisine } = req.body;
      const result = await generateFoodImagePrompt(itemName || name || 'Specialty Dish', description || '', cuisine || 'Gourmet');
      res.json({ success: true, imageUrl: result.imageUrl });
    } catch (error: any) {
      console.error('Food photo error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate food photo.' });
    }
  });

  // 4. Restaurant CRUD & Save / Reset Helpers
  app.get('/api/restaurants', (req, res) => {
    const list = db.getAllRestaurants();
    res.json({ success: true, restaurants: list });
  });

  app.get('/api/restaurants/:id', (req, res) => {
    const restaurant = db.getRestaurantById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json({ success: true, restaurant });
  });

  // Universal Upsert Save Endpoint
  app.post('/api/restaurant/save', (req, res) => {
    try {
      const { restaurant } = req.body;
      const payload: Restaurant = restaurant || req.body;
      if (!payload.name) {
        res.status(400).json({ error: 'Restaurant name is required.' });
        return;
      }

      if (!payload.id) {
        payload.id = 'rest-' + Math.random().toString(36).substring(2, 9);
      }
      if (!payload.categories) {
        payload.categories = [];
      }

      const existing = db.getRestaurantById(payload.id);
      if (existing) {
        const updated = db.updateRestaurant(payload.id, payload);
        res.json({ success: true, restaurant: updated });
      } else {
        const created = db.createRestaurant(payload);
        res.status(201).json({ success: true, restaurant: created });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Clear demo data / create clean blank menu
  app.post('/api/restaurant/blank', (req, res) => {
    try {
      const { name = 'My Restaurant', cuisineType = 'Dining & Cafe', currency = 'ETB' } = req.body;
      const restId = 'rest-' + Math.random().toString(36).substring(2, 9);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-menu';
      
      const blankRestaurant: Restaurant = {
        id: restId,
        slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
        name,
        tagline: 'Fresh & Handcrafted Specialties',
        cuisineType,
        currency: currency as any,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'am'],
        isPublished: true,
        theme: {
          id: 'theme-' + restId,
          restaurantId: restId,
          themePreset: 'modern-bento',
          primaryColor: '#c2410c',
          secondaryColor: '#ea580c',
          backgroundColor: '#F9FAF8',
          textColor: '#1A1A1A',
          cardBgColor: '#FFFFFF',
          accentColor: '#fb923c',
          fontHeading: 'Plus Jakarta Sans',
          fontBody: 'Plus Jakarta Sans',
          borderRadius: 'lg',
          layoutStyle: 'bento',
          showImages: true,
          enableBorders: true,
          moodDescription: 'Warm, modern, authentic dining atmosphere'
        },
        categories: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = db.createRestaurant(blankRestaurant);
      res.status(201).json({ success: true, restaurant: created });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/restaurants', (req, res) => {
    try {
      const payload: Restaurant = req.body;
      if (!payload.name) {
        res.status(400).json({ error: 'Restaurant name is required.' });
        return;
      }
      
      if (!payload.id) {
        payload.id = 'rest-' + Math.random().toString(36).substring(2, 9);
      }
      if (!payload.categories) {
        payload.categories = [];
      }
      if (!payload.createdAt) {
        payload.createdAt = new Date().toISOString();
      }
      payload.updatedAt = new Date().toISOString();

      const created = db.createRestaurant(payload);
      res.status(201).json({ success: true, restaurant: created });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/restaurants/:id', (req, res) => {
    try {
      const updated = db.updateRestaurant(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      res.json({ success: true, restaurant: updated });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/restaurants/:id', (req, res) => {
    const ok = db.deleteRestaurant(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json({ success: true, message: 'Restaurant deleted successfully.' });
  });

  // 5. Public digital menu endpoint by slug
  app.get('/api/public/menu/:slug', (req, res) => {
    const restaurant = db.getRestaurantBySlug(req.params.slug);
    if (!restaurant) {
      res.status(404).json({ error: 'Menu not found for this restaurant slug.' });
      return;
    }
    res.json({ success: true, menu: restaurant });
  });

  // 6. QR Code Generation endpoint (SVG or Data URL)
  app.get('/api/qr/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const format = (req.query.format as string) || 'png'; // png | svg | dataurl
      const color = (req.query.color as string) || '#000000';
      const bg = (req.query.bg as string) || '#FFFFFF';

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const targetUrl = `${protocol}://${host}/menu/${slug}`;

      if (format === 'svg') {
        const svgString = await QRCode.toString(targetUrl, {
          type: 'svg',
          color: { dark: color, light: bg },
          margin: 2
        });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svgString);
        return;
      }

      // Default PNG stream
      res.setHeader('Content-Type', 'image/png');
      const buffer = await QRCode.toBuffer(targetUrl, {
        type: 'png',
        width: 600,
        margin: 2,
        color: { dark: color, light: bg }
      });
      res.send(buffer);
    } catch (e: any) {
      console.error('QR code generation error:', e);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });

  // 7. API Keys management (Admin internal endpoints)
  app.get('/api/apikeys', (req, res) => {
    const restaurantId = req.query.restaurantId as string;
    const keys = db.getApiKeys(restaurantId);
    res.json({ success: true, keys });
  });

  app.post('/api/apikeys', (req, res) => {
    const { 
      restaurantId, 
      name, 
      websiteName, 
      websiteUrl, 
      serverAddress, 
      environment, 
      permissions 
    } = req.body;
    
    if (!name && !websiteName) {
      res.status(400).json({ error: 'API key name or website name is required' });
      return;
    }
    const created = db.createApiKey({
      restaurantId: restaurantId || 'global',
      name: name || websiteName,
      websiteName: websiteName || name,
      websiteUrl,
      serverAddress,
      environment: environment || 'production',
      permissions
    });
    res.status(201).json({ success: true, apiKey: created });
  });

  app.delete('/api/apikeys/:id', (req, res) => {
    const ok = db.deleteApiKey(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }
    res.json({ success: true, message: 'API key deleted successfully' });
  });

  // ==========================================
  // REST API v1 (For External Web Servers, Mobile Apps, POS)
  // ==========================================

  // Ping / Health Check
  app.get('/api/v1/ping', (req, res) => {
    res.json({
      status: 200,
      success: true,
      message: 'MenuAI REST API v1 is online and operational',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Verify an API Key & get caller permissions
  app.get('/api/v1/apikeys/verify', (req, res) => {
    const record = (req as any).apiKeyRecord;
    if (!record) {
      res.status(400).json({ 
        status: 400, 
        valid: false, 
        error: 'No valid API key was found in request headers (x-api-key or Authorization Bearer).' 
      });
      return;
    }
    res.json({
      status: 200,
      valid: true,
      data: {
        keyId: record.id,
        name: record.name,
        websiteName: record.websiteName,
        websiteUrl: record.websiteUrl,
        serverAddress: record.serverAddress,
        environment: record.environment,
        permissions: record.permissions,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
        requestCount: record.requestCount
      }
    });
  });

  // Get all restaurants
  app.get('/api/v1/restaurants', (req, res) => {
    const restaurants = db.getAllRestaurants().map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      cuisineType: r.cuisineType,
      currency: r.currency,
      phone: r.phone,
      address: r.address,
      itemCount: r.categories ? r.categories.reduce((acc, c) => acc + (c.items?.length || 0), 0) : 0,
      categoryCount: r.categories ? r.categories.length : 0,
      isPublished: r.isPublished,
      publicMenuUrl: `/menu/${r.slug}`,
      apiUrl: `/api/v1/menus/${r.slug}`
    }));
    res.json({ status: 200, count: restaurants.length, data: restaurants });
  });

  // Get restaurant by ID or slug
  app.get('/api/v1/restaurants/:idOrSlug', (req, res) => {
    const param = req.params.idOrSlug;
    const restaurant = db.getRestaurantById(param) || db.getRestaurantBySlug(param);
    if (!restaurant) {
      res.status(404).json({ status: 404, error: 'Restaurant not found' });
      return;
    }
    res.json({ status: 200, data: restaurant });
  });

  // Get full structured menu (supports both /api/v1/menus/:slug and /api/v1/menu/:slug)
  const handleGetMenuBySlug = (req: express.Request, res: express.Response) => {
    const slug = req.params.slug;
    const restaurant = db.getRestaurantBySlug(slug) || db.getRestaurantById(slug);
    if (!restaurant) {
      res.status(404).json({ 
        status: 404, 
        error: 'Restaurant menu not found',
        message: `No active restaurant menu exists for slug '${slug}'. Check available menus at /api/v1/restaurants.`
      });
      return;
    }
    res.json({
      status: 200,
      success: true,
      data: {
        restaurant: {
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
          tagline: restaurant.tagline,
          cuisineType: restaurant.cuisineType,
          currency: restaurant.currency,
          phone: restaurant.phone,
          address: restaurant.address,
          wifiSSID: restaurant.wifiSSID,
          logoUrl: restaurant.logoUrl,
          coverImageUrl: restaurant.coverImageUrl,
          defaultLanguage: restaurant.defaultLanguage || 'en',
          supportedLanguages: restaurant.supportedLanguages || ['en', 'am']
        },
        theme: restaurant.theme,
        categories: restaurant.categories || [],
        meta: {
          totalCategories: restaurant.categories?.length || 0,
          totalItems: restaurant.categories?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0,
          updatedAt: restaurant.updatedAt || restaurant.createdAt
        }
      }
    });
  };

  app.get('/api/v1/menus/:slug', handleGetMenuBySlug);
  app.get('/api/v1/menu/:slug', handleGetMenuBySlug);

  // Get items list with optional category & dietary filter
  const handleGetMenuItems = (req: express.Request, res: express.Response) => {
    const slug = req.params.slug;
    const restaurant = db.getRestaurantBySlug(slug) || db.getRestaurantById(slug);
    if (!restaurant) {
      res.status(404).json({ status: 404, error: 'Restaurant menu not found' });
      return;
    }

    const { category, dietary, search, available } = req.query;
    let allItems: Array<MenuItem & { categoryName: string; categoryAmharicName?: string }> = [];

    (restaurant.categories || []).forEach((cat) => {
      if (category && cat.id !== category && cat.name.toLowerCase() !== String(category).toLowerCase()) {
        return;
      }
      (cat.items || []).forEach((item) => {
        allItems.push({
          ...item,
          categoryName: cat.name,
          categoryAmharicName: cat.amharicName
        });
      });
    });

    if (dietary) {
      const tag = String(dietary).toLowerCase();
      allItems = allItems.filter((item) => 
        item.dietaryTags && item.dietaryTags.some((t) => t.toLowerCase() === tag)
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      allItems = allItems.filter((item) => 
        item.name.toLowerCase().includes(q) || 
        (item.amharicName && item.amharicName.includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (available === 'true') {
      allItems = allItems.filter((item) => item.isAvailable !== false);
    }

    res.json({
      status: 200,
      success: true,
      currency: restaurant.currency,
      count: allItems.length,
      data: allItems
    });
  };

  app.get('/api/v1/menus/:slug/items', handleGetMenuItems);
  app.get('/api/v1/menu/:slug/items', handleGetMenuItems);

  // Get categories list only
  const handleGetMenuCategories = (req: express.Request, res: express.Response) => {
    const slug = req.params.slug;
    const restaurant = db.getRestaurantBySlug(slug) || db.getRestaurantById(slug);
    if (!restaurant) {
      res.status(404).json({ status: 404, error: 'Restaurant not found' });
      return;
    }

    const categories = (restaurant.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      amharicName: c.amharicName,
      oromoName: c.oromoName,
      description: c.description,
      itemCount: c.items?.length || 0
    }));

    res.json({
      status: 200,
      success: true,
      count: categories.length,
      data: categories
    });
  };

  app.get('/api/v1/menus/:slug/categories', handleGetMenuCategories);
  app.get('/api/v1/menu/:slug/categories', handleGetMenuCategories);

  // Programmatic AI OCR Extraction for external servers
  app.post('/api/v1/menus/extract-ocr', async (req, res) => {
    try {
      const { images } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({ status: 400, error: 'No menu images provided in body { images: [...] }' });
        return;
      }
      const extracted = await extractMenuFromImages(images);
      res.json({ status: 200, success: true, data: extracted });
    } catch (e: any) {
      res.status(500).json({ status: 500, error: e.message || 'OCR Extraction failed' });
    }
  });

  // VITE / STATIC MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
