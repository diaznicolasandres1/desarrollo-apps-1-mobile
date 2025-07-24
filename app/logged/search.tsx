import ScreenLayout from "@/components/ScreenLayout";
import {
  BASE_URL,
  categories,
  excludeOptions,
  ingredientOptions,
} from "@/constants/config";
import { RecipeDetail, searchRecipes } from "@/resources/receipt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";

import { PrimaryButton } from "@/components/Button";
import MultiSelectChips from "@/components/MultipleSelectChips";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "@react-navigation/native";

type SearchForm = {
  search: string;
  includeIngredients: string[];
  excludeIngredients: string[];
  category: string;
  user: string;
};

const CACHE_EXPIRATION_MS = 1 * 60 * 1000; // 1 minuto

const getUserNameById = async (
  userId: string,
  userCache: Record<string, string>
): Promise<string> => {
  if (userCache[userId]) return userCache[userId];
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    if (response.ok) {
      const user = await response.json();
      userCache[userId] = user.username;
      return user.username;
    }
  } catch (e) {
    // fallback
  }
  return "Usuario desconocido";
};

const Search = () => {
  const [users, setUsers] = React.useState<Array<{name: string, id: string}>>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      if (response.ok) {
        const backendUsers = await response.json();
        const formattedUsers = backendUsers.map((user: any) => ({
          name: user.username,
          id: user._id
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const { control, handleSubmit, setValue, watch } = useForm<SearchForm>({
    defaultValues: {
      search: "",
      includeIngredients: [],
      excludeIngredients: [],
      category: "",
      user: "",
    },
  });

  const params = useLocalSearchParams();
  const categoryParam = (params.category || "") as string;
  const [showResults, setShowResults] = React.useState(!!categoryParam);
  const { includeIngredients, excludeIngredients, category, user } = watch();
  const [results, setResults] = React.useState<RecipeDetail[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userCache] = React.useState<Record<string, string>>({});
  const [resultsWithUser, setResultsWithUser] = React.useState<any[]>([]);
  const [sortType, setSortType] = React.useState<
    "newest" | "oldest" | "az" | "za"
  >("newest");

  // Utilidad para obtener y setear caché
  const getCachedCategory = async (category: string) => {
    const cacheKey = `category-cache-${category}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
        return data;
      }
    }
    return null;
  };

  const setCachedCategory = async (category: string, data: RecipeDetail[]) => {
    const cacheKey = `category-cache-${category}`;
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  };

  // Búsqueda automática por categoría
  useEffect(() => {
    const autoSearch = async () => {
      if (categoryParam) {
        setValue("category", categoryParam);
        setLoading(true);
        setError(null);
        // Buscar en caché
        const cached = await getCachedCategory(categoryParam);
        if (cached) {
          setResults(cached);
          setShowResults(true);
          setLoading(false);
          return;
        }
        // Si no hay caché, buscar en backend usando searchRecipes
        try {
          const data = await searchRecipes({
            category: categoryParam,
            onlyApproved: true,
          });
          setResults(data);
          setShowResults(true);
          setCachedCategory(categoryParam, data);
        } catch (err: any) {
          setError(err.message || "Error buscando recetas por categoría");
        } finally {
          setLoading(false);
        }
      }
    };
    autoSearch();
  }, [params.category, setValue]);

  // Utilidad para asociar usernames a recetas
  const attachUsernames = React.useCallback(
    async (recipes: RecipeDetail[]) => {
      const uniqueUserIds = Array.from(new Set(recipes.map((r) => r.userId)));
      await Promise.all(
        uniqueUserIds.map((id) => getUserNameById(id, userCache))
      );
      const withUser = recipes.map((r) => ({
        ...r,
        creatorName: userCache[r.userId] || "Usuario desconocido",
      }));
      setResultsWithUser(withUser);
    },
    [userCache]
  );

  // Modificar los lugares donde se setean resultados para asociar usernames
  useEffect(() => {
    if (results.length > 0) {
      attachUsernames(results);
    } else {
      setResultsWithUser([]);
    }
  }, [results, attachUsernames]);

  // Función para ordenar resultados
  const getSortedResults = () => {
    if (!resultsWithUser) return [];
    let sorted = [...resultsWithUser];
    switch (sortType) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  };

  const onSubmit = async (data: SearchForm) => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      // Usar la función de búsqueda avanzada
      const result = await searchRecipes({
        name: data.search,
        includeIngredients: data.includeIngredients,
        excludeIngredients: data.excludeIngredients,
        category: data.category,
        userId: users.find((u) => u.name === data.user)?.id || "",
        onlyApproved: true,
      });

      setResults(result);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || "Error buscando recetas");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Solo limpiar si no venimos de una categoría específica
      if (!params.category) {
        setResults([]);
        setShowResults(false);
        setSortType("newest");
        setValue("search", "");
        setValue("includeIngredients", []);
        setValue("excludeIngredients", []);
        setValue("category", "");
        setValue("user", "");
      }
    }, [setValue, setResults, setShowResults, setSortType, params.category])
  );

  return (
    <ScreenLayout alternativeHeader={{ title: "Buscá tus recetas" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {!showResults && (
          <>
            <Controller
              name="search"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Buscar"
                  placeholder="Salsa blanca, pasta, etc."
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  right={
                    value ? (
                      <TextInput.Icon
                        icon="close"
                        onPress={() => onChange("")}
                      />
                    ) : null
                  }
                />
              )}
            />

            <MultiSelectChips
              label="Incluir ingredientes"
              options={ingredientOptions}
              selected={includeIngredients}
              onChange={(value) => setValue("includeIngredients", value)}
            />

            <MultiSelectChips
              label="Excluir ingredientes"
              options={excludeOptions}
              selected={excludeIngredients}
              onChange={(value) => setValue("excludeIngredients", value)}
            />

            <MultiSelectChips
              label="Categoría"
              options={categories}
              selected={category ? [category] : []}
              onChange={(value) => setValue("category", value[0])}
              onlyOne={true}
            />

            <MultiSelectChips
              label="Usuario"
              options={users.map((user) => user.name)}
              selected={user ? [user] : []}
              onChange={(value) => setValue("user", value[0])}
              onlyOne={true}
              chipStyle={{
                base: { backgroundColor: Colors.azul.azul100 },
                text: { color: Colors.azul.azul900 },
              }}
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={{ minWidth: 200, minHeight: 40 }}
                loading={loading}
              >
                Buscar
              </PrimaryButton>
            </View>
          </>
        )}

        {/* Mostrar resultados */}
        {showResults && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {resultsWithUser.length}{" "}
                {resultsWithUser.length === 1
                  ? "receta encontrada"
                  : "recetas encontradas"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowResults(false);
                  setResults([]);
                  setResultsWithUser([]);
                }}
                style={styles.newSearchButton}
              >
                <Text style={styles.newSearchText}>Nueva búsqueda</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors.orange.orange900}
                />
                <Text style={styles.loadingText}>Buscando recetas...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  onPress={() => handleSubmit(onSubmit)()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && resultsWithUser.length > 0 && (
              <>
                {/* Botones de ordenamiento */}
                <View style={styles.sortButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => setSortType("newest")}
                    style={[
                      styles.sortButton,
                      sortType === "newest" && styles.sortButtonActiveOlive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortType === "newest" &&
                          styles.sortButtonTextActiveOlive,
                      ]}
                    >
                      Más nuevas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSortType("oldest")}
                    style={[
                      styles.sortButton,
                      sortType === "oldest" && styles.sortButtonActiveAzul,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortType === "oldest" &&
                          styles.sortButtonTextActiveAzul,
                      ]}
                    >
                      Más antiguas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSortType("az")}
                    style={[
                      styles.sortButton,
                      sortType === "az" && styles.sortButtonActiveOlive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortType === "az" && styles.sortButtonTextActiveOlive,
                      ]}
                    >
                      A - Z
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSortType("za")}
                    style={[
                      styles.sortButton,
                      sortType === "za" && styles.sortButtonActiveAzul,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortType === "za" && styles.sortButtonTextActiveAzul,
                      ]}
                    >
                      Z - A
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Lista de recetas */}
                {getSortedResults().map((recipe) => (
                  <View key={recipe._id}>
                    <UniversalRecipeCard
                      id={recipe._id}
                      name={recipe.name}
                      description={recipe.description}
                      principalPictures={recipe.principalPictures}
                      duration={recipe.duration}
                      difficulty={recipe.difficulty}
                      status={recipe.status}
                      creatorName={recipe.creatorName}
                    />
                  </View>
                ))}
              </>
            )}

            {/* Estado vacío */}
            {!loading &&
              !error &&
              showResults &&
              resultsWithUser.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No se encontraron recetas
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Intenta con otros términos de búsqueda o ajusta los filtros
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowResults(false);
                      setResults([]);
                      setResultsWithUser([]);
                    }}
                    style={styles.newSearchButtonEmpty}
                  >
                    <Text style={styles.newSearchButtonEmptyText}>
                      Nueva búsqueda
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#E7F3E7",
  },
  dropdown: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.gray200,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.orange.orange900,
  },
  newSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.orange.orange100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.orange.orange900,
  },
  newSearchText: {
    fontSize: 12,
    color: Colors.orange.orange900,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.orange.orange900,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.red?.red600 || "red",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.orange.orange900,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  sortButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: Colors.gray.gray100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortButtonActiveOlive: {
    backgroundColor: Colors.olive.olive100,
  },
  sortButtonActiveAzul: {
    backgroundColor: Colors.azul.azul100,
  },
  sortButtonText: {
    color: Colors.gray.gray700,
    fontWeight: "bold",
  },
  sortButtonTextActiveOlive: {
    color: Colors.olive.olive900,
  },
  sortButtonTextActiveAzul: {
    color: Colors.azul.azul900,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.orange.orange900,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray.gray500,
    textAlign: "center",
    marginBottom: 24,
  },
  newSearchButtonEmpty: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.orange.orange900,
    borderRadius: 8,
  },
  newSearchButtonEmptyText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Search;
