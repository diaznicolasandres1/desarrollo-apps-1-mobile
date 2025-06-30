import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { addToFavorites, removeFromFavorites } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

interface FavoriteButtonProps {
  id: string;
}

const FavoriteButton = ({ id }: FavoriteButtonProps) => {
  const {
    user,
    addToFavorites: ctxAddToFavorites,
    removeFromFavorites: ctxRemoveFromFavorites,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(false);

  // Inicializar el estado local basado en el usuario
  useEffect(() => {
    setLocalIsFavorite(user?.favedRecipesIds?.includes(id) || false);
  }, [user?.favedRecipesIds, id]);

  const isFavorite = localIsFavorite;

  const handleAddToFavorites = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes estar logueado para agregar a favoritos",
      });
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (isFavorite) {
        success = await removeFromFavorites(user._id, id);

        if (success) {
          setLocalIsFavorite(false);
          Toast.show({
            type: "success",
            text1: "Éxito",
            text2: "Receta eliminada de favoritos",
          });
          ctxRemoveFromFavorites(id);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo eliminar de favoritos",
          });
        }
      } else {
        success = await addToFavorites(user._id, id);

        if (success) {
          setLocalIsFavorite(true);
          Toast.show({
            type: "success",
            text1: "Éxito",
            text2: "Receta agregada a favoritos",
          });
          ctxAddToFavorites(id);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo agregar a favoritos",
          });
        }
      }
    } catch (error) {
      console.error("Error al manejar favoritos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ocurrió un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleAddToFavorites} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.gray.gray600} />
      ) : (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={25}
          color={isFavorite ? Colors.red.red600 : Colors.gray.gray600}
        />
      )}
    </TouchableOpacity>
  );
};

export default FavoriteButton;
