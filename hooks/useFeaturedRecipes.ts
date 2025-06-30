import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { RecipeDetail, recipeService } from "../resources/RecipeService";
import { getFirstImageUri } from "../utils/imageUtils";

interface FeaturedRecipe {
  id: string;
  title: string;
  img: string;
  description: string;
  duration: number | string;
  difficulty: string;
}

const FEATURED_RECIPES_KEY = "featured_recipes_cache";
const CACHE_DURATION = 1 * 60 * 1000; // 1 minutos en milisegundos

export const useFeaturedRecipes = () => {
  const [recipes, setRecipes] = useState<FeaturedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformRecipeData = (recipe: RecipeDetail): FeaturedRecipe => {
    const imageUri = getFirstImageUri(recipe.principalPictures);

    return {
      id: recipe._id,
      title: recipe.name,
      img: imageUri.uri,

      description: recipe.description,
      duration: recipe.duration,
      difficulty: recipe.difficulty,
    };
  };

  const loadFeaturedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Intentar cargar desde AsyncStorage
      const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (!isExpired) {
          setRecipes(data);
          setLoading(false);
          return;
        }
      }

      // 2. Si no hay caché o está expirado, cargar desde el backend
      const backendRecipes = await recipeService.getFeaturedRecipes(3, "desc");
      const transformedRecipes = backendRecipes.map(transformRecipeData);

      // 3. Guardar en AsyncStorage
      const cacheData = {
        data: transformedRecipes,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        FEATURED_RECIPES_KEY,
        JSON.stringify(cacheData)
      );

      setRecipes(transformedRecipes);
    } catch (err) {
      console.error("Error loading featured recipes:", err);
      setError("No se pudieron cargar las recetas destacadas");

      // Si hay error del backend, intentar usar caché expirado como fallback
      try {
        const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setRecipes(data);
        }
      } catch (cacheError) {
        console.error("Error loading cached data:", cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  const refreshRecipes = () => {
    loadFeaturedRecipes();
  };

  return {
    recipes,
    loading,
    error,
    refreshRecipes,
  };
};
