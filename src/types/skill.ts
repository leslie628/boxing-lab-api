export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  createdAt:string;
  status: 'natural' | 'needs-work' | null
}