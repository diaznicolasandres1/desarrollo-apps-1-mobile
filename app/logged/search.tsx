import ScreenLayout from "@/components/ScreenLayout";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recipeService, RecipeDetail } from "@/resources/RecipeService";
import { BASE_URL } from "@/constants/config";

import { PrimaryButton } from "@/components/Button";
import MultiSelectChips from "@/components/MultipleSelectChips";
import { Colors } from "@/constants/Colors";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";

type SearchForm = {
  search: string;
  includeIngredients: string[];
  excludeIngredients: string[];
  category: string;
  user: string;
};

const ingredientOptions = ["Harina", "Nuez Moscada", "Sal", "Azucar", "Huevos"];
const excludeOptions = ["Sal", "Azucar", "Huevos"];
const categories = ["Vegetariano", "Postres","Sopa", "Desayuno", "Pastas", "Carnes y Aves", "Pescados y mariscos", "Ensaladas","Salsas", "Guarniciones", "Legumbres y guisos"];
const users = ["Tomás Schuster", "Juan Perez", "Maria Gonzalez"];
const CACHE_EXPIRATION_MS = 1 * 60 * 1000; // 1 minuto

const getUserNameById = async (userId: string, userCache: Record<string, string>): Promise<string> => {
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
  const { control, handleSubmit, setValue, watch } = useForm<SearchForm>({
    defaultValues: {
      search: "",
      includeIngredients: [],
      excludeIngredients: [],
      category: "",
      user: "",
    },
  });

  const { search, includeIngredients, excludeIngredients, category, user } =
    watch();
  const params = useLocalSearchParams();
  const [results, setResults] = React.useState<RecipeDetail[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userCache] = React.useState<Record<string, string>>({});
  const [resultsWithUser, setResultsWithUser] = React.useState<any[]>([]);
  const [sortType, setSortType] = React.useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

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
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  };

  // Búsqueda automática por categoría
  useEffect(() => {
    const autoSearch = async () => {
      if (params.category && typeof params.category === 'string') {
        setValue('category', params.category);
        setLoading(true);
        setError(null);
        // Buscar en caché
        const cached = await getCachedCategory(params.category);
        if (cached) {
          setResults(cached);
          setLoading(false);
          return;
        }
        // Si no hay caché, buscar en backend
        try {
          const data = await recipeService.getRecipesByCategory(params.category);
          setResults(data);
          setCachedCategory(params.category, data);
        } catch (err: any) {
          setError(err.message || 'Error buscando recetas por categoría');
        } finally {
          setLoading(false);
        }
      }
    };
    autoSearch();
  }, [params.category, setValue]);

  // Utilidad para asociar usernames a recetas
  const attachUsernames = async (recipes: RecipeDetail[]) => {
    const uniqueUserIds = Array.from(new Set(recipes.map(r => r.userId)));
    await Promise.all(uniqueUserIds.map(id => getUserNameById(id, userCache)));
    const withUser = recipes.map(r => ({ ...r, creatorName: userCache[r.userId] || "Usuario desconocido" }));
    setResultsWithUser(withUser);
  };

  // Modificar los lugares donde se setean resultados para asociar usernames
  useEffect(() => {
    if (results.length > 0) {
      attachUsernames(results);
    } else {
      setResultsWithUser([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Función para ordenar resultados
  const getSortedResults = () => {
    if (!resultsWithUser) return [];
    let sorted = [...resultsWithUser];
    switch (sortType) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'az':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  };

  // Búsqueda manual (formulario)
  const onSubmit = async (data: SearchForm) => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      // Si solo hay categoría, usar caché y endpoint optimizado
      if (data.category && !data.search && data.includeIngredients.length === 0 && data.excludeIngredients.length === 0 && !data.user) {
        const cached = await getCachedCategory(data.category);
        if (cached) {
          setResults(cached);
          setLoading(false);
          return;
        }
        const result = await recipeService.getRecipesByCategory(data.category);
        setResults(result);
        setCachedCategory(data.category, result);
        setLoading(false);
        return;
      }
      // Aquí iría la lógica para búsquedas más complejas (por ingredientes, usuario, etc.)
      // Por ahora, solo simular
      setError('Búsqueda avanzada no implementada aún.');
    } catch (err: any) {
      setError(err.message || 'Error buscando recetas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout alternativeHeader={{ title: "Buscá tus recetas" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Controller
          name="search"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Buscar"
              placeholder="Salsa blanca"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              right={
                value ? (
                  <TextInput.Icon icon="close" onPress={() => onChange("")} />
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
          options={users}
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
          >
            Buscar
          </PrimaryButton>
        </View>

        {/* Mostrar resultados */}
        <ScrollView>
          {loading && <View style={{ padding: 20 }}><ActivityIndicator /></View>}
          {error && <View style={{ padding: 20 }}><Text style={{ color: 'red' }}>{error}</Text></View>}
          {!loading && !error && resultsWithUser.length > 0 && (
            <View style={{ padding: 20 }}>
              {/* Botones de ordenamiento */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setSortType('newest')} style={{ backgroundColor: sortType === 'newest' ? Colors.olive.olive100 : Colors.gray.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: sortType === 'newest' ? Colors.olive.olive900 : Colors.gray.gray700, fontWeight: 'bold' }}>Más nuevas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortType('oldest')} style={{ backgroundColor: sortType === 'oldest' ? Colors.azul.azul100 : Colors.gray.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: sortType === 'oldest' ? Colors.azul.azul900 : Colors.gray.gray700, fontWeight: 'bold' }}>Más antiguas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortType('az')} style={{ backgroundColor: sortType === 'az' ? Colors.olive.olive100 : Colors.gray.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: sortType === 'az' ? Colors.olive.olive900 : Colors.gray.gray700, fontWeight: 'bold' }}>A - Z</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortType('za')} style={{ backgroundColor: sortType === 'za' ? Colors.azul.azul100 : Colors.gray.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: sortType === 'za' ? Colors.azul.azul900 : Colors.gray.gray700, fontWeight: 'bold' }}>Z - A</Text>
                </TouchableOpacity>
              </View>
              {/* Lista de recetas ordenadas */}
              {getSortedResults().map((recipe) => (
                <View key={recipe._id} style={{ marginBottom: 16 }}>
                  <UniversalRecipeCard
                    id={recipe._id}
                    name={recipe.name}
                    description={recipe.description}
                    principalPictures={recipe.principalPictures}
                    duration={recipe.duration}
                    difficulty={recipe.difficulty}
                    status={recipe.status}
                    variant="normal"
                  />
                  <Text style={{ color: Colors.text, fontSize: 12, marginLeft: 8 }}>
                    {recipe.creatorName}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
});

export default Search;
