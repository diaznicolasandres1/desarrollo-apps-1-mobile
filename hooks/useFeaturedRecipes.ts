import { getFeaturedRecipes, RecipeDetail } from "@/resources/receipt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus";

const FEATURED_RECIPES_KEY = "featured_recipes_cache";
const CACHE_DURATION = 1 * 60 * 1000;

export const useFeaturedRecipes = () => {
  const { isConnected } = useNetworkStatus();
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para verificar si el caché es válido
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  // Función para cargar datos del caché
  const loadFromCache = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (isCacheValid(timestamp)) {
          setRecipes(data);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return false;
    }
  }, [isCacheValid]);

  // Función para guardar en caché
  const saveToCache = useCallback(async (data: RecipeDetail[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        FEATURED_RECIPES_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }, []);

  const loadFeaturedRecipes = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Si no forzamos refresh, intentar cargar del caché válido
        if (!forceRefresh) {
          const cacheLoaded = await loadFromCache();
          if (cacheLoaded) {
            setLoading(false);

            // Si hay conexión, actualizar en background
            if (isConnected) {
              try {
                const backendRecipes = await getFeaturedRecipes(3, "desc");
                setRecipes(backendRecipes);
                await saveToCache(backendRecipes);
              } catch (backgroundError) {
                console.warn("Background update failed:", backgroundError);
              }
            }
            return;
          }
        }

        // Si no hay conexión, usar caché aunque esté expirado
        if (!isConnected) {
          const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);
          if (cachedData) {
            const { data } = JSON.parse(cachedData);
            setRecipes(data);
          } else {
            setError("Por favor, verifica tu conexión a internet");
          }
          return;
        }

        // Cargar desde el backend
        const backendRecipes = await getFeaturedRecipes(3, "desc");
        setRecipes(backendRecipes);
        await saveToCache(backendRecipes);
      } catch (err) {
        console.error("Error loading featured recipes:", err);
        setError("No se pudieron cargar las recetas destacadas");

        // Fallback al caché como último recurso
        try {
          const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);
          if (cachedData) {
            const { data } = JSON.parse(cachedData);
            setRecipes(data);
            setError(null); // Limpiar error si tenemos datos de caché
          }
        } catch (cacheError) {
          console.error("Error loading cached data:", cacheError);
        }
      } finally {
        setLoading(false);
      }
    },
    [isConnected, loadFromCache, saveToCache]
  );

  useEffect(() => {
    loadFeaturedRecipes();
  }, [loadFeaturedRecipes]);

  const refreshRecipes = useCallback(() => {
    loadFeaturedRecipes(true);
  }, [loadFeaturedRecipes]);

  return {
    recipes,
    loading,
    error,
    refreshRecipes,
  };
};
