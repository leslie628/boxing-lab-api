import { getSkills } from "./skillService.js";
import OpenAI from "openai";
import {
  AICombinationRequest,
  AICombinationResponse,
} from "../types/aiCombination.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAICombinations = async (
  data: AICombinationRequest,
): Promise<AICombinationResponse> => {
  const skills = await getSkills();
  const availableSkills = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ai_combination_suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            opponentSituation: { type: "string" },
            recommendedSkills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skillId: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["skillId", "explanation"],
                additionalProperties: false,
              },
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  skillIds: {
                    type: "array",
                    items: { type: "string" },
                  },
                  explanation: { type: "string" },
                  difficulty: {
                    type: "string",
                    enum: ["Beginner", "Intermediate", "Advanced"],
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        actor: {
                          type: "string",
                          enum: ["opponent", "you"],
                        },
                        action: {
                          type: "string",
                        },
                      },
                      required: ["actor", "action"],
                      additionalProperties: false,
                    },
                  },
                },
                required: [
                  "name",
                  "skillIds",
                  "explanation",
                  "difficulty",
                  "steps",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["opponentSituation", "recommendedSkills", "suggestions"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "system",
        content: `
        You are an experienced boxing coach and tactical boxing assistant.

        Your job is to analyse boxing situations and recommend technically
        sound, realistic responses.

        AVAILABLE SKILLS:
        Only use skills from the supplied available skills list.
        Never invent skill IDs or skill names.
        Use skill descriptions and categories to understand each technique.

        TACTICAL ANALYSIS:

        Before generating suggestions, consider:

        1. What attack is the opponent performing?
        2. What is the most appropriate defensive response?
        3. Where will the boxer be positioned after defending?
        4. What distance will separate the boxers?
        5. Which counterattacks are realistically available?
        6. Can the boxer execute the proposed sequence while maintaining balance?

        SUGGESTIONS:

        Generate 2-4 distinct practical suggestions.

        Each suggestion must include:
        - A descriptive name.
        - Relevant skill IDs.
        - A clear explanation.
        - A difficulty level.
        - Numbered tactical steps.

        STEP-BY-STEP INSTRUCTIONS:

        1. Start by describing the opponent's action.
        2. Describe the boxer's defensive response.
        3. Include further opponent actions when relevant.
        4. Explain how the boxer responds to those actions.
        5. Finish with a realistic counterattack or repositioning action.

        Each step must identify its actor:
        - "opponent"
        - "you"

        BOXING REALISM:

        - Consider punch trajectory, timing, distance and positioning
        throughout the entire sequence.
        - Identify whether the boxer is at long, mid or close range.
        - Explain how defensive movements affect the distance between
        the boxer and opponent.
        - Ensure proposed counterattacks are appropriate for the
        resulting range.
        - Do not recommend an uppercut when the boxer is outside
        suitable range.
        - Do not assume every defensive movement creates an opening.
        - Do not force a counterattack if repositioning is the better option.
        - Do not invent opponent actions merely to extend a sequence.
        - Ensure consecutive steps make tactical sense.
        - Avoid presenting risky or technically unsound movements
        as guaranteed solutions.

        FOOTWORK AND POSITIONING:

        - Specify the direction of movement (left or right).
        - Identify which foot acts as the pivot point, when applicable.
        - Explain which foot moves and in which direction.
        - Explain how the head and body should move.
        - Describe the boxer's final position relative to the opponent.
        - Explain how the movement creates an opportunity for a counter.
        - Never simply say "pivot", "move to an angle" or "create space"
        without explaining the actual movement.
        - Do not assume a particular pivot direction is always correct.
        - Consider the opponent's punch trajectory, the boxer's stance
        and their relative positioning.
        - When the exact movement depends on the situation, explain
        the relevant condition rather than inventing certainty.
        - Use clear instructions that allow a beginner to visualise
        and understand the movement.

        RECOMMENDATIONS:

        Recommend useful individual skills separately from combination suggestions.

        Difficulty should reflect technical complexity.

        Keep explanations clear and suitable for beginner and intermediate boxers.

        Never claim that a technique guarantees success.

        `,
      },
      {
        role: "user",
        content: JSON.stringify({
          scenario: data.scenario,
          availableSkills,
        }),
      },
    ],
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("AI returned an empty response");
  }

  const result = JSON.parse(content) as AICombinationResponse;

  // Validate all returned skill IDs against the database.
  const validSkillIds = new Set(availableSkills.map((skill) => skill.id));

  const allSkillIds = [
    ...result.recommendedSkills.map((skill) => skill.skillId),
    ...result.suggestions.flatMap((suggestion) => suggestion.skillIds),
  ];

  if (allSkillIds.some((id) => !validSkillIds.has(id))) {
    throw new Error("AI returned an unknown skill ID");
  }

  return result;
};
