import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { List } from "react-native-paper";

export interface IngredientItem {
  name: string;
  quantity: number;
  measureType: string;
}

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
  adjustedServings: number;
  baseRecipeId: string;
  baseRecipeName: string;
}

interface IngredientsProps {
  ingredients: IngredientItem[];
  customRecipeState: CustomRecipeState;
}

const getIngredientDisplayInfo = (
  ingredient: IngredientItem,
  modifiedIngredient: ModifiedIngredients[string] | undefined,
  state: CustomRecipeState
) => {
  let displayQuantity: string;

  if (state.isCustomized && modifiedIngredient) {
    // Si hay un ingrediente modificado, usar esa cantidad
    displayQuantity = parseFloat(modifiedIngredient.quantity).toString();
  } else if (state.isCustomized && state.portionType !== "ingredients") {
    // Si está personalizado pero no hay ingrediente modificado específico, usar el multiplicador
    const adjustedQuantity = ingredient.quantity * state.currentMultiplier;
    displayQuantity = adjustedQuantity.toFixed(2).replace(/\.?0+$/, "");
  } else {
    // Usar la cantidad original
    displayQuantity = ingredient.quantity.toString();
  }

  const showOriginal =
    state.isCustomized && displayQuantity !== ingredient.quantity.toString();

  return { displayQuantity, showOriginal };
};

const IngredientListItem = ({
  ingredient,
  displayQuantity,
  showOriginal,
  isDirectlyModified,
}: {
  ingredient: IngredientItem;
  displayQuantity: string;
  showOriginal: boolean;
  isDirectlyModified: boolean;
}) => {
  const title = (
    <View style={styles.ingredientContainer}>
      <View style={styles.ingredientMainRow}>
        <Text style={styles.ingredientBullet}>•</Text>
        <Text
          style={[
            styles.ingredientName,
            isDirectlyModified && styles.modifiedIngredientName,
          ]}
        >
          {ingredient.name}
        </Text>
      </View>

      <View style={styles.ingredientQuantityRow}>
        <Text
          style={[
            styles.ingredientQuantity,
            isDirectlyModified && styles.modifiedIngredientQuantity,
          ]}
        >
          {displayQuantity} {ingredient.measureType}
        </Text>

        {showOriginal && (
          <Text style={styles.originalQuantity}>
            (original: {ingredient.quantity} {ingredient.measureType})
          </Text>
        )}
      </View>
    </View>
  );

  return <List.Item title={title} style={styles.ingredientItem} />;
};

const Ingredients: React.FC<IngredientsProps> = ({
  ingredients,
  customRecipeState,
}) => {
  console.log("🔍 Estado de receta personalizada:", {
    isCustomized: customRecipeState.isCustomized,
    portionType: customRecipeState.portionType,
    modifiedIngredients: customRecipeState.modifiedIngredients,
    currentMultiplier: customRecipeState.currentMultiplier,
  });

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
      </View>

      <View style={styles.innerPadding}>
        <List.Section style={styles.ingredientList}>
          {ingredients.map((ingredient, index) => {
            const modifiedIngredient =
              customRecipeState.modifiedIngredients[index.toString()];
            const isDirectlyModified =
              customRecipeState.portionType === "ingredients" &&
              modifiedIngredient?.isIngredientSelected === true;

            const { displayQuantity, showOriginal } = getIngredientDisplayInfo(
              ingredient,
              modifiedIngredient,
              customRecipeState
            );

            console.log(`🍽️ Ingrediente ${index}:`, {
              name: ingredient.name,
              originalQuantity: ingredient.quantity,
              displayQuantity,
              showOriginal,
              modifiedIngredient,
            });

            return (
              <IngredientListItem
                key={index}
                ingredient={ingredient}
                displayQuantity={displayQuantity}
                showOriginal={showOriginal}
                isDirectlyModified={isDirectlyModified}
              />
            );
          })}
        </List.Section>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  innerPadding: {
    paddingHorizontal: 20,
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
  ingredientContainer: {
    flexDirection: "column",
    width: "100%",
  },
  ingredientMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ingredientBullet: {
    fontSize: 16,
    color: Colors.olive.olive800,
    marginRight: 8,
    fontWeight: "bold",
  },
  ingredientName: {
    fontSize: 16,
    color: Colors.olive.olive800,
    fontWeight: "500",
    flex: 1,
  },
  modifiedIngredientName: {
    color: Colors.orange.orange700,
    fontWeight: "bold",
  },
  ingredientQuantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24, // Align with ingredient name (bullet + margin)
    flexWrap: "wrap",
  },
  ingredientQuantity: {
    fontSize: 15,
    color: Colors.olive.olive700,
    fontWeight: "600",
  },
  modifiedIngredientQuantity: {
    color: Colors.orange.orange600,
    fontWeight: "bold",
  },
  originalQuantity: {
    fontSize: 13,
    color: Colors.olive.olive500,
    fontStyle: "italic",
    marginLeft: 8,
  },
  ingredientItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
});

export default Ingredients;
