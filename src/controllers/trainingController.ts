import type { Request, Response } from "express";
import {
  createTrainingSession,
  getTrainingSessions,
} from "../services/trainingService.js";
import type { CreateTrainingSessionRequest } from "../types/training.js";

export const postTrainingSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = req.body as CreateTrainingSessionRequest;
    const session = await createTrainingSession(data);

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating training session:", error);
    res.status(500).json({ error: "Failed to create training session" });
  }
};

export const getAllTrainingSessions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sessions = await getTrainingSessions();
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    res.status(500).json({ error: "Failed to fetch training sessions" });
  }
};
