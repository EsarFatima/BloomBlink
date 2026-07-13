function createProductDocument({
  name,
  description,
  categoryId,
  imageUrl = '',
  featured = false,
  status = 'active',
}) {
  return {
    name,
    description,
    categoryId,
    imageUrl,
    featured,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = {
  createProductDocument,
};
