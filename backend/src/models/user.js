function createUserDocument({ name, email, passwordHash, role = 'admin' }) {
  return {
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = {
  createUserDocument,
};
