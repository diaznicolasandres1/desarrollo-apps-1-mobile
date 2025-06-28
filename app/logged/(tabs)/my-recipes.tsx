import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useSync } from "@/context/sync.context";
import { CreateRecipeRequest } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chip } from "react-native-paper";
import { RecipeDetail, recipeService } from "../../../resources/RecipeService";

export default function MyRecipes() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    userRecipes, 
    pendingRecipes, 
    fetchUserRecipes, 
    isLoadingUserRecipes 
  } = useSync();
  
  const [loading, setLoading] = useState<boolean>(true);

  const syncReceipts = useCallback(async () => {
    try {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      
      await fetchUserRecipes();
    } catch (error) {
      console.error("Error syncing receipts:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id, fetchUserRecipes]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      syncReceipts();
    }, [syncReceipts])
  );

  if (loading || isLoadingUserRecipes) {
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
          {userRecipes.length > 0 || pendingRecipes.length > 0 ? (
            <>
              {userRecipes.map((recipe) => (
                <RecipeItem
                  key={recipe._id}
                  recipe={recipe}
                  onPress={() => router.push(`/logged/receipt/${recipe._id}`)}
                />
              ))}

              {pendingRecipes.map((recipe, index) => (
                <RecipeItem
                  key={`stored-${index}`}
                  recipe={recipe}
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

const RecipeItem = ({
  recipe,
  onPress,
}: {
  recipe: RecipeDetail | CreateRecipeRequest;
  onPress: () => void;
}) => {
  return (
    <View style={styles.recipeItem}>
      <Image
        source={{
          uri:
            recipe.principalPictures.length > 0
              ? recipe.principalPictures[0].url
              : "https://via.placeholder.com/120x120.png?text=Sin+imagen",
        }}
        style={styles.recipeImage}
        resizeMode="cover"
      />

      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.recipeInfoRow}>
          <Chip
            style={[
              styles.chipBase,
              recipe.status === "creating"
                ? styles.chipCreating
                : recipe.status === "pending_to_approve"
                  ? styles.chipPending
                  : styles.chipApproved,
            ]}
            textStyle={[
              styles.chipTextBase,
              recipe.status === "creating"
                ? styles.chipTextCreating
                : recipe.status === "pending_to_approve"
                  ? styles.chipTextPending
                  : styles.chipTextApproved,
            ]}
          >
            {recipe.status === "creating"
              ? "Creando"
              : recipe.status === "pending_to_approve"
                ? "Pendiente"
                : recipe.status === "approved"
                  ? "Aprobada"
                  : recipe.status}
          </Chip>
          <TouchableOpacity onPress={onPress}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.orange.orange900}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  chipBase: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    marginTop: 15,
  },
  chipApproved: {
    backgroundColor: "#FFFFFF",
    borderColor: Colors.orange.orange900,
  },
  chipPending: {
    backgroundColor: Colors.gray.gray100,
    borderColor: Colors.gray.gray400,
  },
  chipCreating: {
    backgroundColor: Colors.orange.orange100,
    borderColor: Colors.orange.orange900,
  },
  chipTextCreating: {
    color: Colors.orange.orange900,
  },
  chipTextBase: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextApproved: {
    color: Colors.orange.orange900,
  },
  chipTextPending: {
    color: Colors.gray.gray600,
  },
});
