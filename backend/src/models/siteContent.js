function createSiteContentDocument({
  key,
  aboutUs = '',
  contact = {},
  whatsappNumber = '',
  whatsappShowQr = false,
  socialLinks = [],
}) {
  return {
    key,
    aboutUs,
    contact,
    whatsappNumber,
    whatsappShowQr,
    socialLinks,
    updatedAt: new Date(),
  };
}

module.exports = {
  createSiteContentDocument,
};
