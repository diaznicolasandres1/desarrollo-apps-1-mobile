import { ImageGallery } from "@/components/ImageGallery";
import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { Chip, List } from "react-native-paper";
const receipt = {
  id: "1",
  title: "Sopa de verduras",
  description: "Sopa de verduras con caldo de pollo y cebolla",
  ingredients: [
    {
      name: "Cebolla",
      quantity: "1",
      unit: "unidad",
    },
    {
      name: "Zanahoria",
      quantity: "1",
      unit: "unidad",
    },
    {
      name: "Pimiento",
      quantity: "1",
      unit: "unidad",
    },
    {
      name: "Tomate",
      quantity: "1",
      unit: "unidad",
    },
    {
      name: "Caldo de pollo",
      quantity: "1",
      unit: "unidad",
    },
  ],
  instructions: [
    {
      step: 1,
      description: "Pelar y cortar las verduras.",
      image:
        "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    },
    {
      step: 2,
      description: "Cocinar las verduras en una olla.",
      image:
        "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    },
    {
      step: 3,
      description: "Servir.",
      image:
        "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    },
  ],
  images: [
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
  ],
  time: "10 min",
  servings: 2,
  difficulty: "Facil",
  categories: ["Sopas", "Vegetariano", "Facil"],
  comments: [
    {
      user: "Juan Perez",
      comment: "Muy buena receta",
      rating: 5,
      date: "2021-01-01",
      photo:
        "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    },
    {
      user: "Maria Gonzalez",
      comment: "Muy buena receta, pero me gustaria que tuviera mas sabor",
      rating: 3,
      date: "2020-01-01",
      photo:
        "https://api-cdn.figma.com/resize/img/1f40/60b3/01b5b190f98fa4f181586e9151f8f42b?expiration=1748217600&signature=6fa8ff9032cab824d77d9a7d579b75c2b876956062d43972414617742aa55743&maxsize=2048&bucket=figma-alpha",
    },
  ],
};

const ReceiptPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout alternativeHeader={{ title: receipt.title }}>
      <ScrollView>
        <View style={styles.pageContainer}>
          <View style={styles.innerPadding}>
            <ImageGallery images={receipt.images} />
            <Text style={styles.description}>{receipt.description}</Text>

            <View style={styles.categoryContainer}>
              {receipt.categories.map((category, i) => (
                <Chip key={i} style={styles.chip} textStyle={styles.chipText}>
                  {category}
                </Chip>
              ))}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Ionicons
                  name="time-outline"
                  size={50}
                  color={Colors.azul.azul600}
                />
                <Text style={styles.statLabel}>Tiempo</Text>
                <Text style={styles.statValue}>{receipt.time}</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons
                  name="book-outline"
                  size={50}
                  color={Colors.azul.azul600}
                />
                <Text style={styles.statLabel}>Dificultad</Text>
                <Text style={styles.statValue}>{receipt.difficulty}</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons
                  name="people-outline"
                  size={50}
                  color={Colors.azul.azul600}
                />
                <Text style={styles.statLabel}>Porciones</Text>
                <Text style={styles.statValue}>{receipt.servings}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
          </View>

          <View style={styles.innerPadding}>
            <List.Section style={styles.ingredientList}>
              {receipt.ingredients.map((ingredient, i) => (
                <List.Item
                  key={i}
                  title={` • ${ingredient.name} (${ingredient.quantity} ${ingredient.unit})`}
                  titleStyle={styles.ingredientText}
                />
              ))}
            </List.Section>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pasos a seguir</Text>
          </View>

          <List.Section style={styles.instructionsList}>
            {receipt.instructions.map((instruction, i) => (
              <List.Item
                key={i}
                title={`Paso ${instruction.step}`}
                description={instruction.description}
                left={() => (
                  <Image
                    source={{ uri: instruction.image }}
                    style={styles.instructionImage}
                  />
                )}
                style={styles.instructionItem}
                titleStyle={styles.instructionTitle}
                descriptionStyle={styles.instructionDescription}
              />
            ))}
          </List.Section>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
          </View>

          <View style={styles.innerPadding}>
            <List.Section style={styles.commentList}>
              {receipt.comments.map((comment, i) => (
                <List.Item
                  key={i}
                  title={
                    <View style={styles.commentHeader}>
                      <Image
                        source={{ uri: comment.photo }}
                        style={styles.commentPhoto}
                      />
                      <View>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentDate}>{comment.date}</Text>
                      </View>
                    </View>
                  }
                  description={
                    <View style={styles.commentContent}>
                      <Text style={styles.commentText}>{comment.comment}</Text>
                      <View style={styles.commentRating}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={20}
                            color={
                              i < comment.rating
                                ? Colors.orange.orange600
                                : "gray"
                            }
                          />
                        ))}
                      </View>
                    </View>
                  }
                  style={styles.commentItem}
                />
              ))}
            </List.Section>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    gap: 10,
    paddingBottom: 40,
  },
  innerPadding: {
    paddingHorizontal: 20,
  },
  description: {
    color: Colors.olive.olive600,
    fontWeight: "700",
    fontSize: 16,
  },
  categoryContainer: {
    marginVertical: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    marginVertical: 5,
    marginRight: 5,
    backgroundColor: Colors.olive.olive200,
  },
  chipText: {
    color: Colors.olive.olive700,
    fontWeight: "bold",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.olive.olive50,
    height: 150,
    borderRadius: 10,
    borderColor: Colors.olive.olive200,
    borderWidth: 1,
  },
  statBox: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    color: Colors.azul.azul600,
    fontSize: 16,
  },
  statValue: {
    color: "black",
    fontSize: 16,
  },
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
  ingredientList: {
    backgroundColor: Colors.olive.olive50,
    borderRadius: 10,
    borderColor: Colors.olive.olive200,
    borderWidth: 1,
  },
  ingredientText: {
    fontSize: 16,
    color: Colors.olive.olive800,
    fontWeight: "bold",
  },
  instructionsList: {
    paddingVertical: 0,
    marginVertical: 0,
  },
  instructionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  instructionTitle: {
    fontSize: 16,
    color: Colors.orange.orange700,
    fontWeight: "bold",
  },
  instructionDescription: {
    fontSize: 14,
    color: Colors.olive.olive800,
  },
  instructionImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginLeft: 20,
  },
  commentList: {
    borderRadius: 10,
    marginVertical: 0,
    gap: 10,
  },
  commentItem: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.olive.olive200,
    backgroundColor: Colors.olive.olive50,
  },
  commentHeader: {
    flexDirection: "row",
    gap: 10,
  },
  commentPhoto: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  commentUser: {
    fontSize: 16,
    color: "gray",
    fontWeight: "bold",
  },
  commentDate: {
    fontSize: 16,
    color: Colors.olive.olive800,
  },
  commentContent: {
    flexDirection: "column",
    gap: 10,
    paddingTop: 20,
  },
  commentText: {
    fontSize: 16,
    color: Colors.olive.olive800,
  },
  commentRating: {
    flexDirection: "row",
    gap: 5,
    width: "100%",
    justifyContent: "flex-end",
  },
});

export default ReceiptPage;
