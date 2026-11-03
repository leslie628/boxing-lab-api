import { pool } from "../config/database.js";
import type {
  CreateTrainingSessionRequest,
  TrainingSession,
} from "../types/training.js";

export const createTrainingSession = async (
  data: CreateTrainingSessionRequest,
): Promise<TrainingSession> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sessionResult = await client.query(
      `INSERT INTO training_sessions
        (session_date, duration_minutes, notes)
       VALUES ($1, $2, $3)
       RETURNING id, session_date, duration_minutes, notes, created_at`,
      [data.date, data.durationMinutes, data.notes],
    );

    const session = sessionResult.rows[0];

    for (const skillId of data.skillIds) {
      await client.query(
        `INSERT INTO training_session_skills
          (training_session_id, skill_id)
         VALUES ($1, $2)`,
        [session.id, skillId],
      );
    }

    for (const combinationId of data.combinationIds) {
      await client.query(
        `INSERT INTO training_session_combinations
          (training_session_id, combination_id)
         VALUES ($1, $2)`,
        [session.id, combinationId],
      );
    }
    // Update only skills that were assessed
    for (const { id, status } of data.skillAssessments ?? []) {
      await client.query(
        `INSERT INTO user_skills (skill_id, status)
     VALUES ($1, $2)
     ON CONFLICT (skill_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       updated_at = NOW()`,
        [id, status],
      );
    }

    // Update only combinations that were assessed
    for (const { id, status } of data.combinationAssessments ?? []) {
      await client.query(
        `INSERT INTO user_combinations (combination_id, status)
     VALUES ($1, $2)
     ON CONFLICT (combination_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       updated_at = NOW()`,
        [id, status],
      );
    }

    await client.query("COMMIT");

    return {
      id: String(session.id),
      date: session.session_date.toISOString().slice(0, 10),
      durationMinutes: session.duration_minutes,
      skillIds: data.skillIds,
      combinationIds: data.combinationIds,
      notes: session.notes,
      createdAt: session.created_at.toISOString(),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getTrainingSessions = async (): Promise<TrainingSession[]> => {
  const result = await pool.query(`
    SELECT
      ts.id,
      TO_CHAR(ts.session_date, 'YYYY-MM-DD') AS session_date,
      ts.duration_minutes,
      ts.notes,
      ts.created_at,
      COALESCE(
        ARRAY_AGG(DISTINCT tss.skill_id)
          FILTER (WHERE tss.skill_id IS NOT NULL),
        ARRAY[]::TEXT[]
      ) AS skill_ids,
      COALESCE(
        ARRAY_AGG(DISTINCT tsc.combination_id)
          FILTER (WHERE tsc.combination_id IS NOT NULL),
        ARRAY[]::BIGINT[]
      ) AS combination_ids,
       (
    SELECT COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', tsc2.combination_id,
          'status', uc.status
        )
      ),
      '[]'::json
    )
    FROM training_session_combinations tsc2
    LEFT JOIN user_combinations uc
      ON uc.combination_id = tsc2.combination_id
    WHERE tsc2.training_session_id = ts.id
  ) AS combinations

    FROM training_sessions ts
    LEFT JOIN training_session_skills tss
      ON tss.training_session_id = ts.id
    LEFT JOIN training_session_combinations tsc
      ON tsc.training_session_id = ts.id
    GROUP BY ts.id
    ORDER BY ts.session_date DESC, ts.id DESC
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    date: row.session_date,
    durationMinutes: row.duration_minutes,
    skillIds: row.skill_ids,
    combinationIds: row.combination_ids.map(String),
    notes: row.notes,
    combinations: row.combinations,
    createdAt: row.created_at.toISOString(),
  }));
};
