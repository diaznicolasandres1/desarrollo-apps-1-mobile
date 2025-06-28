import { useStorage } from "@/hooks/useLocalStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { createRecipe, CreateRecipeRequest } from "@/resources/receipt";
import { RecipeDetail, recipeService } from "@/resources/RecipeService";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "./auth.context";

interface SyncContextProps {
  addReceiptToStorage: (receipt: CreateRecipeRequest) => Promise<void>;
  getReceiptsInStorage: (
    key: string,
    defaultValue?: CreateRecipeRequest[] | undefined
  ) => Promise<CreateRecipeRequest[] | null>;
  userRecipes: RecipeDetail[];
  pendingRecipes: CreateRecipeRequest[];
  fetchUserRecipes: (forceFromAPI?: boolean) => Promise<void>;
  isLoadingUserRecipes: boolean;
}

export const SyncContext = createContext<SyncContextProps | undefined>(
  undefined
);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const { isConnected } = useNetworkStatus();
  const { user, isAuthenticated } = useAuth();
  const { getItem: getReceiptsInStorage, setItem: setReceiptsInStorage } =
    useStorage<CreateRecipeRequest[]>();
  const { getItem: getUserRecipesFromStorage, setItem: setUserRecipesToStorage } =
    useStorage<RecipeDetail[]>();
  const intervalRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);
  
  const [userRecipes, setUserRecipes] = useState<RecipeDetail[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<CreateRecipeRequest[]>([]);
  const [isLoadingUserRecipes, setIsLoadingUserRecipes] = useState(false);

  const addReceiptToStorage = async (receipt: CreateRecipeRequest) => {
    const receipts = await getReceiptsInStorage("createReceiptSync", []);
    const updatedReceipts = receipts ? [...receipts, receipt] : [receipt];
    await setReceiptsInStorage("createReceiptSync", updatedReceipts);
    
    setPendingRecipes(updatedReceipts);
  };

  const fetchUserRecipes = useCallback(async (forceFromAPI = false) => {
    if (!user?._id || !isAuthenticated) {
      setUserRecipes([]);
      return;
    }

    setIsLoadingUserRecipes(true);
    try {
      const storageKey = `userRecipes_${user._id}`;
      
      // Primero intentamos obtener desde AsyncStorage
      if (!forceFromAPI) {
        const cachedRecipes = await getUserRecipesFromStorage(storageKey, []);
        if (cachedRecipes && cachedRecipes.length > 0) {
          setUserRecipes(cachedRecipes);
          setIsLoadingUserRecipes(false);
          return;
        }
      }

      // Si no hay datos en caché o se fuerza desde API, consultamos el servidor
      if (isConnected) {
        console.log("🌐 Obteniendo recetas desde la API...");
        const recipes = await recipeService.getUserRecipes(user._id);
        setUserRecipes(recipes);
        
        // Guardamos en AsyncStorage para futuras consultas
        await setUserRecipesToStorage(storageKey, recipes);
        console.log(`✅ ${recipes.length} recetas del usuario obtenidas desde API`);
      } else {
        setUserRecipes([]);
      }
    } catch (error) {
      console.error("❌ Error al obtener recetas del usuario:", error);
      // Si falla la API, intentamos usar datos en caché como fallback
      try {
        const storageKey = `userRecipes_${user._id}`;
        const cachedRecipes = await getUserRecipesFromStorage(storageKey, []);
        if (cachedRecipes) {
          setUserRecipes(cachedRecipes);
        } else {
          setUserRecipes([]);
        }
      } catch (cacheError) {
        setUserRecipes([]);
      }
    } finally {
      setIsLoadingUserRecipes(false);
    }
  }, [user?._id, isAuthenticated, isConnected, getUserRecipesFromStorage, setUserRecipesToStorage]);



  useEffect(() => {
    const loadPendingRecipes = async () => {
      try {
        const receipts = await getReceiptsInStorage("createReceiptSync", []);
        setPendingRecipes(receipts || []);
      } catch (error) {
        console.error("Error loading pending recipes:", error);
      }
    };
    
    loadPendingRecipes();
  }, []);

  useEffect(() => {
    const checkCreateReceiptSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        const receipts = await getReceiptsInStorage("createReceiptSync", []);
        console.log("Checking for receipts to sync...", receipts?.length);
        if (
          receipts &&
          receipts.length > 0 &&
          isAuthenticated &&
          user &&
          isConnected
        ) {
          let updatedReceipts = [...receipts];
          for (const receipt of receipts) {
            try {
              const isCreated = await createRecipe(receipt);
              if (isCreated) {
                updatedReceipts = updatedReceipts.filter(
                  (r) => r.name !== receipt.name
                );
                Toast.show({
                  type: "success",
                  text1: "Se ha creado la receta",
                  text2: `"${receipt.name}" ha sido creada exitosamente.`,
                });
              }
            } catch (error) {
              console.error("Error creating recipe:", error);
            }
          }
          await setReceiptsInStorage("createReceiptSync", updatedReceipts);
          setPendingRecipes(updatedReceipts);
          
          if (updatedReceipts.length < receipts.length) {
            fetchUserRecipes();
          }
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    intervalRef.current = setInterval(checkCreateReceiptSync, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, user, isConnected]);

  return (
    <SyncContext.Provider
      value={{
        addReceiptToStorage,
        getReceiptsInStorage,
        userRecipes,
        pendingRecipes,
        fetchUserRecipes,
        isLoadingUserRecipes,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync debe usarse dentro de un SyncProvider");
  }
  return context;
};
