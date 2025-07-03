import { getFeaturedRecipes, RecipeDetail } from "@/resources/receipt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus";

const FEATURED_RECIPES_KEY = "featured_recipes_cache";

export const useFeaturedRecipes = () => {
  const { isConnected } = useNetworkStatus();
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Intentar cargar desde AsyncStorage
      const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);

      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        setRecipes(data);
        setLoading(false);
      }

      if (!isConnected) {
        return;
      }

      const backendRecipes = await getFeaturedRecipes(3, "desc");

      const cacheData = {
        data: backendRecipes,
      };
      await AsyncStorage.setItem(
        FEATURED_RECIPES_KEY,
        JSON.stringify(cacheData)
      );

      setRecipes(backendRecipes);
    } catch (err) {
      console.error("Error loading featured recipes:", err);
      setError("No se pudieron cargar las recetas destacadas");

      // Si hay error del backend, intentar usar caché como fallback
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
