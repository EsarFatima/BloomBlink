const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/categories', async (req, res, next) => {
  try {
    const db = await getDb();
    const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const db = await getDb();
    const filter = {};

    if (req.query.categoryId) {
      filter.categoryId = ObjectId.isValid(req.query.categoryId)
        ? new ObjectId(req.query.categoryId)
        : req.query.categoryId;
    }

    if (req.query.subCategory) {
      filter.subCategory = req.query.subCategory;
    }

    const products = await db.collection('products').find(filter).sort({ name: 1 }).toArray();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Returns all subCategory docs, or filtered by categoryId query param
router.get('/subcategories', async (req, res, next) => {
  try {
    const db = await getDb();
    const filter = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
    const docs = await db.collection('subCategories').find(filter).sort({ name: 1 }).toArray();
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

router.get('/site-content', async (req, res, next) => {
  try {
    const db = await getDb();
    const content = await db.collection('siteContent').findOne({ key: 'home' });
    res.json(content || {});
  } catch (error) {
    next(error);
  }
});

router.get('/contact', async (req, res, next) => {
  try {
    const db = await getDb();
    const content = await db.collection('siteContent').findOne({ key: 'home' });
    res.json(content?.contact || {});
  } catch (error) {
    next(error);
  }
});

router.get('/about', async (req, res, next) => {
  try {
    const db = await getDb();
    const content = await db.collection('siteContent').findOne({ key: 'home' });
    res.json({ aboutUs: content?.aboutUs || '' });
  } catch (error) {
    next(error);
  }
});

// Serve uploaded images stored in the database
router.get('/uploads/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).send('Invalid id');
    const doc = await db.collection('images').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).send('Not found');
    res.setHeader('Content-Type', doc.contentType || 'application/octet-stream');
    res.send(doc.data.buffer || doc.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
