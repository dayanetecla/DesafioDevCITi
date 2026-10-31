import { PrismaClient, Luminosidade } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando o banco de dados com plantas de exemplo...");

  await prisma.planta.deleteMany({});

  await prisma.planta.createMany({
    data: [
      {
        nome: "Costela-de-adão",
        especie: "Monstera deliciosa",
        preco: 8990,
        estoque: 12,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: true,
        regaACadaDias: 3,
      },
      {
        nome: "Jiboia",
        especie: "Epipremnum aureum",
        preco: 3500,
        estoque: 20,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: false,
        regaACadaDias: 4,
      },
      {
        nome: "Espada-de-são-jorge",
        especie: "Dracaena trifasciata",
        preco: 4500,
        estoque: 0,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: false,
        regaACadaDias: 10,
      },
      {
        nome: "Zamioculca",
        especie: "Zamioculcas zamiifolia",
        preco: 7500,
        estoque: 5,
        luminosidade: Luminosidade.SOMBRA,
        petFriendly: false,
        regaACadaDias: 15,
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });