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
import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { recipeService, RecipeDetail } from "../../../resources/RecipeService";
import { Chip } from "react-native-paper";
import { useAuth } from "@/context/auth.context";
import { getFirstImageUri } from "@/utils/imageUtils";

export default function MyRecipes() {
  const router = useRouter();
  const {  user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        if (!user?._id) {
          setError("No hay usuario autenticado");
          setLoading(false);
          return;
        }
        const list = await recipeService.getUserRecipes(user._id);
        setRecipes(list);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar las recetas");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRecipes();
  }, [user?._id]);

  if (loading) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
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
          {recipes.map((recipe) => (
            <View key={recipe._id} style={styles.recipeItem}>
              <Image
                source={getFirstImageUri(recipe.principalPictures)}
                style={styles.recipeImage}
                resizeMode="cover"
              />

              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{recipe.name}</Text>
                <Text style={styles.recipeDescription} numberOfLines={2}>
                  {recipe.description}
                </Text>

                <View style={styles.recipeInfoRow}>
                  <Chip
                    style={[
                      styles.chipBase,
                      recipe.status === "pending_to_approve"
                        ? styles.chipPending
                        : styles.chipApproved,
                    ]}
                    textStyle={[
                      styles.chipTextBase,
                      recipe.status === "pending_to_approve"
                        ? styles.chipTextPending
                        : styles.chipTextApproved,
                    ]}
                  >
                    {recipe.status === "pending_to_approve"
                      ? "Pendiente"
                      : recipe.status === "approved"
                        ? "Aprobada"
                        : recipe.status}
                  </Chip>
                  <TouchableOpacity
                    onPress={() => router.push(`/logged/receipt/${recipe._id}`)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.orange.orange900}
                    />
                  </TouchableOpacity>
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
    gap: 16,
  },
  chipBase: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    marginTop: 15,
  },
  chipApproved: {
    backgroundColor: "#FFFFFF",
    borderColor: Colors.orange.orange900,
  },
  chipPending: {
    backgroundColor: Colors.gray.gray100,
    borderColor: Colors.gray.gray400,
  },
  chipTextBase: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextApproved: {
    color: Colors.orange.orange900,
  },
  chipTextPending: {
    color: Colors.gray.gray600,
  },
});
