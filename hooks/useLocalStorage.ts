// useStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

export function useStorage<T = any>() {
  const getItem = useCallback(
    async (key: string, defaultValue?: T): Promise<T | null> => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue != null) {
          return JSON.parse(jsonValue);
        }
        return defaultValue !== undefined ? defaultValue : null;
      } catch (e) {
        console.error("Error getting item from storage", e);
        return defaultValue !== undefined ? defaultValue : null;
      }
    },
    []
  );

  const setItem = useCallback(async (key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error("Error setting item in storage", e);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing item from storage", e);
    }
  }, []);

  const clearStorage = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clearStorage,
  };
}
