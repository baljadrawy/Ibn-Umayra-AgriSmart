
'use server';
/**
 * @fileOverview This file implements the Genkit flow for the AskAIAgentAgriculturalAdvice story.
 * It provides an AI agent that answers natural language questions from farmers, integrating
 * agricultural calendar data, live weather information, and crop-specific advice based on
 * the user's climate zone.
 *
 * - askAIAgentAgriculturalAdvice - The main function to interact with the AI agent.
 * - AskAIAgentAgriculturalAdviceInput - The input type for the function.
 * - AskAIAgentAgriculturalAdviceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Input and Output Schemas ---

const AskAIAgentAgriculturalAdviceInputSchema = z.object({
  question: z.string().describe("The farmer's natural language question about crops, weather, or agricultural calendar."),
  zone_id: z.number().describe("The ID of the farmer's climate zone for personalized advice."),
  currentDate: z.string().describe("The current Gregorian date in YYYY-MM-DD format."),
});
export type AskAIAgentAgriculturalAdviceInput = z.infer<typeof AskAIAgentAgriculturalAdviceInputSchema>;

const AskAIAgentAgriculturalAdviceOutputSchema = z.object({
  answer: z.string().describe("The AI agent's detailed agricultural advice based on the question and available data."),
  sources: z.array(z.string()).describe("A list of sources used for the advice (e.g., 'تقويم ابن عميرة - الحميمين', 'بيانات الطقس الحية')."),
  related_nawaa: z.string().optional().describe("The name of the agricultural period (Nawaa) most relevant to the advice, if applicable."),
});
export type AskAIAgentAgriculturalAdviceOutput = z.infer<typeof AskAIAgentAgriculturalAdviceOutputSchema>;

// --- Mock Service Functions ---

async function mockGetTodayData(zone_id: number) {
  console.log(`Calling mockGetTodayData for zone_id: ${zone_id}`);
  return {
    nawaa: {
      name: "سعد الأخبية",
      season: "الحميمين",
      day_in_nawaa: 4,
      days_remaining: 9,
      climate_notes: "الجو يميل للاعتدال اللطيف نهاراً مع برودة في المساء."
    },
    zone_adjustment: {
      zone_name: "المرتفعات",
      temp_note: "الحرارة المسجلة 19 مئوية وهي ضمن النطاق الطبيعي",
      timing_note: "الزراعة حالياً في ذروتها لبعض الخضروات الصيفية المبكرة"
    },
    recommendations: {
      planting: ["بامية", "كوسا", "فلفل"],
      activities: ["مراقبة رطوبة التربة", "مكافحة حشرات الربيع"],
      warnings: ["انتبه من برودة الليل المفاجئة"]
    },
    next_nawaa: {
      name: "المقدم",
      starts_in_days: 9,
      preview: "دخول الحرارة الفعلية وبداية الصيف"
    }
  };
}

async function mockGetWeatherComparison(zone_id: number) {
  return {
    weather_live: {
      temp_current: 19,
      temp_max: 23,
      temp_min: 12,
      rain_probability: 10,
    },
    match_score: 92,
    comparison_notes: "الطقس الحالي (19 درجة) متوافق تماماً مع دخول نجم سعد الأخبية في المرتفعات."
  };
}

async function mockGetCropPlantingInfo(crop_name: string, zone_id: number) {
  if (crop_name.includes('بامية')) {
    return {
      crop_name: "بامية",
      planting_nawaa_start: "سعد السعود",
      planting_nawaa_end: "المقدم",
      harvest_nawaa_start: "الثريا",
      harvest_nawaa_end: "المرزم",
      notes: "محصول صيفي يحتاج لدفء، والآن وقت مثالي للزراعة."
    };
  }
  return {
    crop_name,
    planting_nawaa_start: "غير معروف",
    planting_nawaa_end: "غير معروف",
    harvest_nawaa_start: "غير معروف",
    harvest_nawaa_end: "غير معروف",
    notes: "لا توجد معلومات محددة لهذا المحصول حالياً."
  };
}

async function mockGetNawaaDetails(nawaa_name: string, zone_id: number) {
  if (nawaa_name.includes("الأخبية")) {
    return {
      name: "سعد الأخبية",
      description: "أول نجوم فصل الحميمين، يخرج فيه الهوام من مخابئه لدفء الأرض، وتزهر فيه الأشجار.",
      climate_notes: "اعتدال النهار، دفء نسبي في الأرض.",
      agri_notes: "وقت ممتاز لزراعة القرعيات والبقوليات الصيفية."
    };
  }
  return {
    name: nawaa_name,
    description: "لا توجد معلومات مفصلة لهذا النوء حالياً.",
    climate_notes: "غير متوفر.",
    agri_notes: "غير متوفر."
  };
}

// --- Define Tools ---

const getCurrentNawaaAndRecommendations = ai.defineTool(
  {
    name: 'getCurrentNawaaAndRecommendations',
    description: 'Retrieves current Nawaa and recommendations.',
    inputSchema: z.object({ zone_id: z.number() }),
    outputSchema: z.any(),
  },
  async (input) => await mockGetTodayData(input.zone_id)
);

const getLiveWeatherComparison = ai.defineTool(
  {
    name: 'getLiveWeatherComparison',
    description: 'Fetches weather and compares with calendar.',
    inputSchema: z.object({ zone_id: z.number() }),
    outputSchema: z.any(),
  },
  async (input) => await mockGetWeatherComparison(input.zone_id)
);

const getCropPlantingSchedule = ai.defineTool(
  {
    name: 'getCropPlantingSchedule',
    description: 'Provides planting schedule for a crop.',
    inputSchema: z.object({ crop_name: z.string(), zone_id: z.number() }),
    outputSchema: z.any(),
  },
  async (input) => await mockGetCropPlantingInfo(input.crop_name, input.zone_id)
);

const getNawaaSpecificDetails = ai.defineTool(
  {
    name: 'getNawaaSpecificDetails',
    description: 'Retrieves details for a named Nawaa.',
    inputSchema: z.object({ nawaa_name: z.string(), zone_id: z.number() }),
    outputSchema: z.any(),
  },
  async (input) => await mockGetNawaaDetails(input.nawaa_name, input.zone_id)
);

// --- Define the Prompt ---

const agriculturalAdvisorPrompt = ai.definePrompt({
  name: 'agriculturalAdvisorPrompt',
  input: { schema: AskAIAgentAgriculturalAdviceInputSchema },
  output: { schema: AskAIAgentAgriculturalAdviceOutputSchema },
  tools: [getCurrentNawaaAndRecommendations, getLiveWeatherComparison, getCropPlantingSchedule, getNawaaSpecificDetails],
  prompt: `You are a helpful and expert agricultural advisor for farmers in Saudi Arabia.
Today's date is: {{{currentDate}}}. We are currently in Spring (Hameem season).
Use the tools to answer the farmer's question in Arabic. 
If the current temperature is lower than expected, explain that this is normal in Spring transitions.

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
