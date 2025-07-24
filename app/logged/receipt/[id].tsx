import FavoriteButton from "@/components/FavoriteButton";
import { ImageGallery } from "@/components/ImageGallery";
import PortionsModal from "@/components/PortionsModal";
import ScreenLayout from "@/components/ScreenLayout";
import Ingredients, { Ratings } from "@/components/SIngleRecipe";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSavedCustomRecipe } from "@/hooks/useSavedCustomRecipe";
import { getRecipeById, RecipeDetail } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Chip, List } from "react-native-paper";
import Toast from "react-native-toast-message";

export type PortionsType =
  | "half"
  | "double"
  | "custom"
  | "original"
  | "ingredients";

export type ModifiedIngredients = {
  [key: string]: {
    isIngredientSelected: boolean;
    quantity: string;
  };
};

export interface CustomRecipeState {
  isCustomized: boolean;
  portionType: PortionsType;
  customPortions: string;
  currentMultiplier: number;
  modifiedIngredients: ModifiedIngredients;
  // Información adicional para el guardado
  adjustedServings: number;
  baseRecipeId: string;
  baseRecipeName: string;
}

const ReceiptPage = () => {
  const { isConnected } = useNetworkStatus();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [receipt, setReceipt] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPortionsModal, setShowPortionsModal] = useState(false);
  const { getCustomRecipe, deleteCustomRecipe } = useSavedCustomRecipe();

  const [customRecipeState, setCustomRecipeState] = useState<CustomRecipeState>(
    {
      isCustomized: false,
      portionType: "custom",
      customPortions: "",
      currentMultiplier: 1,
      modifiedIngredients: {},
      adjustedServings: 0,
      baseRecipeId: "",
      baseRecipeName: "",
    }
  );

  const { user } = useAuth();

  const isReceiptOwner = user?._id === receipt?.userId;

  useEffect(() => {
    (async () => {
      if (receipt && id) {
        try {
          if (id.includes("custom-")) {
            // Extraer el ID base sin el prefijo "custom-"
            const baseId = id.replace("custom-", "");
            const savedRecipe = await getCustomRecipe(baseId);
            if (savedRecipe) {
              console.log("Receta personalizada cargada:", savedRecipe);
              setCustomRecipeState((prev) => ({
                ...prev,
                ...savedRecipe.state,
              }));
              return;
            } else {
              console.log(
                "No se encontró receta personalizada para ID:",
                baseId
              );
            }
          }

          setCustomRecipeState((prev) => ({
            ...prev,
            baseRecipeId: id,
            baseRecipeName: receipt.name,
            customPortions: receipt.servings.toString(),
            adjustedServings: receipt.servings,
          }));
        } catch (error) {
          console.error("Error loading custom recipe state:", error);
          // Si hay error, usar valores por defecto
          setCustomRecipeState((prev) => ({
            ...prev,
            baseRecipeId: id,
            baseRecipeName: receipt.name,
            customPortions: receipt.servings.toString(),
            adjustedServings: receipt.servings,
          }));
        }
      }
    })();
  }, [receipt, id]);

  const handleOpenPortionsModal = () => {
    setCustomRecipeState((prev) => ({
      ...prev,
      customPortions: receipt?.servings.toString() || "",
    }));
    setShowPortionsModal(true);
  };

  const handlePortionTypeSelect = (type: PortionsType) => {
    setCustomRecipeState((prev) => {
      let newState = { ...prev, portionType: type, isCustomized: true };

      if (type === "half") {
        const multiplier = 0.5;
        newState.customPortions = Math.ceil(
          (receipt?.servings || 1) / 2
        ).toString();
        newState.adjustedServings = Math.ceil((receipt?.servings || 1) / 2);
        newState.currentMultiplier = multiplier;

        // Calcular ingredientes modificados
        const proportionalIngredients: ModifiedIngredients = {};
        if (receipt?.ingredients) {
          receipt.ingredients.forEach((ingredient, index) => {
            const calculatedQuantity = ingredient.quantity * multiplier;
            proportionalIngredients[index.toString()] = {
              quantity: calculatedQuantity.toFixed(2).replace(/\.?0+$/, ""),
              isIngredientSelected: false,
            };
          });
        }
        newState.modifiedIngredients = proportionalIngredients;
        console.log(
          "✅ Ingredientes calculados para 'half':",
          proportionalIngredients
        );
      } else if (type === "double") {
        const multiplier = 2;
        newState.customPortions = ((receipt?.servings || 1) * 2).toString();
        newState.adjustedServings = (receipt?.servings || 1) * 2;
        newState.currentMultiplier = multiplier;

        // Calcular ingredientes modificados
        const proportionalIngredients: ModifiedIngredients = {};
        if (receipt?.ingredients) {
          receipt.ingredients.forEach((ingredient, index) => {
            const calculatedQuantity = ingredient.quantity * multiplier;
            proportionalIngredients[index.toString()] = {
              quantity: calculatedQuantity.toFixed(2).replace(/\.?0+$/, ""),
              isIngredientSelected: false,
            };
          });
        }
        newState.modifiedIngredients = proportionalIngredients;
        console.log(
          "✅ Ingredientes calculados para 'double':",
          proportionalIngredients
        );
      } else if (type === "original") {
        newState = {
          ...prev,
          isCustomized: false,
          portionType: "original",
          customPortions: receipt?.servings.toString() || "1",
          currentMultiplier: 1,
          modifiedIngredients: {},
          adjustedServings: receipt?.servings || 1,
        };
      } else if (type === "ingredients") {
        newState.modifiedIngredients = {};
      }

      return newState;
    });
  };

  const handleIngredientQuantityChange = (
    ingredientId: string,
    quantity: string
  ) => {
    const ingredientIndex = parseInt(ingredientId);
    const originalQuantity =
      receipt?.ingredients[ingredientIndex]?.quantity || 1;

    setCustomRecipeState((prev) => {
      const newModifiedIngredients = {
        ...prev.modifiedIngredients,
        [ingredientId]: {
          quantity,
          isIngredientSelected: quantity !== "",
        },
      };

      let newState = {
        ...prev,
        modifiedIngredients: newModifiedIngredients,
        isCustomized: true,
      };

      // Only do proportional calculation if quantity is valid and not empty
      if (quantity && parseFloat(quantity) > 0 && receipt?.ingredients) {
        const newQuantity = parseFloat(quantity);
        const multiplier = newQuantity / originalQuantity;

        const proportionalIngredients: ModifiedIngredients = {};

        receipt.ingredients.forEach((ingredient, index) => {
          const calculatedQuantity = ingredient.quantity * multiplier;
          proportionalIngredients[index.toString()] = {
            quantity: calculatedQuantity.toFixed(2).replace(/\.?0+$/, ""),
            isIngredientSelected: index === ingredientIndex, // Solo el ingrediente modificado por el usuario
          };
        });

        newState.modifiedIngredients = proportionalIngredients;
        newState.currentMultiplier = multiplier;
        newState.adjustedServings = Math.round(receipt.servings * multiplier);
      }

      return newState;
    });
  };

  const handleApplyPortions = () => {
    if (customRecipeState.portionType === "ingredients") {
      setShowPortionsModal(false);
    } else {
      const newPortions = parseInt(customRecipeState.customPortions) || 1;
      const originalPortions = receipt?.servings || 1;
      const multiplier = newPortions / originalPortions;

      // Calcular ingredientes modificados proporcionalmente
      const proportionalIngredients: ModifiedIngredients = {};
      if (receipt?.ingredients) {
        receipt.ingredients.forEach((ingredient, index) => {
          const calculatedQuantity = ingredient.quantity * multiplier;
          proportionalIngredients[index.toString()] = {
            quantity: calculatedQuantity.toFixed(2).replace(/\.?0+$/, ""),
            isIngredientSelected: false,
          };
        });
      }

      setCustomRecipeState((prev) => ({
        ...prev,
        currentMultiplier: multiplier,
        modifiedIngredients: proportionalIngredients,
        adjustedServings: newPortions,
        isCustomized: multiplier !== 1,
      }));

      setShowPortionsModal(false);
    }
  };

  const handleCancelPortions = () => {
    setCustomRecipeState((prev) => ({
      ...prev,
      portionType: "custom",
      customPortions: receipt?.servings.toString() || "",
      modifiedIngredients: {},
    }));
    setShowPortionsModal(false);
  };

  const handleDeleteCustomRecipe = async () => {
    if (!id || !id.includes("custom-")) return;

    const baseId = id.replace("custom-", "");
    const customRecipe = await getCustomRecipe(baseId);

    if (!customRecipe) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontró la receta personalizada",
      });
      return;
    }

    Alert.alert(
      "Eliminar receta personalizada",
      `¿Estás seguro de que quieres eliminar "${customRecipe.recipe.title}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomRecipe(baseId);
              Toast.show({
                type: "success",
                text1: "¡Éxito!",
                text2: "Receta personalizada eliminada exitosamente",
              });
              router.back();
            } catch (error) {
              console.error("Error deleting custom recipe:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo eliminar la receta personalizada",
              });
            }
          },
        },
      ]
    );
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

        const idWithoutPrefix = id.startsWith("custom-")
          ? id.replace("custom-", "")
          : id;

        const data = await getRecipeById(idWithoutPrefix);

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

    setReceipt(null);
    setError(null);
    setLoading(true);

    loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [id, isConnected]);

  const getPortionsDisplayInfo = () => {
    if (!receipt) return { currentServings: 1, showOriginalServings: false };

    const currentServings = customRecipeState.isCustomized
      ? customRecipeState.adjustedServings
      : receipt.servings;

    const showOriginalServings =
      customRecipeState.isCustomized &&
      customRecipeState.adjustedServings !== receipt.servings;

    return { currentServings, showOriginalServings };
  };

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
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/logged/create",
                    params: { editRecipeName: receipt.name },
                  });
                }}
              >
                <Ionicons name="pencil-outline" size={25} />
              </TouchableOpacity>
            )}
            <FavoriteButton id={id} />
            {id.includes("custom-") && (
              <TouchableOpacity onPress={handleDeleteCustomRecipe}>
                <Ionicons
                  name="trash-outline"
                  size={25}
                  color={Colors.red.red600}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleOpenPortionsModal}>
              <Ionicons
                name="calculator-outline"
                size={25}
                color={
                  customRecipeState.isCustomized
                    ? Colors.orange.orange600
                    : Colors.gray.gray700
                }
              />
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
                  {(() => {
                    const { currentServings, showOriginalServings } =
                      getPortionsDisplayInfo();
                    return (
                      <>
                        {currentServings}
                        {showOriginalServings && (
                          <Text style={styles.originalText}>
                            {" (orig: " + receipt.servings + ")"}
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </Text>
              </View>
            </View>
          </View>

          <Ingredients
            ingredients={receipt.ingredients}
            customRecipeState={customRecipeState}
          />

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

          <Ratings
            ratings={receipt.ratings}
            recipeId={id}
            isReceiptOwner={isReceiptOwner}
          />
        </View>
      </ScrollView>

      <PortionsModal
        id={id}
        visible={showPortionsModal}
        originalServings={receipt?.servings || 1}
        selectedPortionType={customRecipeState.portionType}
        customPortions={customRecipeState.customPortions}
        onPortionTypeSelect={handlePortionTypeSelect}
        modifiedIngredients={customRecipeState.modifiedIngredients}
        onIngredientQuantityChange={handleIngredientQuantityChange}
        onCustomPortionsChange={(custom: string) => {
          setCustomRecipeState((prev) => ({
            ...prev,
            customPortions: custom,
            portionType: "custom",
            isCustomized: true,
          }));
        }}
        ingredients={receipt.ingredients || []}
        onApply={handleApplyPortions}
        onCancel={handleCancelPortions}
        recipeTitle={receipt?.name || ""}
        recipeDescription={receipt?.description || ""}
        recipeImage={receipt?.principalPictures?.[0]?.url || ""}
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
});

export default ReceiptPage;
