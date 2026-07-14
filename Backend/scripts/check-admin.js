require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@volcanupsolutions.fr' } });
    if (!user) {
      console.log('USER_NOT_FOUND');
      return;
    }
    const match = await bcrypt.compare('admin12345', user.passwordHash);
    console.log('USER_FOUND', 'passwordMatch=' + match);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
})();
