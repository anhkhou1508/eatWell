import { z } from 'zod';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { File } from 'buffer';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Define the interfaces for structured response
interface Ingredient {
  name: string;
  amount: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodAnalysis {
  dishName: string;
  calories: number;
  macros: MacroNutrients;
  ingredients: Ingredient[];
}

// Helper function to round macro values to one decimal place
function roundMacroValue(value: number): number {
  return Math.round(value * 10) / 10; // Round to one decimal place
}

// Function to process food analysis data and round all macro values
function processFoodAnalysis(data: FoodAnalysis): FoodAnalysis {
  // Round macros in the total
  const processedData: FoodAnalysis = {
    ...data,
    calories: Math.round(data.calories), // Round calories to whole number
    macros: {
      protein: roundMacroValue(data.macros.protein),
      carbs: roundMacroValue(data.macros.carbs),
      fat: roundMacroValue(data.macros.fat)
    },
    ingredients: data.ingredients.map(ingredient => ({
      ...ingredient,
      protein: roundMacroValue(ingredient.protein),
      carbs: roundMacroValue(ingredient.carbs),
      fat: roundMacroValue(ingredient.fat)
    }))
  };
  
  return processedData;
}

// Updated schema to handle either a text message or audio data
const requestSchema = z.object({
  message: z.string().optional(),
  audioBase64: z.string().optional(),
  extractIngredients: z.boolean().optional(),
}).refine((data) => data.message || data.audioBase64, {
  message: "Either message or audioBase64 must be provided"
});

export async function POST(req: any, res: any) {
  try {
    const body = await req.json();
    console.log('Received request with body type:', 
      body.message ? 'text message' : (body.audioBase64 ? 'audio data' : 'unknown'));
    
    const data = requestSchema.parse(body);
    
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key is not configured. Please set the EXPO_PUBLIC_OPENAI_API_KEY environment variable.' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize with empty string to avoid null/undefined issues
    let messageText: string = data.message || '';
    
    // If we have audio data, transcribe it first using Whisper
    if (data.audioBase64 && messageText === '') {
      try {
        console.log('Transcribing audio with Whisper...');

        // Create a temporary file with the audio data
        const audioBuffer = Buffer.from(data.audioBase64, 'base64');
        
        // Create a File object that OpenAI can work with
        const audioFile = new File([audioBuffer], 'audio.m4a', { type: 'audio/m4a' });
        
        // Use Whisper to transcribe the audio
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
        });
        
        messageText = transcription.text;
        console.log('Transcription result:', messageText);
        
        if (messageText.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Could not transcribe audio. Please try speaking more clearly or in a quieter environment.' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (error) {
        console.error('Whisper transcription error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to transcribe audio: ' + (error instanceof Error ? error.message : 'Unknown error') }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Ensure messageText isn't empty before proceeding
    if (messageText.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'No message content provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if we need to extract structured food data
    if (data.extractIngredients === true) {
      console.log('Extracting detailed food information with structured data...');
      
      try {
        const systemPrompt = `
          You are a professional nutrition database system. Extract the food items from the user's description
          and provide detailed nutritional information in a structured JSON format.
          
          For each food item mentioned, include:
          1. name: The name of the food item
          2. amount: A reasonable serving size (default to "100g" if unsure)
          3. protein: Protein content in grams
          4. carbs: Carbohydrate content in grams
          5. fat: Fat content in grams
          
          Also calculate the total calories and macronutrients for the entire meal.
          
          IMPORTANT: Return ONLY valid JSON with this structure without any explanation or markdown formatting:
          {
            "dishName": "Name for the overall meal",
            "calories": totalCalories,
            "macros": {
              "protein": totalProteinInGrams,
              "carbs": totalCarbsInGrams,
              "fat": totalFatInGrams
            },
            "ingredients": [
              {
                "name": "Ingredient Name",
                "amount": "100g",
                "protein": proteinInGrams,
                "carbs": carbsInGrams,
                "fat": fatInGrams
              },
              ...more ingredients
            ]
          }
          
          Remember to respond ONLY with the JSON, no additional text or markdown.
        `;
        
        const userPrompt = `Extract detailed nutritional information from this food description: "${messageText}"`;
        
        const completion = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'gpt-4'
        });
        
        const responseContent = completion.choices[0].message.content || '{}';
        console.log('Structured food analysis response received');
        
        // Parse the JSON response - make this more robust to handle potential text before/after JSON
        try {
          // Try to find JSON content even if there's other text around it
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          const jsonContent = jsonMatch ? jsonMatch[0] : '{}';
          const foodAnalysis = JSON.parse(jsonContent) as FoodAnalysis;
          
          // Process and round the macro values
          const processedFoodAnalysis = processFoodAnalysis(foodAnalysis);
        
          return new Response(
            JSON.stringify({ 
              structuredFoodData: processedFoodAnalysis,
              transcription: data.audioBase64 ? messageText : undefined 
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          console.log('Original response:', responseContent);
          
          // Fallback to using gpt-3.5-turbo to format the response
          try {
            const formattingResponse = await openai.chat.completions.create({
              messages: [
                { role: 'system', content: 'Convert the following nutrition information into valid JSON following this structure exactly: {"dishName": string, "calories": number, "macros": {"protein": number, "carbs": number, "fat": number}, "ingredients": [{"name": string, "amount": string, "protein": number, "carbs": number, "fat": number}, ...]}' },
                { role: 'user', content: responseContent }
              ],
              model: 'gpt-3.5-turbo'
            });
            
            const formattedContent = formattingResponse.choices[0].message.content || '{}';
            const jsonMatch = formattedContent.match(/\{[\s\S]*\}/);
            const jsonContent = jsonMatch ? jsonMatch[0] : '{}';
            const foodAnalysis = JSON.parse(jsonContent) as FoodAnalysis;
            
            // Process and round the macro values
            const processedFoodAnalysis = processFoodAnalysis(foodAnalysis);
            
            return new Response(
              JSON.stringify({ 
                structuredFoodData: processedFoodAnalysis,
                transcription: data.audioBase64 ? messageText : undefined 
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          } catch (fallbackError) {
            throw new Error('Failed to parse nutrition data: ' + (fallbackError instanceof Error ? fallbackError.message : 'Unknown error'));
          }
        }
      } catch (error) {
        console.error('Error extracting structured food data:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to extract structured food information: ' + (error instanceof Error ? error.message : 'Unknown error'),
            transcription: data.audioBase64 ? messageText : undefined 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Original behavior: simple text analysis
      console.log('Processing food description:', messageText);
      
      const completion = await openai.chat.completions.create({
        messages: [{ 
          role: 'user', 
          content: `You are a professional nutrition coach. Please analyze and provide nutritional information for this food: "${messageText}". Include calories and macronutrients if possible.` 
        }],
        model: 'gpt-3.5-turbo',
      });
      
      const responseContent = completion.choices[0].message.content || '';
      console.log('Nutrition analysis response:', responseContent);
      
      return new Response(
        JSON.stringify({ 
          response: responseContent,
          transcription: data.audioBase64 ? messageText : undefined 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in voice log API:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: ' + error.errors.map(e => e.message).join(', ') }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else if (error instanceof OpenAI.APIError) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API error: ' + error.message }),
        {
          status: error.status || 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}
