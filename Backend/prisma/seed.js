require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL || "admin@volcanupsolutions.fr").toLowerCase();
  const plainPassword = process.env.ADMIN_SEED_PASSWORD || "admin12345";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: {
      email,
      passwordHash,
      role: "admin"
    }
  });

  console.log(`Admin seed ready for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
