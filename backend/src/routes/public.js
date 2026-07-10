const express = require('express');
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
      filter.categoryId = req.query.categoryId;
    }

    const products = await db.collection('products').find(filter).sort({ name: 1 }).toArray();
    res.json(products);
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

module.exports = router;
