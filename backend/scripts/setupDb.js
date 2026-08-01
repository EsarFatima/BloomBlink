/**
 * scripts/setupDb.js
 *
 * Creates all Bloom & Blink collections with:
 *   - MongoDB JSON Schema validation (bsonType-based)
 *   - Indexes for query performance and uniqueness
 *
 * Safe to re-run: uses createCollection only when the collection doesn't exist,
 * and createIndex with { background: true } so it won't fail if the index exists.
 *
 * Usage:  npm run setup
 */

require('dotenv').config();
const { getDb, closeDb } = require('../src/db');

// ─── Schema definitions ───────────────────────────────────────────────────────

const SCHEMAS = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'passwordHash', 'role'],
        additionalProperties: true,
        properties: {
          name:         { bsonType: 'string', description: 'Display name of the admin user' },
          email:        { bsonType: 'string', description: 'Unique lowercase email address' },
          passwordHash: { bsonType: 'string', description: 'bcrypt hash of the password' },
          role:         { bsonType: 'string', enum: ['admin'], description: 'Must be admin' },
          createdAt:    { bsonType: 'date' },
          updatedAt:    { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
    validationAction: 'warn',
  },

  categories: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'slug'],
        additionalProperties: true,
        properties: {
          name:        { bsonType: 'string', description: 'Category display name' },
          slug:        { bsonType: 'string', description: 'URL-safe unique identifier' },
          description: { bsonType: 'string' },
          imageUrl:    { bsonType: 'string' },
          createdAt:   { bsonType: 'date' },
          updatedAt:   { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
    validationAction: 'warn',
  },

  subCategories: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['categoryId', 'name'],
        additionalProperties: true,
        properties: {
          // categoryId is stored as a plain string (ObjectId.toString())
          categoryId: { bsonType: 'string', description: 'Parent category _id as string' },
          name:       { bsonType: 'string', description: 'Subcategory display name' },
          createdAt:  { bsonType: 'date' },
          updatedAt:  { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
    validationAction: 'warn',
  },

  products: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'description', 'categoryId', 'status'],
        additionalProperties: true,
        properties: {
          name:        { bsonType: 'string' },
          description: { bsonType: 'string' },
          // categoryId is stored as ObjectId (inserted via toObjectId() in routes)
          categoryId:  { description: 'ObjectId reference to categories collection' },
          subCategory: { bsonType: 'string', description: 'Subcategory name string, empty if none' },
          imageUrl:    { bsonType: 'string' },
          price: {
            oneOf: [
              { bsonType: 'double' },
              { bsonType: 'int' },
              { bsonType: 'null' },
            ],
            description: 'Numeric price or null for contact-for-pricing',
          },
          featured:  { bsonType: 'bool' },
          status:    { bsonType: 'string', enum: ['active', 'inactive'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
    validationAction: 'warn',
  },

  siteContent: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['key'],
        additionalProperties: true,
        properties: {
          key:             { bsonType: 'string', description: 'Unique content key, e.g. "home"' },
          aboutUs:         { bsonType: 'string' },
          contact: {
            bsonType: 'object',
            additionalProperties: true,
            properties: {
              phone:    { bsonType: 'string' },
              email:    { bsonType: 'string' },
              address:  { bsonType: 'string' },
              city:     { bsonType: 'string' },
              delivery: { bsonType: 'string' },
            },
          },
          whatsappNumber:  { bsonType: 'string', description: 'Normalized digits-only WhatsApp number' },
          whatsappShowQr:  { bsonType: 'bool' },
          socialLinks: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['label', 'url'],
              properties: {
                label: { bsonType: 'string' },
                url:   { bsonType: 'string' },
              },
            },
          },
          updatedAt: { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
    validationAction: 'warn',
  },
};

// ─── Index definitions ────────────────────────────────────────────────────────

const INDEXES = {
  users: [
    { key: { email: 1 }, options: { unique: true, name: 'email_unique' } },
  ],
  categories: [
    { key: { slug: 1 },  options: { unique: true, name: 'slug_unique' } },
    { key: { name: 1 },  options: { name: 'name_asc' } },
  ],
  subCategories: [
    // Prevent duplicate subcategory names within the same category
    { key: { categoryId: 1, name: 1 }, options: { unique: true, name: 'categoryId_name_unique' } },
    { key: { categoryId: 1 },          options: { name: 'categoryId_asc' } },
  ],
  products: [
    { key: { categoryId: 1 },              options: { name: 'categoryId_asc' } },
    { key: { categoryId: 1, subCategory: 1 }, options: { name: 'categoryId_subCategory' } },
    { key: { status: 1 },                  options: { name: 'status_asc' } },
    { key: { featured: 1 },               options: { name: 'featured_asc' } },
    { key: { name: 1 },                    options: { name: 'name_asc' } },
  ],
  siteContent: [
    { key: { key: 1 }, options: { unique: true, name: 'key_unique' } },
  ],
};

// ─── Setup logic ──────────────────────────────────────────────────────────────

async function setup() {
  const db = await getDb();

  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  for (const [collectionName, schemaOptions] of Object.entries(SCHEMAS)) {
    if (existingNames.has(collectionName)) {
      // Collection exists — update its validator in place
      await db.command({
        collMod: collectionName,
        validator: schemaOptions.validator,
        validationLevel: schemaOptions.validationLevel,
        validationAction: schemaOptions.validationAction,
      });
      console.log(`  ✔ Updated validator on existing collection: ${collectionName}`);
    } else {
      await db.createCollection(collectionName, schemaOptions);
      console.log(`  ✔ Created collection: ${collectionName}`);
    }
  }

  for (const [collectionName, indexes] of Object.entries(INDEXES)) {
    const collection = db.collection(collectionName);
    for (const { key, options } of indexes) {
      await collection.createIndex(key, { background: true, ...options });
    }
    console.log(`  ✔ Indexes ensured on: ${collectionName}`);
  }

  console.log('\nDatabase setup complete.');
  console.log(`Database: ${process.env.MONGODB_DB || 'bloom_blink'}`);
  console.log('Collections: users, categories, subCategories, products, siteContent');
}

setup()
  .catch((err) => {
    console.error('Setup failed:', err.message);
    process.exitCode = 1;
  })
  .finally(closeDb);
