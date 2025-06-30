import ScreenLayout from "@/components/ScreenLayout";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useSync } from "@/context/sync.context";
import { CreateRecipeRequest } from "@/resources/receipt";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RecipeDetail, recipeService } from "../../../resources/RecipeService";

export default function MyRecipes() {
  const router = useRouter();
  const { user } = useAuth();
  const { getReceiptsInStorage } = useSync();
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [storedRecipes, setStoredRecipes] = useState<CreateRecipeRequest[]>([]);

  const loadRecipesFromStorage = useCallback(async () => {
    try {
      const storedRecipes = await getReceiptsInStorage("createReceiptSync", []);
      if (storedRecipes && storedRecipes.length > 0) {
        setStoredRecipes(storedRecipes);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getReceiptsInStorage]);

  const fetchUserRecipes = useCallback(async () => {
    try {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      const list = await recipeService.getUserRecipes(user._id);
      setRecipes(list);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const syncReceipts = useCallback(async () => {
    try {
      loadRecipesFromStorage();
      fetchUserRecipes();
    } catch (error) {
      console.error("Error syncing receipts:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      syncReceipts();
    }, [syncReceipts])
  );

  if (loading) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
      <ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus creaciones:</Text>
        </View>
        <View style={styles.recipesContainer}>
          {recipes.length > 0 ? (
            <>
              {recipes.map((recipe) => (
                <UniversalRecipeCard
                  key={recipe._id}
                  id={recipe._id}
                  name={recipe.name}
                  description={recipe.description}
                  principalPictures={recipe.principalPictures}
                  status={recipe.status}
                  variant="my-recipe"
                />
              ))}
              {storedRecipes.map((recipe, index) => (
                <UniversalRecipeCard
                  key={`stored-${index}`}
                  name={recipe.name}
                  description={recipe.description}
                  principalPictures={recipe.principalPictures}
                  status={recipe.status}
                  variant="my-recipe"
                  onPress={() => {}}
                />
              ))}
            </>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.errorText}>
                No encontramos recetas creadas por vos.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.red.red600,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.orange.orange100,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },

  recipesContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 16,
  },
});
