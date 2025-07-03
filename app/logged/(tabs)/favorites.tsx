import ScreenLayout from "@/components/ScreenLayout";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useStorage } from "@/hooks/useLocalStorage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RecipeDetail, getRecipeById } from "../../../resources/receipt";

export default function Favorites() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { getItem, setItem } = useStorage();

  const FAVORITES_STORAGE_KEY = useMemo(
    () => `favorites_${user?._id || "guest"}`,
    [user?._id]
  );

  const saveFavoritesToLocal = useCallback(
    async (favoriteRecipes: RecipeDetail[]) => {
      try {
        await setItem(FAVORITES_STORAGE_KEY, favoriteRecipes);
      } catch (error) {
        console.error("❌ Error al guardar favoritos localmente:", error);
      }
    },
    [setItem, FAVORITES_STORAGE_KEY]
  );

  // Cargar favoritos desde local storage
  const loadFavoritesFromLocal = useCallback(async (): Promise<
    RecipeDetail[]
  > => {
    try {
      const savedFavorites = await getItem(FAVORITES_STORAGE_KEY, []);
      return savedFavorites || [];
    } catch (error) {
      console.error("❌ Error al cargar favoritos desde local storage:", error);
      return [];
    }
  }, [getItem, FAVORITES_STORAGE_KEY]);

  const fetchFavoriteRecipes = useCallback(async () => {
    if (!user) {
      console.log("❌ No hay usuario logueado");
      setLoading(false);
      setError("Usuario no logueado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primero cargar favoritos desde el almacenamiento local
      const localFavorites = await loadFavoritesFromLocal();
      if (localFavorites.length > 0) {
        setRecipes(localFavorites);
        setLoading(false);
      }

      const favIds = user.favedRecipesIds || [];
      if (favIds.length === 0) {
        setRecipes([]);
        await saveFavoritesToLocal([]);
        setLoading(false);
        return;
      }

      const promises = favIds.map(async (id) => {
        try {
          const recipe = await getRecipeById(id);
          return recipe;
        } catch (error) {
          console.error(`❌ Error al obtener receta ${id}:`, error);
          return null;
        }
      });

      const favRecipes = await Promise.all(promises);

      // Filtrar recetas que no se pudieron cargar
      const validRecipes = favRecipes.filter(
        (recipe): recipe is RecipeDetail => recipe !== null
      );

      // Guardar en el almacenamiento local
      await saveFavoritesToLocal(validRecipes);

      // Actualizar el estado
      setRecipes(validRecipes);
    } catch (err) {
      console.error("� Error general:", err);
      // En caso de error, intentar cargar desde almacenamiento local
      const localFavorites = await loadFavoritesFromLocal();
      if (localFavorites.length > 0) {
        setRecipes(localFavorites);
        setError("Mostrando favoritos guardados localmente (sin conexión)");
      } else {
        setError("No se pudo cargar las recetas favoritas.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, loadFavoritesFromLocal, saveFavoritesToLocal]);

  const refreshFavorites = useCallback(() => {
    fetchFavoriteRecipes();
  }, [fetchFavoriteRecipes]);

  useFocusEffect(refreshFavorites);

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <ScreenLayout
      alternativeHeader={{
        title: "Favoritos",
        actions: (
          <>
            <TouchableOpacity onPress={refreshFavorites}>
              <Ionicons
                name="reload-outline"
                size={24}
                color={Colors.orange.orange900}
              />
            </TouchableOpacity>
          </>
        ),
      }}
    >
      {children}
    </ScreenLayout>
  );

  if (!user) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Debes iniciar sesión para ver tus favoritos.
          </Text>
        </View>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchFavoriteRecipes}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  if (recipes.length === 0) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Ionicons
            name="heart-outline"
            size={64}
            color={Colors.orange.orange300}
          />
          <Text style={styles.emptyText}>No tenés recetas favoritas.</Text>
          <Text style={styles.emptySubText}>
            ¡Explorá recetas y agregá tus favoritas!
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Estas son tus recetas favoritas ({recipes.length})
          </Text>
        </View>

        <View style={styles.recipesContainer}>
          {recipes.map((recipe) => (
            <UniversalRecipeCard
              key={recipe._id}
              id={recipe._id}
              name={recipe.name}
              description={recipe.description}
              duration={recipe.duration}
              difficulty={recipe.difficulty}
              principalPictures={recipe.principalPictures}
              variant="normal"
            />
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.red.red600,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.orange.orange600,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.orange.orange100,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },

  recipesContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 16,
  },

  // Debug styles - temporal (se pueden eliminar después)
  debugInfo: {
    backgroundColor: "#f0f0f0",
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 3,
  },
  debugButton: {
    backgroundColor: Colors.orange.orange600,
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
