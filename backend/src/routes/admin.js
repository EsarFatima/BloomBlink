const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

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
    const { name, description, categoryId, imageUrl, featured, status, price } = req.body;
    if (!name || !description || !categoryId)
      return res.status(400).json({ message: 'Name, description, and categoryId are required.' });
    const categoryObjectId = toObjectId(categoryId);
    if (!categoryObjectId) return res.status(400).json({ message: 'Invalid categoryId.' });
    const db = await getDb();
    const result = await db.collection('products').insertOne({
      name, description, categoryId: categoryObjectId,
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
    const { name, description, categoryId, imageUrl, featured, status, price } = req.body;
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
