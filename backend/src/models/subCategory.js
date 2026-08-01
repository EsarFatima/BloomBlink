function createSubCategoryDocument({ categoryId, name }) {
  return {
    categoryId, // stored as string (ObjectId.toString())
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = { createSubCategoryDocument };
