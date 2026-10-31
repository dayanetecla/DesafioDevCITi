import { Prisma, Luminosidade } from "@prisma/client";
import prisma from "@database";

export interface FindPlantasFilters {
  luminosidade?: Luminosidade;
  petFriendly?: boolean;
  nome?: string;
  ordem?: "preco" | "nome";
}

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
  return await prisma.planta.create({
    data,
  });
};

export const findAllPlantas = async (filters: FindPlantasFilters = {}) => {
  const where: Prisma.PlantaWhereInput = {};

  if (filters.luminosidade) {
    where.luminosidade = filters.luminosidade;
  }

  if (filters.petFriendly !== undefined) {
    where.petFriendly = filters.petFriendly;
  }

  if (filters.nome) {
    where.nome = {
      contains: filters.nome,
      mode: "insensitive",
    };
  }

  const orderBy: Prisma.PlantaOrderByWithRelationInput = {};
  if (filters.ordem) {
    orderBy[filters.ordem] = "asc";
  } else {
    orderBy.id = "asc";
  }

  return await prisma.planta.findMany({
    where,
    orderBy,
  });
};

export const findPlantasEsgotadas = async () => {
  return await prisma.planta.findMany({
    where: {
      estoque: 0,
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const findPlantaById = async (id: number) => {
  return await prisma.planta.findUnique({
    where: { id },
  });
};

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
  return await prisma.planta.update({
    where: { id },
    data,
  });
};

export const deletePlanta = async (id: number) => {
  return await prisma.planta.delete({
    where: { id },
  });
};

export const realizarVenda = async (id: number, quantidade: number) => {
  return await prisma.planta.update({
    where: { id },
    data: {
      estoque: {
        decrement: quantidade,
      },
    },
  });
};

export const getEstatisticasEstoque = async () => {
  const plantas = await prisma.planta.findMany({
    select: {
      preco: true,
      estoque: true,
    },
  });

  const totalDeVasos = plantas.reduce((acc, p) => acc + p.estoque, 0);
  const valorTotalEmCentavos = plantas.reduce(
    (acc, p) => acc + p.preco * p.estoque,
    0
  );

  return {
    valorTotalEmCentavos,
    totalDeVasos,
  };
};