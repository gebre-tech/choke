const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findFirst();
    console.log("Connection successful!", products);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
