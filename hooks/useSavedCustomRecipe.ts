import { CustomRecipeState } from "@/app/logged/receipt/[id]";
import { useAuth } from "@/context/auth.context";
import { useStorage } from "@/hooks/useLocalStorage";

export type SavedCustomRecipe = {
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string; // Imagen completa (base64 o URL)
  };
  state: CustomRecipeState;
};

// Constantes para el chunking
const MAX_CHUNK_SIZE = 100000; // 100KB por chunk

interface ChunkMetadata {
  totalChunks: number;
  totalSize: number;
  createdAt: string;
}

export const useSavedCustomRecipe = () => {
  const { user } = useAuth();
  const { getItem, setItem, removeItem } = useStorage<SavedCustomRecipe[]>();
  const { getItem: getChunkItem, setItem: setChunkItem } = useStorage<string>();
  const { getItem: getMetadataItem, setItem: setMetadataItem } =
    useStorage<ChunkMetadata>();

  const key = `${user?._id}-custom-recipes`;

  // Función para dividir datos en chunks
  const chunkData = (data: string): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += MAX_CHUNK_SIZE) {
      chunks.push(data.slice(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
  };

  // Función para reconstruir datos desde chunks
  const reconstructData = async (baseKey: string): Promise<string | null> => {
    try {
      const metadata = await getMetadataItem(`${baseKey}-metadata`);
      if (!metadata) return null;

      const chunks: string[] = [];
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunk = await getChunkItem(`${baseKey}-chunk-${i}`);
        if (chunk) {
          chunks.push(chunk);
        }
      }

      return chunks.join("");
    } catch (error) {
      console.error("Error reconstructing data from chunks:", error);
      return null;
    }
  };

  // Función para guardar datos en chunks
  const saveDataInChunks = async (
    data: string,
    baseKey: string
  ): Promise<void> => {
    try {
      const chunks = chunkData(data);
      const metadata: ChunkMetadata = {
        totalChunks: chunks.length,
        totalSize: data.length,
        createdAt: new Date().toISOString(),
      };

      // Guardar metadata
      await setMetadataItem(`${baseKey}-metadata`, metadata);

      // Guardar chunks
      for (let i = 0; i < chunks.length; i++) {
        await setChunkItem(`${baseKey}-chunk-${i}`, chunks[i]);
      }

      console.log(
        `✅ Datos guardados en ${chunks.length} chunks (${data.length} bytes total)`
      );
    } catch (error) {
      console.error("Error saving data in chunks:", error);
      throw error;
    }
  };

  // Función para cargar datos desde chunks
  const loadDataFromChunks = async (
    baseKey: string
  ): Promise<string | null> => {
    try {
      const metadata = await getMetadataItem(`${baseKey}-metadata`);
      if (!metadata) return null;

      const data = await reconstructData(baseKey);
      if (data) {
        console.log(
          `✅ Datos cargados desde ${metadata.totalChunks} chunks (${metadata.totalSize} bytes)`
        );
      }
      return data;
    } catch (error) {
      console.error("Error loading data from chunks:", error);
      return null;
    }
  };

  const getCustomRecipes = async () => {
    try {
      console.log("Cargando recetas personalizadas para usuario:", user?._id);

      // Intentar cargar desde chunks primero
      const chunkedData = await loadDataFromChunks(key);
      if (chunkedData) {
        const recipes = JSON.parse(chunkedData);
        console.log("Recetas cargadas desde chunks:", recipes?.length || 0);
        return recipes || [];
      }

      // Fallback: intentar cargar desde storage normal
      const recipes = await getItem(key);
      console.log("Recetas cargadas del storage normal:", recipes?.length || 0);
      return recipes || [];
    } catch (error) {
      console.error("Error loading custom recipes:", error);
      return [];
    }
  };

  const saveCustomRecipe = async (recipe: SavedCustomRecipe) => {
    try {
      console.log("Guardando receta personalizada:", recipe.recipe.id);
      const recipes = await getCustomRecipes();

      // Verificar si ya existe una receta con el mismo ID y reemplazarla
      const existingIndex = recipes.findIndex(
        (r: SavedCustomRecipe) => r.recipe.id === recipe.recipe.id
      );

      if (existingIndex >= 0) {
        console.log("Reemplazando receta existente en índice:", existingIndex);
        recipes[existingIndex] = recipe;
      } else {
        console.log("Agregando nueva receta personalizada");
        recipes.push(recipe);
      }

      // Verificar el tamaño de los datos antes de guardar
      const dataString = JSON.stringify(recipes);
      const dataSize = dataString.length;

      if (dataSize > MAX_CHUNK_SIZE) {
        console.log(
          `Datos grandes (${dataSize} bytes), guardando en chunks...`
        );
        await saveDataInChunks(dataString, key);
        console.log("Receta personalizada guardada en chunks exitosamente");
      } else {
        await setItem(key, recipes);
        console.log("Receta personalizada guardada exitosamente");
      }
    } catch (error) {
      console.error("Error saving custom recipe:", error);
      throw error;
    }
  };

  const getCustomRecipe = async (recipeId: string) => {
    try {
      console.log("Buscando receta personalizada con ID:", recipeId);
      const recipes = await getCustomRecipes();
      const recipe = recipes.find(
        (r: SavedCustomRecipe) => r.recipe.id === recipeId
      );
      console.log("Receta encontrada:", recipe ? "SÍ" : "NO");
      return recipe || null;
    } catch (error) {
      console.error("Error getting custom recipe:", error);
      return null;
    }
  };

  // Función para limpiar chunks de una clave específica
  const clearChunks = async (baseKey: string): Promise<void> => {
    try {
      const metadata = await getMetadataItem(`${baseKey}-metadata`);
      if (metadata) {
        // Eliminar todos los chunks
        for (let i = 0; i < metadata.totalChunks; i++) {
          await removeItem(`${baseKey}-chunk-${i}`);
        }
        // Eliminar metadata
        await removeItem(`${baseKey}-metadata`);
        console.log(`🗑️ Chunks limpiados para: ${baseKey}`);
      }
    } catch (error) {
      console.error("Error clearing chunks:", error);
    }
  };

  const deleteCustomRecipe = async (recipeId: string) => {
    try {
      console.log("🗑️ Eliminando receta personalizada con ID:", recipeId);

      const recipes = await getCustomRecipes();
      console.log("📋 Total de recetas antes de eliminar:", recipes.length);

      const filteredRecipes = recipes.filter(
        (r: SavedCustomRecipe) => r.recipe.id !== recipeId
      );

      console.log(
        "📋 Total de recetas después de filtrar:",
        filteredRecipes.length
      );

      // Si no se eliminó ninguna receta, verificar si existe
      if (filteredRecipes.length === recipes.length) {
        const recipeExists = recipes.find(
          (r: SavedCustomRecipe) => r.recipe.id === recipeId
        );
        if (!recipeExists) {
          console.warn("⚠️ No se encontró la receta con ID:", recipeId);
          throw new Error(
            `No se encontró la receta personalizada con ID: ${recipeId}`
          );
        }
      }

      // Si no quedan recetas, limpiar chunks y storage
      if (filteredRecipes.length === 0) {
        console.log("📭 No quedan recetas, limpiando storage...");
        await clearChunks(key);
        await removeItem(key);
        console.log("✅ Storage limpiado completamente");
      } else {
        const dataString = JSON.stringify(filteredRecipes);
        const dataSize = dataString.length;

        if (dataSize > MAX_CHUNK_SIZE) {
          console.log("💾 Guardando datos en chunks después de eliminar...");
          await saveDataInChunks(dataString, key);
        } else {
          console.log("💾 Guardando datos normalmente después de eliminar...");
          // Limpiar chunks si existían antes
          await clearChunks(key);
          await setItem(key, filteredRecipes);
        }
      }

      console.log("✅ Receta personalizada eliminada exitosamente");
    } catch (error) {
      console.error("❌ Error deleting custom recipe:", error);
      throw error;
    }
  };

  const canSaveCustomRecipe = async (recipeId: string) => {
    try {
      const recipes = await getCustomRecipes();
      const existingRecipe = recipes.find(
        (r: SavedCustomRecipe) => r.recipe.id === recipeId
      );
      return !existingRecipe || existingRecipe.state.isCustomized;
    } catch (error) {
      console.error("Error checking if can save custom recipe:", error);
      return false;
    }
  };

  const debugStorage = async () => {
    try {
      console.log("🔍 Debuggeando storage de recetas personalizadas...");
      const recipes = await getCustomRecipes();
      console.log("📋 Total de recetas en storage:", recipes.length);

      recipes.forEach((recipe: SavedCustomRecipe, index: number) => {
        console.log(`📝 Receta ${index + 1}:`, {
          id: recipe.recipe.id,
          title: recipe.recipe.title,
          isCustomized: recipe.state.isCustomized,
          portionType: recipe.state.portionType,
        });
      });
    } catch (error) {
      console.error("❌ Error debuggeando storage:", error);
    }
  };

  return {
    getCustomRecipes,
    saveCustomRecipe,
    getCustomRecipe,
    deleteCustomRecipe,
    canSaveCustomRecipe,
    debugStorage,
  };
};
