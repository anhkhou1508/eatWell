import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Define the schema for food search requests
const foodSearchSchema = z.object({
  query: z.string().min(1),
});

// Define interfaces for the response data
interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodItem {
  name: string;
  calories: number;
  macros: MacroNutrients;
  servingSize: string;
  brand?: string;
}

export async function POST(req: any, res: any) {
  try {
    // Parse and validate the request
    const { query } = await req.json();
    foodSearchSchema.parse({ query });

    console.log(`Searching for food: ${query}`);

    // Use OpenAI to get food data
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a nutrition database API. Respond with nutritional information for foods matching the user's query.
          
          Your response must be valid JSON with this exact structure:
          {
            "results": [
              {
                "name": "Food name",
                "calories": 100,
                "macros": {
                  "protein": 10,
                  "carbs": 10,
                  "fat": 5
                },
                "servingSize": "100g",
                "brand": "Brand name (optional)"
              }
            ]
          }
          
          Guidelines:
          - Return up to 5 most relevant food items
          - Make sure macros are in grams and calories are per serving
          - Include common brand names when appropriate
          - Provide realistic nutritional values based on food databases
          - Make sure servingSize is in a standard format (e.g., "100g", "1 cup")
          - For common foods, include both generic and branded versions
          `
        },
        {
          role: 'user',
          content: `Search for: ${query}`
        }
      ],
      model: 'gpt-3.5-turbo-0125',
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseContent = completion.choices[0].message.content;
    let foodData;
    
    try {
      foodData = JSON.parse(responseContent || '{"results": []}');
      
      // Validate the response has the expected structure
      if (!foodData.results || !Array.isArray(foodData.results)) {
        foodData = { results: [] };
      }
      
      // Make sure all numeric values are actual numbers
      foodData.results = foodData.results.map((item: any) => ({
        ...item,
        calories: Number(item.calories) || 0,
        macros: {
          protein: Number(item.macros?.protein) || 0,
          carbs: Number(item.macros?.carbs) || 0,
          fat: Number(item.macros?.fat) || 0
        },
        servingSize: item.servingSize || "100g"
      }));
      
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return new Response(JSON.stringify({ 
        error: "Failed to parse food data",
        results: [] 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      results: foodData.results || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Search food error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof z.ZodError ? error.errors : 'An error occurred while searching for food',
      results: []
    }), {
      status: error instanceof z.ZodError ? 400 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
