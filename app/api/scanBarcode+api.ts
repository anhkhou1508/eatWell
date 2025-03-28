import { z } from 'zod';

// Define the schema for the request body
const barcodeSchema = z.object({
  barcode: z.string().min(1),
});

// Define interfaces for the response data
// Updated nutriments interface to include all possible energy field variants
interface Nutriments {
  energy_kcal?: number;
  energy?: number;
  "energy-kcal"?: number;
  "energy-kcal_100g"?: number;
  "energy_value"?: number;
  "energy-kcal_value"?: number;
  "energy-kcal_serving"?: number;
  "energy_100g"?: number;
  "energy_serving"?: number;
  "energy-kj"?: number;
  "energy-kj_100g"?: number;
  proteins?: number;
  proteins_100g?: number;
  carbohydrates?: number;
  carbohydrates_100g?: number;
  fat?: number;
  fat_100g?: number;
}

interface Product {
  product_name: string;
  brands: string;
  nutriments: Nutriments;
  nutrient_levels?: any;
}

interface OpenFoodFactsResponse {
  product: Product;
  status: number;
  status_verbose: string;
}

// Helper function to extract calories from nutriments object
function extractCalories(nutriments: Nutriments): number {
  // Check different possible calorie fields in order of preference
  if (nutriments.energy_kcal && nutriments.energy_kcal > 0) return nutriments.energy_kcal;
  if (nutriments["energy-kcal"] && nutriments["energy-kcal"] > 0) return nutriments["energy-kcal"];
  if (nutriments["energy-kcal_100g"] && nutriments["energy-kcal_100g"] > 0) return nutriments["energy-kcal_100g"];
  if (nutriments["energy_100g"] && nutriments["energy_100g"] > 0) {
    // If energy is in kJ, convert to kcal (roughly divide by 4.184)
    return Math.round(nutriments["energy_100g"] / 4.184);
  }
  if (nutriments.energy && nutriments.energy > 0) {
    // If energy is in kJ, convert to kcal (roughly divide by 4.184)
    return Math.round(nutriments.energy / 4.184);
  }
  if (nutriments["energy_value"] && nutriments["energy_value"] > 0) {
    return Math.round(nutriments["energy_value"] / 4.184);
  }
  
  // If we still don't have calories, try other fields
  if (nutriments["energy-kj"] && nutriments["energy-kj"] > 0) {
    return Math.round(nutriments["energy-kj"] / 4.184);
  }
  if (nutriments["energy-kj_100g"] && nutriments["energy-kj_100g"] > 0) {
    return Math.round(nutriments["energy-kj_100g"] / 4.184);
  }
  
  // Default to 0 if no energy values found
  return 0;
}

// Helper function to extract macronutrients
function extractMacros(nutriments: Nutriments) {
  return {
    protein: nutriments.proteins || nutriments.proteins_100g || 0,
    carbs: nutriments.carbohydrates || nutriments.carbohydrates_100g || 0,
    fat: nutriments.fat || nutriments.fat_100g || 0
  };
}

export async function POST(req: any) {
  try {
    // Extract barcode from request
    const { barcode } = await req.json();
    barcodeSchema.parse({ barcode }); // Validate the barcode using zod

    console.log(`Fetching data for barcode: ${barcode}`);

    // Call Open Food Facts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data: OpenFoodFactsResponse = await response.json();

    // Check if product was found
    if (data.status !== 1) {
      return new Response(JSON.stringify({ 
        error: 'Product not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract relevant information from the response
    const { product } = data;
    
    // Log nutriments data for debugging
    console.log('Nutriments data:', JSON.stringify(product.nutriments, null, 2));
    
    const calories = extractCalories(product.nutriments);
    const macros = extractMacros(product.nutriments);
    
    const productData = {
      name: product.product_name || 'Unknown product',
      brand: product.brands || 'Unknown brand',
      calories: calories,
      macros: macros
    };

    console.log('Processed product data:', JSON.stringify(productData, null, 2));

    return new Response(JSON.stringify({ 
      product: productData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching product data:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof z.ZodError ? error.errors : 'An error occurred while fetching product data' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
