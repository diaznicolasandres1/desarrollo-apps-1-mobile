import ScreenLayout from "@/components/ScreenLayout";
import UniversalRecipeCard from "@/components/UniversalRecipeCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useSync } from "@/context/sync.context";
import { CreateRecipeRequest } from "@/resources/receipt";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyRecipes() {
  const router = useRouter();
  const { user } = useAuth();
  const { allUserRecipes, refreshUserRecipes } = useSync();

  useFocusEffect(
    useCallback(() => {
      refreshUserRecipes();
    }, [refreshUserRecipes])
  );

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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus creaciones:</Text>
        </View>
        <View style={styles.recipesContainer}>
          {allUserRecipes.serverRecipes.length > 0 || allUserRecipes.pendingRecipes.length > 0 ? (
            <>
              {/* Filtrar recetas del servidor que tienen versión editada en storage local */}
              {allUserRecipes.serverRecipes
                .filter(serverRecipe => {
                  // Si hay una receta en storage con isUpdate=true y originalRecipeId igual a esta receta del servidor,
                  // no mostrar la del servidor porque hay una versión editada offline
                  const hasEditedVersion = allUserRecipes.pendingRecipes.some(storedRecipe => 
                    storedRecipe.isUpdate && 
                    storedRecipe.originalRecipeId === serverRecipe._id
                  );
                  
                  // Si hay una receta en storage con isReplacement=true y recipeToReplaceId igual a esta receta del servidor,
                  // no mostrar la del servidor porque ha sido reemplazada offline
                  const hasReplacementVersion = allUserRecipes.pendingRecipes.some(storedRecipe => 
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
              {allUserRecipes.pendingRecipes.map((recipe, index) => (
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
      </ScrollView>
    </ScreenLayout>
  );
}

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

  recipesContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 16,
  },
});
