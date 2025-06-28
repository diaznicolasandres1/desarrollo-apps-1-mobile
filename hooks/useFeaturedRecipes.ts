import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService, RecipeDetail } from '../resources/RecipeService';

interface FeaturedRecipe {
  id: string;
  title: string;
  img: string;
  description: string;
  time: string;
}

const FEATURED_RECIPES_KEY = 'featured_recipes_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

export const useFeaturedRecipes = () => {
  const [recipes, setRecipes] = useState<FeaturedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformRecipeData = (recipe: RecipeDetail): FeaturedRecipe => {
    return {
      id: recipe._id,
      title: recipe.name,
      img: recipe.principalPictures && recipe.principalPictures.length > 0 
        ? recipe.principalPictures[0].url 
        : "https://via.placeholder.com/120x120.png?text=Sin+imagen",
      description: recipe.description,
      time: `${recipe.duration} min • ${recipe.difficulty}`
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
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(FEATURED_RECIPES_KEY, JSON.stringify(cacheData));

      setRecipes(transformedRecipes);
    } catch (err) {
      console.error('Error loading featured recipes:', err);
      setError('No se pudieron cargar las recetas destacadas');
      
      // Si hay error del backend, intentar usar caché expirado como fallback
      try {
        const cachedData = await AsyncStorage.getItem(FEATURED_RECIPES_KEY);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setRecipes(data);
        }
      } catch (cacheError) {
        console.error('Error loading cached data:', cacheError);
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
    refreshRecipes
  };
}; 