export interface Combination {
  id: string;
  name: string;
  skillIds: string[];
  status: 'natural' | 'needs-work' | null
  createdAt: string;
  updatedAt:string;
}
export interface CreateCombinationRequest {
  name: string
  skillIds: string[]
}