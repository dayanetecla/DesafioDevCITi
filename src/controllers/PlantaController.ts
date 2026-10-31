import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";

const LUMINOSIDADES_VALIDAS = Object.values(Luminosidade);

export const createPlanta = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    } = req.body;

    if (
      nome === undefined ||
      especie === undefined ||
      preco === undefined ||
      estoque === undefined ||
      luminosidade === undefined ||
      petFriendly === undefined ||
      regaACadaDias === undefined
    ) {
      return res.status(400).json({
        message:
          "Todos os campos (nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias) são obrigatórios.",
      });
    }

    if (typeof nome !== "string" || nome.trim() === "") {
      return res.status(400).json({ message: "O campo 'nome' deve ser uma string válida." });
    }

    if (typeof especie !== "string" || especie.trim() === "") {
      return res.status(400).json({ message: "O campo 'especie' deve ser uma string válida." });
    }

    if (typeof preco !== "number" || !Number.isInteger(preco) || preco <= 0) {
      return res.status(400).json({ message: "O preço deve ser um número inteiro maior que zero." });
    }

    if (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0) {
      return res.status(400).json({ message: "O estoque deve ser um número inteiro maior ou igual a zero." });
    }

    if (!LUMINOSIDADES_VALIDAS.includes(luminosidade)) {
      return res.status(400).json({
        message: `Luminosidade inválida. Valores permitidos: ${LUMINOSIDADES_VALIDAS.join(", ")}.`,
      });
    }

    if (typeof petFriendly !== "boolean") {
      return res.status(400).json({ message: "O campo 'petFriendly' deve ser booleano (true ou false)." });
    }

    if (
      typeof regaACadaDias !== "number" ||
      !Number.isInteger(regaACadaDias) ||
      regaACadaDias < 1
    ) {
      return res.status(400).json({ message: "O campo 'regaACadaDias' deve ser um número inteiro maior ou igual a 1." });
    }

    const planta = await PlantaRepository.createPlanta({
      nome: nome.trim(),
      especie: especie.trim(),
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(201).json(planta);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao cadastrar planta." });
  }
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    const { luminosidade, petFriendly, nome, ordem } = req.query;

    let filterLuminosidade: Luminosidade | undefined;
    if (luminosidade) {
      const lumStr = String(luminosidade).toUpperCase();
      if (!LUMINOSIDADES_VALIDAS.includes(lumStr as Luminosidade)) {
        return res.status(400).json({
          message: `Filtro 'luminosidade' inválido. Valores aceitos: ${LUMINOSIDADES_VALIDAS.join(", ")}.`,
        });
      }
      filterLuminosidade = lumStr as Luminosidade;
    }

    let filterPetFriendly: boolean | undefined;
    if (petFriendly !== undefined) {
      if (petFriendly === "true") {
        filterPetFriendly = true;
      } else if (petFriendly === "false") {
        filterPetFriendly = false;
      } else {
        return res.status(400).json({
          message: "Filtro 'petFriendly' deve ser 'true' ou 'false'.",
        });
      }
    }

    let filterOrdem: "preco" | "nome" | undefined;
    if (ordem) {
      const ordemStr = String(ordem).toLowerCase();
      if (ordemStr !== "preco" && ordemStr !== "nome") {
        return res.status(400).json({
          message: "Filtro 'ordem' deve ser 'preco' ou 'nome'.",
        });
      }
      filterOrdem = ordemStr as "preco" | "nome";
    }

    const filterNome = nome ? String(nome) : undefined;

    const plantas = await PlantaRepository.findAllPlantas({
      luminosidade: filterLuminosidade,
      petFriendly: filterPetFriendly,
      nome: filterNome,
      ordem: filterOrdem,
    });

    return res.status(200).json(plantas);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao buscar plantas." });
  }
};

export const readPlantasEsgotadas = async (req: Request, res: Response) => {
  try {
    const plantas = await PlantaRepository.findPlantasEsgotadas();
    return res.status(200).json(plantas);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao buscar plantas esgotadas." });
  }
};

export const readEstatisticasEstoque = async (req: Request, res: Response) => {
  try {
    const stats = await PlantaRepository.getEstatisticasEstoque();
    return res.status(200).json(stats);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao calcular estatísticas de estoque." });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de planta inválido." });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    return res.status(200).json(planta);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao buscar planta." });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de planta inválido." });
    }

    const plantaExistente = await PlantaRepository.findPlantaById(id);
    if (!plantaExistente) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    const {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    } = req.body;

    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
      return res.status(400).json({ message: "O campo 'nome' deve ser uma string válida." });
    }

    if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
      return res.status(400).json({ message: "O campo 'especie' deve ser uma string válida." });
    }

    if (
      preco !== undefined &&
      (typeof preco !== "number" || !Number.isInteger(preco) || preco <= 0)
    ) {
      return res.status(400).json({ message: "O preço deve ser um número inteiro maior que zero." });
    }

    if (
      estoque !== undefined &&
      (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0)
    ) {
      return res.status(400).json({ message: "O estoque deve ser um número inteiro maior ou igual a zero." });
    }

    if (
      luminosidade !== undefined &&
      !LUMINOSIDADES_VALIDAS.includes(luminosidade)
    ) {
      return res.status(400).json({
        message: `Luminosidade inválida. Valores permitidos: ${LUMINOSIDADES_VALIDAS.join(", ")}.`,
      });
    }

    if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
      return res.status(400).json({ message: "O campo 'petFriendly' deve ser booleano (true ou false)." });
    }

    if (
      regaACadaDias !== undefined &&
      (typeof regaACadaDias !== "number" ||
        !Number.isInteger(regaACadaDias) ||
        regaACadaDias < 1)
    ) {
      return res.status(400).json({ message: "O campo 'regaACadaDias' deve ser um número inteiro maior ou igual a 1." });
    }

    const updatedPlanta = await PlantaRepository.updatePlanta(id, {
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(especie !== undefined && { especie: especie.trim() }),
      ...(preco !== undefined && { preco }),
      ...(estoque !== undefined && { estoque }),
      ...(luminosidade !== undefined && { luminosidade }),
      ...(petFriendly !== undefined && { petFriendly }),
      ...(regaACadaDias !== undefined && { regaACadaDias }),
    });

    return res.status(200).json(updatedPlanta);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de planta inválido." });
    }

    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantaRepository.deletePlanta(id);
    return res.status(204).send();
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao deletar planta." });
  }
};

export const venderPlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de planta inválido." });
    }

    const { quantidade } = req.body;

    if (
      quantidade === undefined ||
      typeof quantidade !== "number" ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      return res.status(400).json({
        message: "O campo 'quantidade' deve ser um número inteiro positivo maior que zero.",
      });
    }

    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    if (planta.estoque < quantidade) {
      return res.status(400).json({
        message: `Estoque insuficiente. Estoque disponível: ${planta.estoque}, quantidade solicitada: ${quantidade}.`,
      });
    }

    const plantaAtualizada = await PlantaRepository.realizarVenda(id, quantidade);
    return res.status(200).json(plantaAtualizada);
  } catch (error) {
      return res.status(500).json({ message: "Erro interno ao registrar venda." });
  }
};