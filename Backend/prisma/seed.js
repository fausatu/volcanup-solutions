require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL || "admin@volcanup.fr").toLowerCase();
  const plainPassword = process.env.ADMIN_SEED_PASSWORD || "admin12345";
  const username = process.env.ADMIN_SEED_USERNAME ? process.env.ADMIN_SEED_USERNAME.toLowerCase() : undefined;
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const updateData = { passwordHash, role: "admin" };
  if (username) updateData.username = username;

  const createData = { email, passwordHash, role: "admin" };
  if (username) createData.username = username;

  await prisma.user.upsert({
    where: { email },
    update: updateData,
    create: createData
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
