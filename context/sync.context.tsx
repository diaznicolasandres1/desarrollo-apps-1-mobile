import { useStorage } from "@/hooks/useLocalStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { createRecipe, CreateRecipeRequest } from "@/resources/receipt";
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
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    intervalRef.current = window.setInterval(checkCreateReceiptSync, 10000);

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
