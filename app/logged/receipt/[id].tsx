import CommentForm from "@/components/CommentForm";
import FavoriteButton from "@/components/FavoriteButton";
import { ImageGallery } from "@/components/ImageGallery";
import PortionsModal from "@/components/PortionsModal";
import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getRecipeById, RecipeDetail } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Chip, List } from "react-native-paper";

const ReceiptPage = () => {
  const { isConnected } = useNetworkStatus();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [receipt, setReceipt] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPortionsModal, setShowPortionsModal] = useState(false);
  const [selectedPortionType, setSelectedPortionType] = useState<
    "half" | "double" | "custom"
  >("custom");
  const [customPortions, setCustomPortions] = useState("");
  const [currentMultiplier, setCurrentMultiplier] = useState(1);

  const { user } = useAuth();

  const isReceiptOwner = user?._id === receipt?.userId;

  // Funciones para manejar el modal de porciones
  const handleOpenPortionsModal = () => {
    setCustomPortions(receipt?.servings.toString() || "");
    setShowPortionsModal(true);
  };

  const handlePortionTypeSelect = (type: "half" | "double" | "custom") => {
    setSelectedPortionType(type);
    if (type === "half") {
      setCustomPortions(Math.ceil((receipt?.servings || 1) / 2).toString());
    } else if (type === "double") {
      setCustomPortions(((receipt?.servings || 1) * 2).toString());
    }
  };

  const handleApplyPortions = () => {
    const newPortions = parseInt(customPortions) || 1;
    const originalPortions = receipt?.servings || 1;
    const multiplier = newPortions / originalPortions;
    setCurrentMultiplier(multiplier);
    setShowPortionsModal(false);
  };

  const handleCancelPortions = () => {
    setSelectedPortionType("custom");
    setCustomPortions(receipt?.servings.toString() || "");
    setShowPortionsModal(false);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRecipe = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (!isConnected) {
        setError("No hay conexión a internet");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getRecipeById(id);

        if (isMounted) {
          if (data) {
            setReceipt(data);
          } else {
            setError("No se pudo obtener la receta");
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al obtener la receta:", err);
          setError("Error al cargar la receta");
          setLoading(false);
        }
      }
    };

    // Limpiar estado anterior cuando cambia el ID
    setReceipt(null);
    setError(null);
    setLoading(true);

    loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [id, isConnected]);

  if (!id) {
    return (
      <ScreenLayout>
        <View style={{ padding: 20 }}>
          <Text>Receta no encontrada.</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!isConnected && !receipt) {
    return (
      <ScreenLayout>
        <View style={{ padding: 20 }}>
          <Text>
            No hay conexión a internet. Por favor, verifica tu conexión.
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error && !receipt) {
    return (
      <ScreenLayout>
        <View style={{ padding: 20 }}>
          <Text>{error}</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (loading || !receipt) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.azul.azul600} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      alternativeHeader={{
        title: receipt?.name || "Receta",
        actions: (
          <>
            {!isReceiptOwner ? (
              <TouchableOpacity onPress={() => router.push("/logged/create")}>
                <Ionicons name="add-circle-outline" size={25} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => {}}>
                <Ionicons name="pencil-outline" size={25} />
              </TouchableOpacity>
            )}
            <FavoriteButton id={id} />{" "}
            <TouchableOpacity onPress={handleOpenPortionsModal}>
              <Ionicons name="calculator-outline" size={25} />
            </TouchableOpacity>
          </>
        ),
      }}
    >
      <ScrollView>
        <View style={styles.pageContainer}>
          <View style={styles.innerPadding}>
            <ImageGallery images={receipt.principalPictures} />
            <Text style={styles.description}>{receipt.description}</Text>

            <View style={styles.categoryContainer}>
              {receipt.category.map((category, i) => (
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
                <Text style={styles.statValue}>{receipt.duration}</Text>
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
                <Text style={styles.statValue}>
                  {Math.round(receipt.servings * currentMultiplier)}
                  {currentMultiplier !== 1 && (
                    <Text style={styles.originalText}>
                      {" "}
                      (orig: {receipt.servings})
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
          </View>

          <View style={styles.innerPadding}>
            <List.Section style={styles.ingredientList}>
              {receipt.ingredients.map((ingredient, i) => {
                const adjustedQuantity = (
                  ingredient.quantity * currentMultiplier
                )
                  .toFixed(1)
                  .replace(".0", "");
                return (
                  <List.Item
                    key={i}
                    title={` • ${ingredient.name} (${adjustedQuantity} ${ingredient.measureType})`}
                    titleStyle={styles.ingredientText}
                  />
                );
              })}
            </List.Section>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pasos a seguir</Text>
          </View>

          <List.Section style={styles.instructionsList}>
            {receipt.steps.map((instruction, i) => (
              <List.Item
                key={i}
                title={instruction.title}
                description={instruction.description}
                left={() => (
                  <Image
                    source={{ uri: instruction.mediaResource }}
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
              {receipt.ratings.map((rating, i) => (
                <List.Item
                  key={i}
                  title={
                    <View style={styles.commentHeader}>
                      <View>
                        <Text style={styles.commentUser}>{rating.name}</Text>
                        <Text style={styles.commentDate}>
                          {new Date(rating.createdAt).toLocaleDateString(
                            "es-ES"
                          )}
                        </Text>
                      </View>
                    </View>
                  }
                  description={
                    <View style={styles.commentContent}>
                      <Text style={styles.commentText}>{rating.comment}</Text>
                      <View style={styles.commentRating}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={20}
                            color={
                              i < rating.score
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

          {!isReceiptOwner && (
            <View style={styles.innerPadding}>
              <CommentForm
                recipeId={id}
                onCommentAdded={async () => {
                  try {
                    const data = await getRecipeById(id);
                    if (data) {
                      setReceipt(data);
                    }
                  } catch (error) {
                    console.error("Error al recargar comentarios:", error);
                  }
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <PortionsModal
        visible={showPortionsModal}
        originalServings={receipt?.servings || 1}
        selectedPortionType={selectedPortionType}
        customPortions={customPortions}
        onPortionTypeSelect={handlePortionTypeSelect}
        onCustomPortionsChange={(custom: string) => {
          setCustomPortions(custom);
          setSelectedPortionType("custom");
        }}
        onApply={handleApplyPortions}
        onCancel={handleCancelPortions}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

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
  originalText: {
    color: "gray",
    fontSize: 14,
    fontWeight: "normal",
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
    alignItems: "center",
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
