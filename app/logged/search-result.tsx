import React, { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { recipeService, RecipeDetail } from "@/resources/RecipeService";
import ScreenLayout from "@/components/ScreenLayout";

const SearchResult = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchResults = async () => {
      try {
        let data: RecipeDetail[] = [];
        if (category && typeof category === 'string') {
          data = await recipeService.getRecipesByCategory(category);
        } else {
          setError('Búsqueda avanzada no implementada aún.');
        }
        if (isMounted) setResults(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error buscando recetas');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
    return () => { isMounted = false; };
  }, [category]);

  const getSortedResults = () => {
    if (!results) return [];
    let sorted = [...results];
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

  return (
    <ScreenLayout alternativeHeader={{ title: "Buscá tus recetas" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sortButtonsContainer}>
          <TouchableOpacity onPress={() => setSortType('newest')} style={[styles.sortButton, sortType === 'newest' && styles.sortButtonActiveOlive]}>
            <Text style={[styles.sortButtonText, sortType === 'newest' && styles.sortButtonTextActiveOlive]}>Más nuevas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType('oldest')} style={[styles.sortButton, sortType === 'oldest' && styles.sortButtonActiveAzul]}>
            <Text style={[styles.sortButtonText, sortType === 'oldest' && styles.sortButtonTextActiveAzul]}>Más antiguas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType('az')} style={[styles.sortButton, sortType === 'az' && styles.sortButtonActiveOlive]}>
            <Text style={[styles.sortButtonText, sortType === 'az' && styles.sortButtonTextActiveOlive]}>A - Z</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType('za')} style={[styles.sortButton, sortType === 'za' && styles.sortButtonActiveAzul]}>
            <Text style={[styles.sortButtonText, sortType === 'za' && styles.sortButtonTextActiveAzul]}>Z - A</Text>
          </TouchableOpacity>
        </View>
        {loading && <View style={{ padding: 20 }}><ActivityIndicator /></View>}
        {error && <View style={{ padding: 20 }}><Text style={{ color: 'red' }}>{error}</Text></View>}
        {!loading && !error && results.length > 0 && (
          <View>
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
                  onPress={() => router.push(`/logged/receipt/${recipe._id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.orange.orange50,
    flexGrow: 1,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
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
    fontWeight: 'bold',
  },
  sortButtonTextActiveOlive: {
    color: Colors.olive.olive900,
  },
  sortButtonTextActiveAzul: {
    color: Colors.azul.azul900,
  },
});

export default SearchResult;
