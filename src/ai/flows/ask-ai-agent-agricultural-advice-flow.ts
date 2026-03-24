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
  sources: z.array(z.string()).describe("A list of sources used for the advice (e.g., 'تقويم ابن عميرة - العطف', 'بيانات الطقس الحية')."),
  related_nawaa: z.string().optional().describe("The name of the agricultural period (Nawaa) most relevant to the advice, if applicable."),
});
export type AskAIAgentAgriculturalAdviceOutput = z.infer<typeof AskAIAgentAgriculturalAdviceOutputSchema>;

// --- Mock Service Functions (representing backend API calls) ---

// These functions would typically call the actual backend FastAPI endpoints.
// For this Genkit flow implementation, they return mock data to simulate the responses.

async function mockGetTodayData(zone_id: number) {
  // Simulate API call to /api/today
  console.log(`Calling mockGetTodayData for zone_id: ${zone_id}`);
  // Simplified example response based on the provided API example
  return {
    nawaa: {
      name: "العطف",
      season: "الوسم",
      day_in_nawaa: 8,
      days_remaining: 5,
      climate_notes: "الجو يميل للاعتدال، رياح شمالية خفيفة متوقعة."
    },
    zone_adjustment: {
      zone_name: "الهضبة الوسطى",
      temp_note: "الحرارة أعلى بـ 3-5 درجات عن الطائف",
      timing_note: "الزراعة تتأخر أسبوع عن التقويم الأصلي"
    },
    recommendations: {
      planting: ["طماطم", "خيار", "فلفل"],
      activities: ["موسم زراعي ممتاز للخضروات"],
      warnings: ["راقب الرياح الشمالية الخفيفة"]
    },
    next_nawaa: {
      name: "السماك",
      starts_in_days: 5,
      preview: "الجو يبدأ يتقلب، احذر الأمراض الفطرية"
    }
  };
}

async function mockGetWeatherComparison(zone_id: number) {
  // Simulate API call to /api/weather/compare
  console.log(`Calling mockGetWeatherComparison for zone_id: ${zone_id}`);
  // Simplified example response
  return {
    weather_live: {
      temp_current: 24.5,
      temp_max: 29,
      temp_min: 18,
      rain_probability: 15,
    },
    match_score: 85,
    comparison_notes: "الطقس الحالي متوافق بنسبة كبيرة مع توقعات التقويم لهذا اليوم."
  };
}

async function mockGetCropPlantingInfo(crop_name: string, zone_id: number) {
  // Simulate API call to /api/crops/{name}/when
  console.log(`Calling mockGetCropPlantingInfo for crop: ${crop_name}, zone_id: ${zone_id}`);
  // Simplified example response
  if (crop_name.includes('طماطم')) {
    return {
      crop_name: "طماطم",
      planting_nawaa_start: "العطف",
      planting_nawaa_end: "السماك",
      harvest_nawaa_start: "الجبهة",
      harvest_nawaa_end: "الزبرة",
      notes: "وقت مثالي لنقل شتلات الطماطم بعد انكسار البرد."
    };
  } else if (crop_name.includes('قمح')) {
    return {
      crop_name: "قمح",
      planting_nawaa_start: "الوسم",
      planting_nawaa_end: "المربعانية",
      harvest_nawaa_start: "الثريا",
      harvest_nawaa_end: "الدبران",
      notes: "محصول شتوي يحتاج لبرد جيد في بداية نموه."
    };
  }
  return {
    crop_name,
    planting_nawaa_start: "غير معروف",
    planting_nawaa_end: "غير معروف",
    harvest_nawaa_start: "غير معروف",
    harvest_nawaa_end: "غير معروف",
    notes: "لا توجد معلومات محددة لهذا المحصول في منطقتك حاليًا."
  };
}

async function mockGetNawaaDetails(nawaa_name: string, zone_id: number) {
  // Simulate API call to /api/nawaa/{id} or a more specific lookup
  console.log(`Calling mockGetNawaaDetails for Nawaa: ${nawaa_name}, zone_id: ${zone_id}`);
  if (nawaa_name === "العطف") {
    return {
      name: "العطف",
      description: "نجم العطف يدخل عادة في أواخر الشتاء، ويشهد اعتدالاً في درجات الحرارة. هو وقت ممتاز لبداية العديد من الزراعات الربيعية.",
      climate_notes: "الجو يميل للاعتدال، رياح شمالية خفيفة متوقعة.",
      agri_notes: "موسم زراعي ممتاز للخضروات، تجهيز الأرض للزراعات الصيفية."
    };
  } else if (nawaa_name === "السماك") {
    return {
      name: "السماك",
      description: "نجم السماك يشهد تقلبات جوية، مع احتمالية لهطول الأمطار وبداية ارتفاع في درجات الحرارة تدريجياً.",
      climate_notes: "تقلبات جوية، ارتفاع تدريجي في الحرارة، احتمالية أمطار.",
      agri_notes: "احذر من الأمراض الفطرية بسبب التقلبات، استمر في زراعة الخضروات الصيفية المبكرة."
    };
  }
  return {
    name: nawaa_name,
    description: "لا توجد معلومات مفصلة لهذا النوء حاليًا.",
    climate_notes: "غير متوفر.",
    agri_notes: "غير متوفر."
  };
}

// --- Define Tools ---

const getCurrentNawaaAndRecommendations = ai.defineTool(
  {
    name: 'getCurrentNawaaAndRecommendations',
    description: 'Retrieves the current agricultural period (Nawaa) and its specific recommendations, adjusted for the specified climate zone. Use this tool when the user asks about "today", "now", "current recommendations", or general advice for the current period.',
    inputSchema: z.object({
      zone_id: z.number().describe("The ID of the farmer's climate zone."),
    }),
    outputSchema: z.object({
        nawaa: z.object({
            name: z.string().describe("The Arabic name of the current Nawaa."),
            season: z.string().describe("The season this Nawaa belongs to."),
            day_in_nawaa: z.number().describe("Current day within this Nawaa."),
            days_remaining: z.number().describe("Days remaining in this Nawaa."),
            climate_notes: z.string().describe("General climate observations for this Nawaa."),
        }),
        zone_adjustment: z.object({
            zone_name: z.string().describe("The name of the climate zone."),
            temp_note: z.string().describe("Temperature adjustments for this zone compared to Taif."),
            timing_note: z.string().describe("Timing adjustments for agricultural activities in this zone."),
        }),
        recommendations: z.object({
            planting: z.array(z.string()).describe("Recommended crops for planting."),
            activities: z.array(z.string()).describe("General agricultural activities recommended."),
            warnings: z.array(z.string()).describe("Important warnings or precautions."),
        }),
        next_nawaa: z.object({
            name: z.string().describe("Name of the upcoming Nawaa."),
            starts_in_days: z.number().describe("Days until the next Nawaa starts."),
            preview: z.string().describe("A brief preview of the next Nawaa."),
        }).optional(),
    }),
  },
  async (input) => {
    const data = await mockGetTodayData(input.zone_id);
    return data;
  }
);

const getLiveWeatherComparison = ai.defineTool(
  {
    name: 'getLiveWeatherComparison',
    description: 'Fetches live weather data and compares it with the agricultural calendar predictions for the specified climate zone, returning a match score and comparison notes. Use this tool when the user asks about "weather", "forecast", "compare weather", or how current weather affects agricultural advice.',
    inputSchema: z.object({
      zone_id: z.number().describe("The ID of the farmer's climate zone."),
    }),
    outputSchema: z.object({
      weather_live: z.object({
        temp_current: z.number().describe("Current temperature in Celsius."),
        temp_max: z.number().describe("Maximum expected temperature for the day."),
        temp_min: z.number().describe("Minimum expected temperature for the day."),
        rain_probability: z.number().describe("Probability of rain in percentage."),
      }),
      match_score: z.number().describe("Score indicating how well live weather matches calendar predictions (0-100)."),
      comparison_notes: z.string().describe("Brief notes comparing live weather with calendar predictions."),
    }),
  },
  async (input) => {
    const data = await mockGetWeatherComparison(input.zone_id);
    return data;
  }
);

const getCropPlantingSchedule = ai.defineTool(
  {
    name: 'getCropPlantingSchedule',
    description: 'Provides the recommended planting and harvest times for a specific crop within the user\'s climate zone, according to the agricultural calendar. Use this tool when the user asks about "planting", "harvesting", "when to plant", or "crop schedule" for a particular crop.',
    inputSchema: z.object({
      crop_name: z.string().describe("The name of the crop (e.g., 'طماطم', 'قمح')."),
      zone_id: z.number().describe("The ID of the farmer's climate zone."),
    }),
    outputSchema: z.object({
      crop_name: z.string().describe("The name of the crop."),
      planting_nawaa_start: z.string().describe("The starting Nawaa for planting this crop."),
      planting_nawaa_end: z.string().describe("The ending Nawaa for planting this crop."),
      harvest_nawaa_start: z.string().describe("The starting Nawaa for harvesting this crop."),
      harvest_nawaa_end: z.string().describe("The ending Nawaa for harvesting this crop."),
      notes: z.string().describe("Specific notes or advice for this crop's schedule."),
    }),
  },
  async (input) => {
    const data = await mockGetCropPlantingInfo(input.crop_name, input.zone_id);
    return data;
  }
);

const getNawaaSpecificDetails = ai.defineTool(
    {
      name: 'getNawaaSpecificDetails',
      description: 'Retrieves detailed information, including climate notes and agricultural advice, for a specific agricultural period (Nawaa). Use this tool when the user explicitly asks about a named Nawaa (e.g., "What about العطف?", "tell me about السماك").',
      inputSchema: z.object({
        nawaa_name: z.string().describe("The name of the agricultural period (Nawaa), e.g., 'العطف' or 'السماك'."),
        zone_id: z.number().describe("The ID of the farmer's climate zone (for potential zone-specific notes). This parameter is primarily for context and future enhancements; actual Nawaa details might be generic."),
      }),
      outputSchema: z.object({
        name: z.string().describe("The name of the Nawaa."),
        description: z.string().describe("A general description of the Nawaa."),
        climate_notes: z.string().describe("Specific climate notes for this Nawaa."),
        agri_notes: z.string().describe("Specific agricultural notes and recommendations for this Nawaa."),
      }),
    },
    async (input) => {
      const data = await mockGetNawaaDetails(input.nawaa_name, input.zone_id);
      return data;
    }
  );


// --- Define the Prompt ---

const agriculturalAdvisorPrompt = ai.definePrompt({
  name: 'agriculturalAdvisorPrompt',
  input: { schema: AskAIAgentAgriculturalAdviceInputSchema },
  output: { schema: AskAIAgentAgriculturalAdviceOutputSchema },
  tools: [getCurrentNawaaAndRecommendations, getLiveWeatherComparison, getCropPlantingSchedule, getNawaaSpecificDetails],
  prompt: `You are a helpful and expert agricultural advisor for farmers in Saudi Arabia, specializing in the "Ibn Umayra" agricultural calendar.
Your goal is to provide immediate, intelligent, and personalized agricultural advice based on the farmer's question, their climate zone, the agricultural calendar, and live weather data.

Today's date is: {{{currentDate}}}.
The farmer is in climate zone ID: {{{zone_id}}}.

Here's how you should operate:
1.  **Understand the farmer's question thoroughly.** Identify key entities like crop names, specific Nawaa names, or whether they are asking about current conditions or future planning.
2.  **Utilize the provided tools to gather relevant information.**
    *   Use the \`getCurrentNawaaAndRecommendations\` tool if the farmer asks about general current conditions, "today's advice", or "what to do now".
    *   Use the \`getLiveWeatherComparison\` tool if the farmer asks about the "weather", "forecast", or how current weather relates to farming.
    *   Use the \`getCropPlantingSchedule\` tool if the farmer asks about when to plant or harvest a *specific crop*. Extract the crop name from the question.
    *   Use the \`getNawaaSpecificDetails\` tool if the farmer asks specifically about a named Nawaa (e.g., "What about العطف?"). Extract the Nawaa name from the question.
3.  **Synthesize information from the tools and your expert knowledge.**
4.  **Formulate a personalized answer in Arabic**, considering the farmer's climate zone (ID: {{{zone_id}}}) and adjusting advice accordingly.
5.  **Always cite your sources** by including them in the 'sources' array. If you use information from a Nawaa or weather data, mention "تقويم ابن عميرة" or "بيانات الطقس الحية".
6.  **If a specific Nawaa is central to your advice**, include its name in the 'related_nawaa' field.

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
    if (!output) {
      throw new Error('Failed to get a response from the AI agent.');
    }
    return output;
  }
);

// --- Wrapper Function ---

export async function askAIAgentAgriculturalAdvice(input: AskAIAgentAgriculturalAdviceInput): Promise<AskAIAgentAgriculturalAdviceOutput> {
  return askAIAgentAgriculturalAdviceFlow(input);
}
