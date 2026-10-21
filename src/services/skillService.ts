import { pool } from "../config/database.js";
import type {
  Skill
} from "../types/skill.js";

export const getSkills = async (): Promise<Skill[]> => {
  const result = await pool.query(`
    SELECT id, name, category, description, created_at
    FROM skills
    ORDER BY created_at DESC
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description,
    createdAt: row.created_at,
  }));
};