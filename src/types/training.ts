type AssessmentStatus = "natural" | "needs-work";
export interface CreateTrainingSessionRequest {
  date: string;
  durationMinutes: number;
  skillIds: string[];
  combinationIds: string[];
  notes: string;
  skillAssessments?: {
    id: string;
    status: AssessmentStatus;
  }[];
  combinationAssessments?: {
    id: number;
    status: AssessmentStatus;
  }[];
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
