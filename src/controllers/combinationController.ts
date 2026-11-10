import type { NextFunction, Request, Response } from "express";
import {
  createCombination,
  getCombinations,
  getCombinationById,
  updateCombinationStatus as updateCombinationStatusService,
  deleteCombination,
} from "../services/combinationService.js";
import type { CreateCombinationRequest } from "../types/combination.js";
import { generateAICombinations } from "../services/aiCombinationService.js";
export const postCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, skillIds } = req.body as CreateCombinationRequest;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Array.isArray(skillIds) ||
    !skillIds.every((id) => typeof id === "string" && id.trim())
  ) {
    res.status(400).json({
      message: "A combination name and valid skill IDs are required.",
    });
    return;
  }

  try {
    const combination = await createCombination({
      name: name.trim(),
      skillIds,
    });

    res.status(201).json(combination);
  } catch (error) {
    console.error("Failed to create combination:", error);

    res.status(500).json({
      message: "Failed to create combination.",
    });
  }
};

export const updateCombinationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (status !== null && status !== "natural" && status !== "needs-work") {
      return res.status(400).json({ message: "Invalid combination status" });
    }

    const combinationId = req.params.id;

    if (typeof combinationId !== "string") {
      return res.status(400).json({ message: "Invalid combination ID" });
    }

    const combination = await updateCombinationStatusService(
      combinationId,
      status,
    );

    if (!combination) {
      return res.status(404).json({ message: "Combination not found" });
    }

    return res.json(combination);
  } catch {
    return res.status(500).json({
      message: "Failed to update combination status",
    });
  }
};

export const getAllCombinations = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const combinations = await getCombinations();
    res.status(200).json(combinations);
  } catch (error) {
    console.error("Failed to fetch combinations:", error);

    res.status(500).json({
      message: "Failed to fetch combinations.",
    });
  }
};

export const getCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    res.status(400).json({ message: "Invalid combination ID." });
    return;
  }

  try {
    const combination = await getCombinationById(id);

    if (!combination) {
      res.status(404).json({ message: "Combination not found." });
      return;
    }

    res.status(200).json(combination);
  } catch (error) {
    console.error("Failed to fetch combination:", error);
    res.status(500).json({ message: "Failed to fetch combination." });
  }
};

export const deleteCombinationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !/^\d+$/.test(id)) {
      res.status(400).json({ message: "Invalid combination ID." });
      return;
    }
    const deleted = await deleteCombination(id);

    if (deleted === "not_found") {
      res.status(404).json({
        message: "Combination not found.",
      });
      return;
    }

    if (deleted === "in_use") {
      res.status(409).json({
        message:
          "Cannot delete this combination because it is used in a training session.",
      });
      return;
    }
    res.status(200).json({
      message: "Combination deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAICombinationSuggestions = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scenario } = req.body;

    if (!scenario?.trim()) {
      return res.status(400).json({
        message: "Please describe a boxing situation.",
      });
    }

    const result = await generateAICombinations({ scenario });

    return res.status(200).json(result);
  } catch (error) {
    console.error("AI combination generation failed:", error);

    return res.status(500).json({
      message: "Failed to generate AI combination suggestions.",
    });
  }
};
