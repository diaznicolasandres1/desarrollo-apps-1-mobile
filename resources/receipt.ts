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

export interface Rating {
  comment: string;
  createdAt: string;
  id: string;
  name: string;
  score: number;
  status: "pending" | "approved" | "rejected";
  userId: string;
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
  ratings: Rating[];
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

export const getRecipeById = async (
  recipeId: string
): Promise<RecipeDetail | null> => {
  try {
    const response = await fetch(`${BASE_URL}/recipes/${recipeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const recipe: RecipeDetail = await response.json();
      return recipe;
    } else {
      console.error("Error al obtener receta:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener receta:", error);
    return null;
  }
};

export interface AddRatingRequest {
  userId: string;
  name: string;
  score: number;
  comment: string;
}

export const addRating = async (
  recipeId: string,
  ratingData: AddRatingRequest
): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/recipes/${recipeId}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    });

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      console.log("Comentario enviado exitosamente:", result);
      return true;
    } else {
      console.error("Error al enviar comentario:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error al enviar comentario:", error);
    return false;
  }
};

export interface AddFavoriteRequest {
  recipeId: string;
}

export const addToFavorites = async (
  userId: string,
  recipeId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${BASE_URL}/users/${userId}/favorite-recipe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId }),
      }
    );

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      return true;
    } else {
      console.error("Error al agregar a favoritos:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
    return false;
  }
};

export const removeFromFavorites = async (
  userId: string,
  recipeId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${BASE_URL}/users/${userId}/favorite-recipe/${recipeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 || response.status === 204) {
      console.log("Receta eliminada de favoritos");
      return true;
    } else {
      console.error("Error al eliminar de favoritos:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error);
    return false;
  }
};
