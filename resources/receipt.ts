import { BASE_URL } from "@/constants/config";

export interface CreateRecipeRequest {
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  principalPictures: PrincipalPicture[];
  userId: string;
  category: string[];
  duration: number;
  difficulty: "Fácil" | "Medio" | "Difícil";
  servings: number;
  status: string;
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
  userId: string;
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

export const createRecipe = async (
  recipeData: CreateRecipeRequest
): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
    });

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      console.log("Response exitosa:", result);

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error al crear receta:", error);
    return false;
  }
};
