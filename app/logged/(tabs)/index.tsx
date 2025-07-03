import ScreenLayout from "@/components/ScreenLayout";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useFeaturedRecipes } from "@/hooks/useFeaturedRecipes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  {
    title: "Vegetariano",
    img: require("@/assets/images/vegetariano.png"),
  },
  {
    title: "Postres",
    img: require("@/assets/images/postres.png"),
  },
  {
    title: "Sopa",
    img: require("@/assets/images/sopas.png"),
  },
  {
    title: "Desayuno",
    img: require("@/assets/images/desayuno.png"),
  },
  {
    title: "Pastas",
    img: require("@/assets/images/pastas.png"),
  },
  {
    title: "Carnes y Aves",
    img: require("@/assets/images/carnes.png"),
  },
  {
    title: "Pescados y mariscos",
    img: require("@/assets/images/pescados.png"),
  },
  {
    title: "Ensaladas",
    img: require("@/assets/images/ensaladas.png"),
  },
  {
    title: "Salsas",
    img: require("@/assets/images/salsas.png"),
  },
  {
    title: "Guarniciones",
    img: require("@/assets/images/guarniciones.png"),
  },
  {
    title: "Legumbres y guisos",
    img: require("@/assets/images/legumbres.png"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, loading, error, refreshRecipes } = useFeaturedRecipes();

  const renderFeaturedRecipes = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRecipes}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (recipes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay recetas destacadas disponibles
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recipesContainer}>
        {recipes.map(
          ({
            description,
            duration,
            difficulty,
            _id: id,
            name: title,
            principalPictures,
          }) => (
            <UniversalRecipeCard
              key={id}
              id={id}
              name={title}
              principalPictures={[
                {
                  url: principalPictures[0].url,
                  description: principalPictures[0].description,
                },
              ]}
              description={description}
              difficulty={difficulty}
              duration={duration}
              variant="normal"
            />
          )
        )}
      </View>
    );
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={Colors.orange.orange900}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollHorizontal}
          >
            {categories.map(({ title, img }) => (
              <TouchableOpacity
                key={title}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: "/logged/search",
                    params: { category: title },
                  })
                }
              >
                <Image source={img} style={styles.categoryImage} />
                <Text style={styles.categoryText}>{title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destacadas</Text>
            <TouchableOpacity onPress={refreshRecipes}>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.orange.orange900}
              />
            </TouchableOpacity>
          </View>
          {renderFeaturedRecipes()}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orange.orange100,
    padding: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  scrollHorizontal: {
    paddingLeft: 10,
    paddingVertical: 10,
  },
  categoryItem: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    width: 120,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  recipesContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  retryButton: {
    padding: 10,
    backgroundColor: Colors.orange.orange900,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
});
