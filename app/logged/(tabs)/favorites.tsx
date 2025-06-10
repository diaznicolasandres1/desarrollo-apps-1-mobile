import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { recipeService, RecipeDetail } from "../../../services/RecipeService";
export interface User {
  favedRecipesIds: string[];
  _id: string;
  username: string;
  password: string;
  email: string;
  status: string;
  rol: string;
  lastRecoveryCode: string;
}

export default function Favorites() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchFavoriteRecipes = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      if (!userJson) {
        setError("No se encontró un usuario autenticado.");
        setLoading(false);
        return;
      }

      const user: User = JSON.parse(userJson);
      const favIds = user.favedRecipesIds || [];
      if (favIds.length === 0) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      const promises = favIds.map((id) => recipeService.getRecipeById(id));
      const favRecipes: RecipeDetail[] = await Promise.all(promises);
      setRecipes(favRecipes);
    } catch (err) {
      console.error("Error al obtener recetas favoritas:", err);
      setError("No se pudo cargar las recetas favoritas.");
    } finally {
      setLoading(false);
    }
  };

  fetchFavoriteRecipes();
}, []);

  if (loading) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Favoritos" }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Favoritos" }}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (recipes.length === 0) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Favoritos" }}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tienes recetas favoritas.</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout alternativeHeader={{ title: "Favoritos" }}>
      <ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estas son tus recetas favoritas</Text>
        </View>
        <View style={styles.recipesContainer}>
          {recipes.map((recipe) => (
            <View key={recipe._id} style={styles.recipeItem}>
                <Image
                  source={{
                    uri:
                      recipe.principalPictures.length > 0
                        ? recipe.principalPictures[0].url
                        : "https://via.placeholder.com/120x120.png?text=Sin+imagen",
                  }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{recipe.name}</Text>
                <Text
                  style={styles.recipeDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {recipe.description}
                </Text>
                <View style={styles.recipeInfoRow}>
                  <View style={styles.recipeInfoRowItem}>
                    <Ionicons
                      name="time-outline"
                      size={28}
                      color={Colors.orange.orange900}
                    />
                    <Text style={styles.recipeMeta}>
                      {recipe.duration} min –{" "}
                      {recipe.difficulty.charAt(0).toUpperCase() +
                        recipe.difficulty.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.recipeInfoRowItem}>
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/logged/receipt/${recipe._id}`);
                      }}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={Colors.orange.orange900}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
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
  recipeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  recipeImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  recipeInfo: {
    flexShrink: 1,
    flexGrow: 1,
    flexDirection: "column",
    gap: 4,
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: 20,
    color: Colors.orange.orange700,
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,
  },
  recipeInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16
  },
  recipeInfoRowItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeMeta: {
    fontSize: 14,
    color: Colors.text,
  },
});
