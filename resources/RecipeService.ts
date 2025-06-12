import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CreateRecipeRequest {
  name: string;
  description: string;
  ingredients: Ingredient;
  steps: Step;
  principalPictures: PrincipalPicture;
  userName: string;
  category: string[];
  duration: number;
  difficulty: "Fácil" | "Medio" | "Difícil";
  servings: number;
}

export interface CreateRecipeResponse {
  id: string;
  message: string;
  success: boolean;
}

export interface Ingredient {
  name: string;
  quantity: number;
  measureType: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  mediaResource?: string;
}
export interface PrincipalPicture {
  url: string;
  description: string;
}
export interface RecipeDetail {
  _id: string;
  name: string;
  ingredients: Ingredient[];
  description: string;
  steps: Step[];
  principalPictures: PrincipalPicture[];
  userName: string;
  category: string[];
  duration: number;
  difficulty: string;
  servings: number;
  status: string;
  ratings: any[];
  createdAt: string;
  __v: number;
}
export type RecipeListResponse = RecipeDetail[];
class RecipeService {
  private baseUrl = "https://desarrollo-apps-1-back-end.vercel.app";

  async createRecipe(
    recipeData: CreateRecipeRequest
  ): Promise<CreateRecipeResponse> {
    try {
      console.log("=== CREANDO RECETA ===");
      console.log("URL:", `${this.baseUrl}/recipes`);
      console.log("Método:", "POST");
      console.log("Headers:", {
        "Content-Type": "application/json",
      });
      console.log("Request Body:", JSON.stringify(recipeData, null, 2));
      console.log("Username enviado:", recipeData.userName);
      console.log("=====================");
      const response = await fetch(`${this.baseUrl}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.status === 200 || response.status === 201) {
        const result = await response.json();
        console.log("Response exitosa:", result);

        return {
          success: true,
          message: "Receta creada exitosamente",
          id: result._id || result.id || "unknown",
        };
      } else {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }
  async getAllRecipes(): Promise<RecipeListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Convierte el JSON (un array) a RecipeDetail[]
        const result: RecipeListResponse = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error obteniendo listado de recetas:", error);
      throw error;
    }
  }
  async getRecipeById(recipeId: string): Promise<RecipeDetail> {
    try {
      console.log('=== OBTENIENDO RECETA POR ID ===');
      console.log('URL:', `${this.baseUrl}/recipes/${recipeId}`);
      console.log('Método:', 'GET');
      console.log('===============================');

      const response = await fetch(`${this.baseUrl}/recipes/${recipeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result: RecipeDetail = await response.json();
        console.log('Response exitosa (detalle):', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('Error response (detalle):', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error al obtener receta por ID:', error);
      throw error;
    }
  }
}

export const recipeService = new RecipeService();
