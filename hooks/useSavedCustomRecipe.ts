import { useStorage } from "./useLocalStorage";

export const useSavedCustomRecipe = () => {
  const { getItem, setItem } = useStorage();

  const getCustomRecipes = async () => {
    const recipes = await getItem("customRecipes");
    return recipes || [];
  };
  const saveCustomRecipe = async (recipe: any) => {
    const recipes = await getCustomRecipes();
    recipes.push(recipe);
    await setItem("customRecipes", recipes);
  };

  const deleteCustomRecipe = async (recipeId: string) => {
    let recipes = await getCustomRecipes();
    recipes = recipes.filter((recipe: any) => recipe.id !== recipeId);
    await setItem("customRecipes", recipes);
  };

  return {
    getCustomRecipes,
    saveCustomRecipe,
    deleteCustomRecipe,
  };
};
