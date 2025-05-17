import { useAuth } from "@/context/auth.context";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="person-circle-outline" size={25} />
          </TouchableOpacity>
          <View style={styles.iconGroup}>
            <TouchableOpacity onPress={logout}>
              <Ionicons name="search-outline" size={25} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Ionicons name="settings-outline" size={25} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerText}>Recetas</Text>
      </View>

      {/* Sección de Categorías */}
      <View style={styles.sectionContainer}>
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
          {[
            {
              title: "Vegetariano",
              img: "https://api-cdn.figma.com/resize/img/703f/261e/606dc66dc8c6aae60e7b0d5e52964e9d?expiration=1748217600&signature=3d9a32641f7cdb7bbe6257704a8c2769d8c6343175c794ab4c1957a6315a35f8&maxsize=2048&bucket=figma-alpha",
            },
            {
              title: "Postres",
              img: "https://api-cdn.figma.com/resize/img/2731/bb44/516cc3626f32538cdab174a7e30f2014?expiration=1748217600&signature=1b55db6d6c0c23611a95f4a6ce18b8c71cc0789dcd06ed055e85816a89345728&maxsize=2048&bucket=figma-alpha",
            },
            {
              title: "Sopa",
              img: "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
            },
            {
              title: "Desayuno",
              img: "https://api-cdn.figma.com/resize/img/4197/37d3/350ce1e899984cfedbb8b73b298423c6?expiration=1748217600&signature=1a648d4de0aeb3d37debcc1613ba3edac2596f40624d47d81fb7d75d22df0f12&maxsize=2048&bucket=figma-alpha",
            },
          ].map(({ title, img }) => (
            <View key={title} style={styles.categoryItem}>
              <Image source={{ uri: img }} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Sección de Destacadas */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destacadas</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.orange.orange900}
          />
        </View>
        {["Sopa de verduras", "Ensalada de Aguacate", "Pollo frito"].map(
          (title) => (
            <View key={title} style={styles.recipeItem}>
              <Text>{title}</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  headerContainer: {
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconGroup: {
    flexDirection: "row",
    gap: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.orange.orange900,
    marginTop: 16,
  },
  sectionContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orange.orange100,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  scrollHorizontal: {
    paddingLeft: 10,
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
  recipeItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
