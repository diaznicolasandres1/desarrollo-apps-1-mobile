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
  isUpdate?: boolean;
  originalRecipeId?: string;
  isReplacement?: boolean;
  recipeToReplaceId?: string;
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

export const searchRecipes = async (filters: {
  name?: string;
  includeIngredients?: string[];
  excludeIngredients?: string[];
  category?: string;
  userId?: string;
  onlyApproved?: boolean;
}): Promise<RecipeDetail[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.name) {
      params.append("name", filters.name);
    }
    if (filters.includeIngredients && filters.includeIngredients.length > 0) {
      params.append("include", filters.includeIngredients.join(","));
    }
    if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
      params.append("exclude", filters.excludeIngredients.join(","));
    }
    if (filters.category) {
      params.append("category", filters.category);
    }
    if (filters.userId) {
      params.append("userId", filters.userId);
    }
    params.append("onlyApproved", (filters.onlyApproved ?? false).toString());

    const response = await fetch(
      `${BASE_URL}/recipes/filter?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result: RecipeDetail[] = await response.json();
      return result;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error buscando recetas:", error);
    return [];
  }
};

export const getFeaturedRecipes = async (
  limit: number = 3,
  sort: string = "desc"
): Promise<RecipeDetail[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes?onlyApproved=true&limit=${limit}&sort=${sort}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result: RecipeDetail[] = await response.json();
      return result;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error obteniendo recetas destacadas:", error);
    return [];
  }
};

export const getRecipesByCategory = async (
  category: string
): Promise<RecipeDetail[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/filter?onlyApproved=true&category=${encodeURIComponent(category)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result: RecipeDetail[] = await response.json();
      return result;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error obteniendo recetas por categoría:", error);
    return [];
  }
};

export const getUserRecipes = async (
  userId: string
): Promise<RecipeDetail[]> => {
  try {
    const response = await fetch(`${BASE_URL}/recipes/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result: RecipeDetail[] = await response.json();
      return result;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error obteniendo recetas del usuario:", error);
    return [];
  }
};

export const updateRecipe = async (
  recipeId: string,
  recipeData: CreateRecipeRequest
): Promise<boolean> => {
  try {
    console.log("=== ACTUALIZANDO RECETA ===");
    console.log("URL:", `${BASE_URL}/recipes/${recipeId}`);
    console.log("Método:", "PUT");
    console.log("Recipe ID:", recipeId);
    console.log("Request Body:", JSON.stringify(recipeData, null, 2));
    console.log("==========================");

    const response = await fetch(`${BASE_URL}/recipes/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
    });

    console.log("Update response status:", response.status);
    console.log("Update response ok:", response.ok);

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      console.log("Update response exitosa:", result);
      return true;
    } else {
      const errorData = await response.text();
      console.error("Error updating recipe:", errorData);
      return false;
    }
  } catch (error) {
    console.error("Error updating recipe:", error);
    return false;
  }
};

export const deleteRecipe = async (recipeId: string): Promise<boolean> => {
  try {
    console.log("=== ELIMINANDO RECETA ===");
    console.log("Recipe ID:", recipeId);

    const url = `${BASE_URL}/recipes/${recipeId}`;
    console.log("URL:", url);
    console.log("Método: DELETE");

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", response.status);
    console.log("Delete response ok:", response.ok);

    if (response.ok) {
      console.log("✅ DELETE exitoso");
      return true;
    } else {
      console.error(
        "❌ Error en DELETE:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error eliminando receta:", error);
    return false;
  }
};
