const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function issueAdminToken(admin, secret) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    },
    secret,
    { expiresIn: '12h' }
  );
}

function getDevelopmentAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';

  if (!email || !password) {
    return null;
  }

  return {
    _id: new ObjectId('000000000000000000000001'),
    email,
    password,
    role: 'admin',
  };
}

function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    let admin = null;
    let databaseAvailable = true;

    try {
      const db = await getDb();
      admin = await db.collection('users').findOne({ email: normalizedEmail, role: 'admin' });
    } catch (error) {
      databaseAvailable = false;
    }

    if (!admin && !databaseAvailable) {
      const developmentAdmin = getDevelopmentAdmin();

      if (!developmentAdmin || developmentAdmin.email !== normalizedEmail || developmentAdmin.password !== password) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
      }

      const token = issueAdminToken(developmentAdmin, secret);

      return res.json({
        token,
        admin: {
          id: developmentAdmin._id,
          email: developmentAdmin.email,
          role: developmentAdmin.role,
        },
      });
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    const token = issueAdminToken(admin, secret);

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAdmin, async (req, res) => {
  res.json({ admin: req.admin });
});

router.get('/categories', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl, slug } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const db = await getDb();
    const result = await db.collection('categories').insertOne({
      name,
      description: description || '',
      imageUrl: imageUrl || '',
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdCategory = await db.collection('categories').findOne({ _id: result.insertedId });
    res.status(201).json(createdCategory);
  } catch (error) {
    next(error);
  }
});

router.put('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const categoryId = toObjectId(req.params.id);
    if (!categoryId) {
      return res.status(400).json({ message: 'Invalid category id.' });
    }

    const { name, description, imageUrl, slug } = req.body;
    const db = await getDb();
    const updateResult = await db.collection('categories').updateOne(
      { _id: categoryId },
      {
        $set: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          ...(slug !== undefined ? { slug } : {}),
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const updatedCategory = await db.collection('categories').findOne({ _id: categoryId });
    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const categoryId = toObjectId(req.params.id);
    if (!categoryId) {
      return res.status(400).json({ message: 'Invalid category id.' });
    }

    const db = await getDb();
    const deleteResult = await db.collection('categories').deleteOne({ _id: categoryId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    const products = await db.collection('products').find({}).sort({ name: 1 }).toArray();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, categoryId, imageUrl, featured, status } = req.body;

    if (!name || !description || !categoryId) {
      return res.status(400).json({ message: 'Name, description, and categoryId are required.' });
    }

    const db = await getDb();
    const categoryObjectId = toObjectId(categoryId);
    if (!categoryObjectId) {
      return res.status(400).json({ message: 'Invalid categoryId.' });
    }

    const result = await db.collection('products').insertOne({
      name,
      description,
      categoryId: categoryObjectId,
      imageUrl: imageUrl || '',
      featured: Boolean(featured),
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdProduct = await db.collection('products').findOne({ _id: result.insertedId });
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const productId = toObjectId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const { name, description, categoryId, imageUrl, featured, status } = req.body;
    const db = await getDb();
    const normalizedCategoryId = categoryId !== undefined ? toObjectId(categoryId) : undefined;

    if (categoryId !== undefined && !normalizedCategoryId) {
      return res.status(400).json({ message: 'Invalid categoryId.' });
    }

    const updateResult = await db.collection('products').updateOne(
      { _id: productId },
      {
        $set: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(normalizedCategoryId !== undefined ? { categoryId: normalizedCategoryId } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
          ...(status !== undefined ? { status } : {}),
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updatedProduct = await db.collection('products').findOne({ _id: productId });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const productId = toObjectId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const db = await getDb();
    const deleteResult = await db.collection('products').deleteOne({ _id: productId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/site-content', requireAdmin, async (req, res, next) => {
  try {
    const db = await getDb();
    const content = await db.collection('siteContent').findOne({ key: 'home' });
    res.json(content || {});
  } catch (error) {
    next(error);
  }
});

router.put('/site-content', requireAdmin, async (req, res, next) => {
  try {
    const { aboutUs, contact } = req.body;
    const db = await getDb();

    await db.collection('siteContent').updateOne(
      { key: 'home' },
      {
        $set: {
          key: 'home',
          aboutUs: aboutUs || '',
          contact: contact || {},
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const content = await db.collection('siteContent').findOne({ key: 'home' });
    res.json(content);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
