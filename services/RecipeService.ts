import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CreateRecipeRequest {
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    measureType: string;
  }>;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    mediaResource?: string;
  }>;
  principalPictures: Array<{
    url: string;
    description: string;
  }>;
  userName: string;
  category: string[];
  duration: number;
  difficulty: "facil" | "media" | "dificil";
  servings: number;
}

export interface CreateRecipeResponse {
  id: string;
  message: string;
  success: boolean;
}

class RecipeService {
  private baseUrl = 'https://desarrollo-apps-1-back-end.vercel.app';

  async createRecipe(recipeData: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    try {
      console.log('=== CREANDO RECETA ===');
      console.log('URL:', `${this.baseUrl}/recipes`);
      console.log('Método:', 'POST');
      console.log('Headers:', {
        'Content-Type': 'application/json',
      });
      console.log('Request Body:', JSON.stringify(recipeData, null, 2));
      console.log('Username enviado:', recipeData.userName);
      console.log('=====================');

      const response = await fetch(`${this.baseUrl}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.status === 200 || response.status === 201) {
        const result = await response.json();
        console.log('Response exitosa:', result);
        
        return {
          success: true,
          message: "Receta creada exitosamente",
          id: result._id || result.id || "unknown"
        };
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }
}

export const recipeService = new RecipeService(); 