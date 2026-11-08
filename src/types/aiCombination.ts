export interface AICombinationRequest {
  scenario: string;
}

export interface AICombinationSuggestion {
  name: string;
  skillIds: string[];
  explanation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  steps: AICombinationStep[];
}

export interface AICombinationResponse {
  opponentSituation: string;
  recommendedSkills: {
    skillId: string;
    explanation: string;
  }[];
  suggestions: AICombinationSuggestion[];
}

export interface AICombinationStep {
  actor: "opponent" | "you";
  action: string;
}