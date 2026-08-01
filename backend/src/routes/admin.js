const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../public/uploads');
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  // In serverless/read-only environments creating local upload directories may fail.
  // It's safe to ignore — uploads are stored in the database for production.
  // eslint-disable-next-line no-console
  console.warn('Could not create upload directory, continuing without local uploads:', err && err.message);
}

// Configure Cloudinary from env (CLOUDINARY_URL or individual vars)
cloudinary.config(process.env.CLOUDINARY_URL ? undefined : {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage and stream uploads to Cloudinary so hosted deployments work
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

function issueAdminToken(admin, secret) {
  return jwt.sign(
    { sub: admin._id.toString(), email: admin.email, role: admin.role },
    secret,
    { expiresIn: '12h' }
  );
}

function getDevelopmentAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  if (!email || !password) return null;
  return { _id: new ObjectId('000000000000000000000001'), email, password, role: 'admin' };
}

function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const normalizedEmail = email.toLowerCase();
    let admin = null;
    let databaseAvailable = true;

    try {
      const db = await getDb();
      admin = await db.collection('users').findOne({ email: normalizedEmail, role: 'admin' });
    } catch {
      databaseAvailable = false;
    }

    if (!admin && !databaseAvailable) {
      const devAdmin = getDevelopmentAdmin();
      if (!devAdmin || devAdmin.email !== normalizedEmail || devAdmin.password !== password)
        return res.status(401).json({ message: 'Invalid admin credentials.' });
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
      return res.json({ token: issueAdminToken(devAdmin, secret), admin: { id: devAdmin._id, email: devAdmin.email, role: devAdmin.role } });
    }

    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials.' });

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) return res.status(401).json({ message: 'Invalid admin credentials.' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT_SECRET is not configured.' });

    res.json({ token: issueAdminToken(admin, secret), admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (error) { next(error); }
});

router.get('/me', requireAdmin, (req, res) => res.json({ admin: req.admin }));

router.post('/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }

  // Store the image in MongoDB `images` collection and return a stable URL
  try {
    const db = await getDb();
    const ext = path.extname(req.file.originalname || '.png');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const doc = {
      filename,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      createdAt: new Date(),
    };
    const result = await db.collection('images').insertOne(doc);
    const id = result.insertedId.toString();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/api/uploads/${id}`;
    return res.json({ url, id });
  } catch (err) {
    return res.status(500).json({ message: 'Saving upload to database failed.', detail: err.message });
  }
});

// ── Categories ───────────────────────────────────────────────────────────────

router.get('/categories', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    res.json(await db.collection('categories').find({}).sort({ name: 1 }).toArray());
  } catch (error) { next(error); }
});

router.post('/categories', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl, slug } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });
    const db = await getDb();
    const result = await db.collection('categories').insertOne({
      name, description: description || '', imageUrl: imageUrl || '',
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(), updatedAt: new Date(),
    });
    res.status(201).json(await db.collection('categories').findOne({ _id: result.insertedId }));
  } catch (error) { next(error); }
});

router.put('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const categoryId = toObjectId(req.params.id);
    if (!categoryId) return res.status(400).json({ message: 'Invalid category id.' });
    const { name, description, imageUrl, slug } = req.body;
    const db = await getDb();
    const result = await db.collection('categories').updateOne(
      { _id: categoryId },
      { $set: { ...(name !== undefined && { name }), ...(description !== undefined && { description }), ...(imageUrl !== undefined && { imageUrl }), ...(slug !== undefined && { slug }), updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Category not found.' });
    res.json(await db.collection('categories').findOne({ _id: categoryId }));
  } catch (error) { next(error); }
});

router.delete('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const categoryId = toObjectId(req.params.id);
    if (!categoryId) return res.status(400).json({ message: 'Invalid category id.' });
    const db = await getDb();
    const productCount = await db.collection('products').countDocuments({ categoryId });
    if (productCount > 0)
      return res.status(409).json({ message: `Cannot delete category. It has ${productCount} product(s). Delete all products first.` });
    const result = await db.collection('categories').deleteOne({ _id: categoryId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Category not found.' });
    res.status(204).send();
  } catch (error) { next(error); }
});

// ── Products ─────────────────────────────────────────────────────────────────

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    res.json(await db.collection('products').find({}).sort({ name: 1 }).toArray());
  } catch (error) { next(error); }
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, categoryId, imageUrl, featured, status, price, subCategory } = req.body;
    if (!name || !description || !categoryId)
      return res.status(400).json({ message: 'Name, description, and categoryId are required.' });
    const categoryObjectId = toObjectId(categoryId);
    if (!categoryObjectId) return res.status(400).json({ message: 'Invalid categoryId.' });
    const db = await getDb();
    const result = await db.collection('products').insertOne({
      name, description, categoryId: categoryObjectId,
      subCategory: subCategory || '',
      imageUrl: imageUrl || '',
      price: price != null && price !== '' ? Number(price) : null,
      featured: Boolean(featured),
      status: status || 'active',
      createdAt: new Date(), updatedAt: new Date(),
    });
    res.status(201).json(await db.collection('products').findOne({ _id: result.insertedId }));
  } catch (error) { next(error); }
});

router.put('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const productId = toObjectId(req.params.id);
    if (!productId) return res.status(400).json({ message: 'Invalid product id.' });
    const { name, description, categoryId, imageUrl, featured, status, price, subCategory } = req.body;
    const db = await getDb();
    const normalizedCategoryId = categoryId !== undefined ? toObjectId(categoryId) : undefined;
    if (categoryId !== undefined && !normalizedCategoryId)
      return res.status(400).json({ message: 'Invalid categoryId.' });
    const result = await db.collection('products').updateOne(
      { _id: productId },
      { $set: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(normalizedCategoryId !== undefined && { categoryId: normalizedCategoryId }),
        ...(subCategory !== undefined && { subCategory }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(status !== undefined && { status }),
        ...(price !== undefined && { price: price != null && price !== '' ? Number(price) : null }),
        updatedAt: new Date(),
      }}
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(await db.collection('products').findOne({ _id: productId }));
  } catch (error) { next(error); }
});

router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const productId = toObjectId(req.params.id);
    if (!productId) return res.status(400).json({ message: 'Invalid product id.' });
    const db = await getDb();
    const result = await db.collection('products').deleteOne({ _id: productId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found.' });
    res.status(204).send();
  } catch (error) { next(error); }
});

// ── SubCategories ─────────────────────────────────────────────────────────────

router.get('/subcategories', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    const filter = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
    const subs = await db.collection('subCategories').find(filter).sort({ name: 1 }).toArray();
    // Attach product count to each subcategory
    const subsWithCount = await Promise.all(subs.map(async (s) => {
      const count = await db.collection('products').countDocuments({
        subCategory: s.name,
        ...(s.categoryId ? { categoryId: toObjectId(s.categoryId) || s.categoryId } : {}),
      });
      return { ...s, productCount: count };
    }));
    res.json(subsWithCount);
  } catch (error) { next(error); }
});

router.post('/subcategories', requireAdmin, async (req, res, next) => {
  try {
    const { categoryId, name } = req.body;
    if (!categoryId || !name) return res.status(400).json({ message: 'categoryId and name are required.' });
    const db = await getDb();
    // Prevent duplicates
    const existing = await db.collection('subCategories').findOne({ categoryId, name });
    if (existing) return res.status(409).json({ message: 'Subcategory already exists for this category.' });
    const result = await db.collection('subCategories').insertOne({ categoryId, name, createdAt: new Date() });
    res.status(201).json(await db.collection('subCategories').findOne({ _id: result.insertedId }));
  } catch (error) { next(error); }
});

router.put('/subcategories/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id.' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    const db = await getDb();
    const result = await db.collection('subCategories').updateOne(
      { _id: id },
      { $set: { name, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Subcategory not found.' });
    res.json(await db.collection('subCategories').findOne({ _id: id }));
  } catch (error) { next(error); }
});

router.delete('/subcategories/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id.' });
    const db = await getDb();
    // Find the subcategory to get its name
    const sub = await db.collection('subCategories').findOne({ _id: id });
    if (!sub) return res.status(404).json({ message: 'Subcategory not found.' });
    // Find affected products
    const affectedProducts = await db.collection('products')
      .find({ categoryId: toObjectId(sub.categoryId) || sub.categoryId, subCategory: sub.name })
      .project({ name: 1 })
      .toArray();
    if (affectedProducts.length > 0 && req.query.reassignTo === undefined) {
      // Return 409 with affected product names so frontend can show reassign UI
      return res.status(409).json({
        message: `${affectedProducts.length} product(s) use this subcategory.`,
        affectedProducts,
      });
    }
    // If reassignTo provided, update affected products first
    if (affectedProducts.length > 0) {
      const reassignTo = req.query.reassignTo || '';
      await db.collection('products').updateMany(
        { categoryId: toObjectId(sub.categoryId) || sub.categoryId, subCategory: sub.name },
        { $set: { subCategory: reassignTo, updatedAt: new Date() } }
      );
    }
    await db.collection('subCategories').deleteOne({ _id: id });
    res.status(204).send();
  } catch (error) { next(error); }
});

// ── Site Content ─────────────────────────────────────────────────────────────

router.get('/site-content', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    res.json(await db.collection('siteContent').findOne({ key: 'home' }) || {});
  } catch (error) { next(error); }
});

router.put('/site-content', requireAdmin, async (req, res, next) => {
  try {
    const { aboutUs, contact, whatsappNumber, whatsappShowQr, socialLinks } = req.body;
    const db = await getDb();
    await db.collection('siteContent').updateOne(
      { key: 'home' },
      {
        $set: {
          key: 'home',
          aboutUs: aboutUs || '',
          contact: contact || {},
          whatsappNumber: whatsappNumber || '',
          whatsappShowQr: Boolean(whatsappShowQr),
          socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    res.json(await db.collection('siteContent').findOne({ key: 'home' }));
  } catch (error) { next(error); }
});

module.exports = router;
