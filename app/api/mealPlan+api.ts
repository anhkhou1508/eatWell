import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const chatSchema = z.object({
  message: z.string().min(1),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
});

// Days of the week for meal plan detection
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'today', 'tomorrow', 'next week', 'tmr', 'next monday', 'next tuesday', 'next wednesday', 'next thursday', 'next friday', 'next saturday', 'next sunday'];

// Function to generate an image using DALL-E
async function generateMealImage(description: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A beautiful, appetizing photo of ${description}. Food photography style, well-lit, professional quality, realistic, detailed.`,
      n: 1,
      size: "1024x1024",
    });
    
    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    return null;
  }
}

export async function POST(req: any, res: any) {
  try {
    const body = await req.json();
    const { message, chatHistory = [] } = body;
    chatSchema.parse({ message, chatHistory }); // Validate the input using zod

    console.log('Received message:', message);

    // Check if the message is related to meal planning
    const isMealPlanRequest = /meal plan|diet plan|eating plan|food plan|what (should|can) I eat/i.test(message);
    
    // Check if the request is for specific days
    const messageLower = message.toLowerCase();
    const requestedDays = daysOfWeek.filter(day => messageLower.includes(day));
    const isSpecificDayRequest = requestedDays.length > 0 && isMealPlanRequest;

    // Prepare the system message based on the request type
    let systemMessage = 'You are a helpful fitness assistant. Provide concise, accurate information about fitness, nutrition, and health topics.';
    
    if (isMealPlanRequest) {
      if (isSpecificDayRequest) {
        // Format the requested days with proper capitalization
        const formattedDays = requestedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
        systemMessage = `You are a nutrition expert. Create a meal plan for ${formattedDays.join(', ')} with breakfast, lunch, and dinner. Format the response as a structured meal plan object.`;
      } else {
        systemMessage = 'You are a nutrition expert. Create a 5-day meal plan (Monday through Friday) with breakfast, lunch, and dinner for each day. Format the response as a structured meal plan object.';
      }
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemMessage },
      // Include chat history if available
      ...chatHistory,
      { role: 'user', content: message }
    ];

    if (isMealPlanRequest) {
      // Create format instructions based on whether specific days were requested
      let formatInstructions = '';
      
      if (isSpecificDayRequest) {
        // Format instructions for specific days
        const formattedDays = requestedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
        formatInstructions = `
        Format your response in two parts:
        1. A brief text introduction to the meal plan
        2. A JSON object in the following structure (I'll parse this later):
        {
          "days": [
            ${formattedDays.map(day => `{
              "day": "${day}",
              "meals": {
                "breakfast": {
                  "name": "Meal description",
                  "calories": "350-450",
                  "macros": {
                    "protein": "20-25g",
                    "carbs": "30-40g", 
                    "fat": "15-20g"
                  },
                  "imageDescription": "A brief description of what the meal looks like, e.g., 'Bowl of oatmeal with berries and nuts'"
                },
                "lunch": {
                  "name": "Meal description",
                  "calories": "500-650",
                  "macros": {
                    "protein": "25-35g",
                    "carbs": "40-60g", 
                    "fat": "15-25g"
                  },
                  "imageDescription": "A brief description of what the meal looks like"
                },
                "dinner": {
                  "name": "Meal description",
                  "calories": "450-600",
                  "macros": {
                    "protein": "30-40g",
                    "carbs": "30-50g", 
                    "fat": "15-25g"
                  },
                  "imageDescription": "A brief description of what the meal looks like"
                }
              }
            }`).join(',\n            ')}
          ]
        }
        Only include the raw JSON object after your introduction, no markdown formatting or code blocks.
        `;
      } else {
        // Format instructions for a full week plan
        formatInstructions = `
        Format your response in two parts:
        1. A brief text introduction to the meal plan
        2. A JSON object in the following structure (I'll parse this later):
        {
          "days": [
            {
              "day": "Monday",
              "meals": {
                "breakfast": {
                  "name": "Meal description",
                  "calories": "350-450",
                  "macros": {
                    "protein": "20-25g",
                    "carbs": "30-40g", 
                    "fat": "15-20g"
                  },
                  "imageDescription": "A brief description of what the meal looks like, e.g., 'Bowl of oatmeal with berries and nuts'"
                },
                "lunch": {
                  "name": "Meal description",
                  "calories": "500-650",
                  "macros": {
                    "protein": "25-35g",
                    "carbs": "40-60g", 
                    "fat": "15-25g"
                  },
                  "imageDescription": "A brief description of what the meal looks like"
                },
                "dinner": {
                  "name": "Meal description",
                  "calories": "450-600",
                  "macros": {
                    "protein": "30-40g",
                    "carbs": "30-50g", 
                    "fat": "15-25g"
                  },
                  "imageDescription": "A brief description of what the meal looks like"
                }
              }
            },
            ... (repeat for Tuesday through Friday)
          ]
        }
        Only include the raw JSON object after your introduction, no markdown formatting or code blocks.
        `;
      }
      
      // Add the format instructions
      messages.push({
        role: 'system',
        content: formatInstructions
      });
    }

    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: 'gpt-3.5-turbo',
      temperature: isMealPlanRequest ? 0.7 : 0.9,
    });

    const aiResponse = completion.choices[0].message.content || '';
    
    if (isMealPlanRequest) {
      try {
        // Parse the response to extract the meal plan JSON
        // First, attempt to find a JSON object, even if it's inside a code block
        let jsonText;
        let textResponse = ''; // Initialize with empty string to avoid undefined error
        
        // Try to match a JSON object between code blocks first
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonText = codeBlockMatch[1];
          // Get the text before the code block
          textResponse = aiResponse.split('```')[0].trim();
        } else {
          // Fall back to the previous approach - looking for any JSON object
          const jsonMatch = aiResponse.match(/(\{[\s\S]*\})/);
          if (jsonMatch && jsonMatch[0]) {
            jsonText = jsonMatch[0];
            textResponse = aiResponse.split(jsonMatch[0])[0].trim();
          }
        }
        
        if (jsonText) {
          // Clean any markdown or code block indicators from the text response
          textResponse = textResponse.replace(/```(?:json)?/g, '').trim();
          
          try {
            const mealPlanJson = JSON.parse(jsonText);
            
            // Generate images for a single day's meals
            // To keep response times reasonable and API costs down, we'll just generate for the first day
            // In a production app, you might want to generate images for all days or use a queue system
            if (mealPlanJson.days && mealPlanJson.days.length > 0) {
              const firstDay = mealPlanJson.days[0];
              
              // Generate image just for breakfast (one meal) as requested
              const breakfastImage = await generateMealImage(firstDay.meals.breakfast.imageDescription);
              
              // Add image URL to the meal plan
              firstDay.meals.breakfast.imageUrl = breakfastImage;
            }
            
            // Return both text and structured meal plan
            return new Response(JSON.stringify({ 
              response: textResponse, // The text part
              mealPlan: mealPlanJson // The structured meal plan
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
          }
        }
      } catch (error) {
        console.error('Error extracting meal plan JSON:', error);
      }
    }

    // Clean any markdown from the response for non-meal plan requests or if parsing failed
    const cleanedResponse = aiResponse.replace(/```(?:json)?[\s\S]*?```/g, '').replace(/```/g, '').trim();
    
    // Return regular response for non-meal plan requests or if parsing failed
    return new Response(JSON.stringify({ response: cleanedResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof z.ZodError ? error.errors : 'An error occurred processing your request' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
