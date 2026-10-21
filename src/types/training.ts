export interface CreateTrainingSessionRequest {
  date: string;
  durationMinutes: number;
  skillIds: string[];
  combinationIds: string[];
  notes: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  durationMinutes: number;
  skillIds: string[];
  combinationIds: string[];
  notes: string;
  createdAt: string;
}