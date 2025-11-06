const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Ropa", slug: "ropa" },
    { name: "Electrónica", slug: "electronica" },
    { name: "Hogar", slug: "hogar" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const ropa = await prisma.category.findUnique({ where: { slug: "ropa" } });
  const electronica = await prisma.category.findUnique({ where: { slug: "electronica" } });
  const hogar = await prisma.category.findUnique({ where: { slug: "hogar" } });

  const products = [
    {
      name: "Camiseta básica",
      slug: "camiseta-basica",
      description: "Camiseta de algodón 100%",
      price: 1499,
      imageUrl: "https://picsum.photos/seed/camiseta/800/600",
      stock: 50,
      categoryId: ropa?.id ?? null,
    },
    {
      name: "Auriculares inalámbricos",
      slug: "auriculares-inalambricos",
      description: "Bluetooth 5.3, cancelación de ruido",
      price: 3999,
      imageUrl: "https://picsum.photos/seed/auriculares/800/600",
      stock: 25,
      categoryId: electronica?.id ?? null,
    },
    {
      name: "Cafetera de filtro",
      slug: "cafetera-filtro",
      description: "12 tazas, temporizador programable",
      price: 5499,
      imageUrl: "https://picsum.photos/seed/cafetera/800/600",
      stock: 15,
      categoryId: hogar?.id ?? null,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completado");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



