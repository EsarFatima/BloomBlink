function createSiteContentDocument({ key, aboutUs = '', contact = {} }) {
  return {
    key,
    aboutUs,
    contact,
    updatedAt: new Date(),
  };
}

module.exports = {
  createSiteContentDocument,
};
