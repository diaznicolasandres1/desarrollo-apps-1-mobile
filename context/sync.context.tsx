import { useStorage } from "@/hooks/useLocalStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { createRecipe, CreateRecipeRequest } from "@/resources/receipt";
import { recipeService } from "@/resources/RecipeService";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "./auth.context";

interface SyncContextProps {
  addReceiptToStorage: (receipt: CreateRecipeRequest) => Promise<void>;
  getReceiptsInStorage: (
    key: string,
    defaultValue?: CreateRecipeRequest[] | undefined
  ) => Promise<CreateRecipeRequest[] | null>;
  removeReceiptFromStorage: (recipeName: string) => Promise<void>;
  updateReceiptInStorage: (recipeName: string, updatedRecipe: CreateRecipeRequest) => Promise<void>;
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
  const intervalRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const addReceiptToStorage = async (receipt: CreateRecipeRequest) => {
    const receipts = await getReceiptsInStorage("createReceiptSync", []);
    const updatedReceipts = receipts ? [...receipts, receipt] : [receipt];
    await setReceiptsInStorage("createReceiptSync", updatedReceipts);
  };

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
              let isProcessed = false;
              
              if (receipt.isUpdate && receipt.originalRecipeId) {
                // Es una actualización de receta existente
                console.log(`Sincronizando actualización de receta: ${receipt.name}`);
                isProcessed = await recipeService.updateRecipe(
                  receipt.originalRecipeId, 
                  receipt
                );
                
                if (isProcessed) {
                  Toast.show({
                    type: "success",
                    text1: "Receta actualizada",
                    text2: `"${receipt.name}" ha sido actualizada exitosamente.`,
                  });
                }
              } else {
                // Es una nueva receta
                console.log(`Sincronizando nueva receta: ${receipt.name}`);
                isProcessed = await createRecipe(receipt);
                
                if (isProcessed) {
                  Toast.show({
                    type: "success",
                    text1: "Receta creada",
                    text2: `"${receipt.name}" ha sido creada exitosamente.`,
                  });
                }
              }

              // Si se procesó exitosamente, remover de la lista pendiente
              if (isProcessed) {
                updatedReceipts = updatedReceipts.filter(
                  (r) => r.name !== receipt.name
                );
              }
            } catch (error) {
              console.error("Error processing recipe:", error);
            }
          }
          await setReceiptsInStorage("createReceiptSync", updatedReceipts);
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
        removeReceiptFromStorage: async (recipeName: string) => {
          const receipts = await getReceiptsInStorage("createReceiptSync", []);
          if (receipts) {
            const updatedReceipts = receipts.filter((r) => r.name !== recipeName);
            await setReceiptsInStorage("createReceiptSync", updatedReceipts);
          }
        },
        updateReceiptInStorage: async (recipeName: string, updatedRecipe: CreateRecipeRequest) => {
          const receipts = await getReceiptsInStorage("createReceiptSync", []);
          if (receipts) {
            const updatedReceipts = receipts.map((r) =>
              r.name === recipeName ? updatedRecipe : r
            );
            await setReceiptsInStorage("createReceiptSync", updatedReceipts);
          }
        },
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
