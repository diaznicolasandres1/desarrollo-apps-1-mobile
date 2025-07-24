import ScreenLayout from "@/components/ScreenLayout";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useSync } from "@/context/sync.context";
import {
  SavedCustomRecipe,
  useSavedCustomRecipe,
} from "@/hooks/useSavedCustomRecipe";
import { CreateRecipeRequest, RecipeDetail } from "@/resources/receipt";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MyRecipes() {
  const { allUserRecipes, refreshUserRecipes } = useSync();
  const { getCustomRecipes } = useSavedCustomRecipe();
  const [customRecipes, setCustomRecipes] = useState<SavedCustomRecipe[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshUserRecipes();
      loadCustomRecipes();
    }, [refreshUserRecipes])
  );

  const loadCustomRecipes = async () => {
    try {
      const recipes = await getCustomRecipes();
      setCustomRecipes(recipes);
    } catch (error) {
      console.error("Error loading custom recipes:", error);
      setCustomRecipes([]);
    }
  };

  if (allUserRecipes.isLoading) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout alternativeHeader={{ title: "Mis recetas" }}>
      <ScrollView>
        <CustomRecipes customRecipes={customRecipes} />
        <YourRecipes
          serverRecipes={allUserRecipes.serverRecipes || []}
          pendingRecipes={allUserRecipes.pendingRecipes || []}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const YourRecipes = ({
  pendingRecipes,
  serverRecipes,
}: {
  serverRecipes: RecipeDetail[];
  pendingRecipes: CreateRecipeRequest[];
}) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Tus creaciones:</Text>
    </View>
    <View style={styles.recipesContainer}>
      {serverRecipes.length > 0 || pendingRecipes.length > 0 ? (
        <>
          {/* Filtrar recetas del servidor que tienen versión editada en storage local */}
          {serverRecipes
            .filter((serverRecipe) => {
              // Si hay una receta en storage con isUpdate=true y originalRecipeId igual a esta receta del servidor,
              // no mostrar la del servidor porque hay una versión editada offline
              const hasEditedVersion = pendingRecipes.some(
                (storedRecipe) =>
                  storedRecipe.isUpdate &&
                  storedRecipe.originalRecipeId === serverRecipe._id
              );

              // Si hay una receta en storage con isReplacement=true y recipeToReplaceId igual a esta receta del servidor,
              // no mostrar la del servidor porque ha sido reemplazada offline
              const hasReplacementVersion = pendingRecipes.some(
                (storedRecipe) =>
                  storedRecipe.isReplacement &&
                  storedRecipe.recipeToReplaceId === serverRecipe._id
              );

              return !hasEditedVersion && !hasReplacementVersion;
            })
            .map((recipe) => (
              <UniversalRecipeCard
                key={recipe._id}
                id={recipe._id}
                name={recipe.name}
                description={recipe.description}
                principalPictures={recipe.principalPictures}
                status={recipe.status}
                variant="my-recipe"
              />
            ))}

          {/* Mostrar todas las recetas del storage local (nuevas y editadas) */}
          {pendingRecipes.map((recipe, index) => (
            <UniversalRecipeCard
              key={`stored-${index}`}
              name={recipe.name}
              description={recipe.description}
              principalPictures={recipe.principalPictures}
              status={recipe.status}
              variant="my-recipe"
              onPress={() => {}}
            />
          ))}
        </>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            No encontramos recetas creadas por vos.
          </Text>
        </View>
      )}
    </View>
  </>
);

const CustomRecipes = ({
  customRecipes = [],
}: {
  customRecipes: SavedCustomRecipe[];
}) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recetas Personalizadas:</Text>
      <Text style={styles.sectionSubtitle}>{customRecipes.length}/10</Text>
    </View>
    <View style={styles.recipesContainer}>
      {customRecipes.length > 0 ? (
        customRecipes.map((customRecipe, index) => (
          <UniversalRecipeCard
            key={`custom-${customRecipe.recipe.id}-${index}`}
            id={`custom-${customRecipe.recipe.id}`}
            name={`${customRecipe.recipe.title} (Personalizada)`}
            description={customRecipe.recipe.description}
            principalPictures={
              customRecipe.recipe.image
                ? [{ url: customRecipe.recipe.image, description: "" }]
                : []
            }
            variant="my-recipe"
          />
        ))
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No tienes recetas personalizadas aún.
          </Text>
          <Text style={styles.emptySubtext}>
            Personaliza una receta desde el botón de calculadora para verla
            aquí.
          </Text>
        </View>
      )}
    </View>
  </>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.red.red600,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray.gray600,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray.gray500,
    textAlign: "center",
    fontStyle: "italic",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.orange.orange100,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.orange.orange700,
    backgroundColor: Colors.orange.orange200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  recipesContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 16,
  },
});
