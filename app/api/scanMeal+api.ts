import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const imageSchema = z.object({
  imageBase64: z.string().min(1),
});

export async function POST(req: any) {
  try {
    const { imageBase64 } = await req.json();
    imageSchema.parse({ imageBase64 }); // Validate the image data using zod

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert capable of identifying food dishes from images and providing detailed nutritional information.
When presented with a food image, identify the dish name, estimate its caloric content (kcal), and provide a breakdown of macronutrients (protein, carbs, fat) along with ingredients.
Format your response as valid JSON with the following structure:
{
  "dishName": "Name of the dish",
  "calories": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "ingredients": [
    {
      "name": "Ingredient name",
      "amount": "Amount with unit (e.g., 120g, 1 cup)",
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ]
}
Be as accurate as possible with the estimates, but ensure your response is valid JSON.`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this dish and provide its nutritional information:' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const rawResponse = completion.choices[0].message.content || '{}';
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
      
      // Validate the response has the expected structure
      if (!parsedResponse.dishName || !parsedResponse.calories || !parsedResponse.macros || !parsedResponse.ingredients) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.error('Error parsing GPT response as JSON:', parseError);
      // Fallback to a basic structure
      parsedResponse = {
        dishName: "Unknown Dish",
        calories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 },
        ingredients: []
      };
    }

    return new Response(JSON.stringify({ 
      response: parsedResponse
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof z.ZodError ? error.errors : 'Failed to process the image' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
