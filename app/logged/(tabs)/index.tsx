import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
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
];

const recipes = [
  {
    title: "Sopa de verduras",
    img: "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    id: "1",
    description: "Sopa reconfortante con una mezcla de verduras de temporada.",
    time: "10 min • Fácil",
  },
  {
    title: "Ensalada de Aguacate",
    img: "https://enmicasa.com/wp-content/uploads/2014/04/ensalada-de-lechuga-y-naranja.jpg",
    id: "2",
    description:
      "Una ensalada fresca y nutritiva con aguacate, tomate y limón, perfecta para los días calurosos de verano.",
    time: "15 min • Fácil",
  },
  {
    title: "Pollo frito",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW0IhDJLt4MXaA1vnuE0X6LS6kqRzaA6w4MgbdoeL57bsONvfPWrIYnSlr_jBP14DoFMs&usqp=CAU",
    id: "3",
    description: "Pollo frito estilo americano.",
    time: "45 min • Medio",
  },
  {
    title: "Tarta de zapallitos",
    img: "https://www.rionegro.com.ar/wp-content/uploads/2021/12/264105803_1201331497024538_3460023307247946621_n.jpg?w=720",
    id: "4",
    description: "Tarta de zapallitos con queso y cebolla.",
    time: "30 min • Fácil",
  },
  {
    title: "Fideos con salsa de tomate",
    img: "https://lh4.googleusercontent.com/proxy/SPXNSWtah70gXbcwplD-y6ilNBemhI3ztgH9uTynXlaI9ewxbMpLi0M_hjfk9zHONXC7mqo0DfR15sH9ZWrNdPaT43OaBHeilZaUrRVqDmzIzs-6ic2m1nYo7pmPxg",
    id: "5",
    description: "Fideos con salsa de tomate y queso.",
    time: "20 min • Fácil",
  },
];

export default function HomeScreen() {
  const router = useRouter();
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
              <View key={title} style={styles.categoryItem}>
                <Image source={{ uri: img }} style={styles.categoryImage} />
                <Text style={styles.categoryText}>{title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destacadas</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={Colors.orange.orange900}
            />
          </View>
          <View style={styles.recipesContainer}>
            {recipes.map(({ id, title, img, description, time }) => (
              <View key={id} style={styles.recipeItem}>
                <View style={styles.recipeImageContainer}>
                  <Image
                    source={{
                      uri: img,
                    }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle}>{title}</Text>
                  <Text
                    style={styles.recipeDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {description}
                  </Text>
                  <View style={styles.recipeInfoRow}>
                    <View style={styles.recipeInfoRowItem}>
                      <Ionicons
                        name="time-outline"
                        size={28}
                        color={Colors.orange.orange900}
                      />
                      <Text>{time}</Text>
                    </View>
                    <View style={styles.recipeInfoRowItem}>
                      <TouchableOpacity
                        onPress={() => {
                          router.push(`/logged/receipt/${id}`);
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
  recipeImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
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
  recipeInfoRowItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
