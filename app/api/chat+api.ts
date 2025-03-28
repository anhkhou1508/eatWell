import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const chatSchema = z.object({
  message: z.string().min(1),
});

export async function POST(req: any, res: any) {
  try {
    const { message } = await req.json();
    chatSchema.parse({ message }); // Validate the message using zod
    
    // Format the image for vision API
    const base64Image = message;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What dish is shown in this image? Please only respond with the name of the dish.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const responseContent = completion.choices[0]?.message?.content || 'Unable to identify dish';

    return new Response(JSON.stringify({ 
      response: responseContent,
      dishName: responseContent.trim()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof z.ZodError ? error.errors : 'An error occurred' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
