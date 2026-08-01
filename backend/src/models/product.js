function createProductDocument({
  name,
  description,
  categoryId,
  subCategory = '',
  imageUrl = '',
  price = null,
  featured = false,
  status = 'active',
}) {
  return {
    name,
    description,
    categoryId,
    subCategory,
    imageUrl,
    price,
    featured,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = { createProductDocument };
