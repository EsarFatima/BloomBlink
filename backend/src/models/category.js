function createCategoryDocument({ name, description = '', imageUrl = '', slug }) {
  return {
    name,
    description,
    imageUrl,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = {
  createCategoryDocument,
};
