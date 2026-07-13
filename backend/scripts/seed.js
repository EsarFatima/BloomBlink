require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('../src/db');
const { createUserDocument } = require('../src/models/user');
const { createCategoryDocument } = require('../src/models/category');
const { createProductDocument } = require('../src/models/product');
const { createSiteContentDocument } = require('../src/models/siteContent');

async function seed() {
  const db = await getDb();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@bloomblink.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db.collection('users').updateOne(
    { email: adminEmail },
    {
      $set: createUserDocument({
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      }),
    },
    { upsert: true }
  );

  const categorySeed = [
    createCategoryDocument({
      name: 'Birthday Bouquets',
      description: 'Bright bouquets for birthdays and celebrations.',
      slug: 'birthday-bouquets',
    }),
    createCategoryDocument({
      name: 'Wedding Flowers',
      description: 'Elegant arrangements for ceremonies and bridal events.',
      slug: 'wedding-flowers',
    }),
    createCategoryDocument({
      name: 'Gift Boxes',
      description: 'Luxury floral gift boxes for special occasions.',
      slug: 'gift-boxes',
    }),
  ];

  const categoryResults = [];
  for (const category of categorySeed) {
    const result = await db.collection('categories').updateOne(
      { slug: category.slug },
      { $set: category },
      { upsert: true }
    );

    const savedCategory = await db.collection('categories').findOne({ slug: category.slug });
    categoryResults.push(savedCategory);
  }

  const [birthdayCategory, weddingCategory, giftBoxCategory] = categoryResults;

  const productSeed = [
    createProductDocument({
      name: 'Birthday Bliss',
      description: 'Bright, cheerful stems with a celebratory finish.',
      categoryId: birthdayCategory._id,
      imageUrl: '',
      featured: true,
      status: 'active',
    }),
    createProductDocument({
      name: 'Blooming Celebration',
      description: 'Soft, romantic flowers designed to feel gift-ready and polished.',
      categoryId: birthdayCategory._id,
      imageUrl: '',
      featured: true,
      status: 'active',
    }),
    createProductDocument({
      name: 'Lotus Party Box',
      description: 'Layered blooms and treats with a luxe presentation box style.',
      categoryId: giftBoxCategory._id,
      imageUrl: '',
      featured: true,
      status: 'active',
    }),
    createProductDocument({
      name: 'Bridal Stage Arrangement',
      description: 'Premium ceremony florals for weddings and formal events.',
      categoryId: weddingCategory._id,
      imageUrl: '',
      featured: false,
      status: 'active',
    }),
  ];

  for (const product of productSeed) {
    await db.collection('products').updateOne(
      { name: product.name },
      { $set: product },
      { upsert: true }
    );
  }

  await db.collection('siteContent').updateOne(
    { key: 'home' },
    {
      $set: createSiteContentDocument({
        key: 'home',
        aboutUs: 'Bloom & Blink creates elegant floral arrangements for thoughtful gifting and special occasions.',
        contact: {
          phone: '0327 844 4468',
          city: 'Lahore',
          delivery: 'Same-day delivery across Lahore',
          email: 'hello@bloomblink.com',
        },
      }),
    },
    { upsert: true }
  );

  console.log('Seed completed successfully.');
  console.log(`Admin login: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
