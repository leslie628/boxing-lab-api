export interface Combination {
  id: string;
  name: string;
  skillIds: string[];
  createdAt: string;
  updatedAt:string;
}
export interface CreateCombinationRequest {
  name: string
  skillIds: string[]
}