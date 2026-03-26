
'use server';
/**
 * @fileOverview This file implements the Genkit flow for the AskAIAgentAgriculturalAdvice story.
 * It provides an AI agent that answers natural language questions from farmers, integrating
 * agricultural calendar data, live weather information, and crop-specific advice based on
 * the user's climate zone.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CLIMATE_ZONES_DATA, CALENDAR_2026, NAWAA_RECOMMENDATIONS } from '@/lib/location-data';

// --- Input and Output Schemas ---

const AskAIAgentAgriculturalAdviceInputSchema = z.object({
  question: z.string().describe("The farmer's natural language question about crops, weather, or agricultural calendar."),
  zone_id: z.string().describe("The ID of the farmer's climate zone (e.g., 'west', 'central')."),
  currentDate: z.string().describe("The current Gregorian date in YYYY-MM-DD format."),
});
export type AskAIAgentAgriculturalAdviceInput = z.infer<typeof AskAIAgentAgriculturalAdviceInputSchema>;

const AskAIAgentAgriculturalAdviceOutputSchema = z.object({
  answer: z.string().describe("The AI agent's detailed agricultural advice based on the question and available data."),
  sources: z.array(z.string()).describe("A list of sources used for the advice."),
  related_nawaa: z.string().optional().describe("The name of the agricultural period (Nawaa) most relevant to the advice."),
});
export type AskAIAgentAgriculturalAdviceOutput = z.infer<typeof AskAIAgentAgriculturalAdviceOutputSchema>;

// --- Real Logic for Tools ---

async function getTodayData(zone_id: string, dateStr: string) {
  const zone = CLIMATE_ZONES_DATA.find(z => z.id === zone_id) || CLIMATE_ZONES_DATA[0];
  const offset = zone.offset;
  const now = new Date(dateStr);
  const effectiveDate = new Date(now.getTime() - (offset * 24 * 60 * 60 * 1000));
  const todayStr = effectiveDate.toISOString().split('T')[0];
  const current = CALENDAR_2026.find(n => todayStr >= n.start && todayStr <= n.end);

  if (current) {
    const recs = NAWAA_RECOMMENDATIONS[current.name] || { planting: [], activities: [], warnings: [] };
    return {
      nawaa: current,
      zone_info: zone,
      recommendations: recs
    };
  }
  return null;
}

// --- Define Tools ---

const getCurrentNawaaAndRecommendations = ai.defineTool(
  {
    name: 'getCurrentNawaaAndRecommendations',
    description: 'Retrieves current Nawaa and recommendations based on zone and date.',
    inputSchema: z.object({ zone_id: z.string(), date: z.string() }),
    outputSchema: z.any(),
  },
  async (input) => await getTodayData(input.zone_id, input.date)
);

// --- Define the Prompt ---

const agriculturalAdvisorPrompt = ai.definePrompt({
  name: 'agriculturalAdvisorPrompt',
  input: { schema: AskAIAgentAgriculturalAdviceInputSchema },
  output: { schema: AskAIAgentAgriculturalAdviceOutputSchema },
  tools: [getCurrentNawaaAndRecommendations],
  prompt: `You are an expert agricultural advisor specializing in the Ibn Umayra calendar for Saudi Arabia.
Today's date is: {{{currentDate}}}. The user is in the zone: {{{zone_id}}}.

Always use the tools to get the correct Nawaa and recommendations for the specific zone.
Jeddah is in the 'west' zone. This zone is hot and humid, suitable for tropical fruits like Mango, Papaya, and Banana.
If the user asks about Jeddah specifically, emphasize that it follows the coastal climate which is warmer than Taif (the reference city).

Answer the farmer's question in a helpful, professional, and culturally appropriate Arabic tone.

Farmer's Question: {{{question}}}`,
});

// --- Define the Flow ---

const askAIAgentAgriculturalAdviceFlow = ai.defineFlow(
  {
    name: 'askAIAgentAgriculturalAdviceFlow',
    inputSchema: AskAIAgentAgriculturalAdviceInputSchema,
    outputSchema: AskAIAgentAgriculturalAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await agriculturalAdvisorPrompt(input);
    if (!output) throw new Error('Failed to get a response.');
    return output;
  }
);

export async function askAIAgentAgriculturalAdvice(input: AskAIAgentAgriculturalAdviceInput): Promise<AskAIAgentAgriculturalAdviceOutput> {
  return askAIAgentAgriculturalAdviceFlow(input);
}
