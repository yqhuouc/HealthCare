const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const methods = await prisma.hinhThucThanhToan.findMany();
  console.log(JSON.stringify(methods, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
