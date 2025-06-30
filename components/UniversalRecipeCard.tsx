import { Colors } from "@/constants/Colors";
import { getFirstImageUri } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Chip } from "react-native-paper";

interface UniversalRecipeCardProps {
  id?: string;
  name: string;
  description: string;
  principalPictures: Array<{ url: string; description: string }>;
  duration?: number | string;
  difficulty?: string;
  status?: string;
  onPress?: () => void;
  variant?: "normal" | "my-recipe";
}

const UniversalRecipeCard: React.FC<UniversalRecipeCardProps> = ({
  id,
  name,
  description,
  principalPictures,
  duration,
  difficulty,
  status,
  onPress,
  variant = "normal",
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Si es pending_to_approve, no permitir navegación
    if (status === "pending_to_approve") {
      return;
    }

    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/logged/receipt/${id}`);
    }
  };

  // Configuración de tamaños de imagen
  const getImageDimensions = () => {
    if (variant === "my-recipe") {
      return { width: 120, height: 120 };
    }
    return { width: 100, height: 100 };
  };

  const getVariantConfig = () => {
    if (variant === "my-recipe") {
      return {
        showTimeInfo: false,
        showArrow: !!status,
        showStatus: !!status,
        padding: 8,
      };
    }

    return {
      showTimeInfo: true,
      showArrow: true,
      showStatus: false,
      padding: 12,
    };
  };

  const config = getVariantConfig();
  const imageDimensions = getImageDimensions();

  const getStatusText = (status?: string) => {
    switch (status) {
      case "creating":
        return "Creando";
      case "pending_to_approve":
        return "Pendiente";
      case "approved":
        return "Aprobada";
      default:
        return status || "Sin estado";
    }
  };

  const getChipStyles = (status?: string) => {
    switch (status) {
      case "creating":
        return {
          chipStyle: styles.chipCreating,
          textStyle: styles.chipTextCreating,
        };
      case "pending_to_approve":
        return {
          chipStyle: styles.chipPending,
          textStyle: styles.chipTextPending,
        };
      case "approved":
        return {
          chipStyle: styles.chipApproved,
          textStyle: styles.chipTextApproved,
        };
      default:
        return {
          chipStyle: styles.chipApproved,
          textStyle: styles.chipTextApproved,
        };
    }
  };

  const chipStyles = getChipStyles(status);

  const renderTimeInfo = () => {
    if (!config.showTimeInfo) return null;

    if (duration && difficulty) {
      return (
        <View style={styles.recipeInfoRowItem}>
          <Ionicons
            name="time-outline"
            size={20}
            color={Colors.orange.orange900}
          />
          <Text style={styles.recipeMeta}>
            {String(duration)} min • {String(difficulty)}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderStatus = () => {
    if (!config.showStatus || !status) return null;

    return (
      <Chip
        style={[styles.chipBase, chipStyles.chipStyle]}
        textStyle={[styles.chipTextBase, chipStyles.textStyle]}
      >
        {getStatusText(status)}
      </Chip>
    );
  };

  // Renderizar flecha
  const renderArrow = () => {
    if (!config.showArrow) return null;

    // No mostrar flecha si está pendiente de aprobación
    if (status === "pending_to_approve") return null;

    const iconName =
      variant === "my-recipe" ? "chevron-forward" : "arrow-forward";

    return (
      <View style={styles.recipeInfoRowItem}>
        <TouchableOpacity onPress={handlePress}>
          <Ionicons name={iconName} size={20} color={Colors.orange.orange900} />
        </TouchableOpacity>
      </View>
    );
  };

  const containerStyle = styles.defaultContainer;
  const isPendingApproval = status === "pending_to_approve";

  const CardContainer = isPendingApproval ? View : TouchableOpacity;

  return (
    <CardContainer
      style={[
        containerStyle,
        {
          padding: config.padding,
        },
      ]}
      onPress={isPendingApproval ? undefined : handlePress}
    >
      <Image
        source={getFirstImageUri(principalPictures)}
        style={[styles.recipeImage, imageDimensions]}
        resizeMode="cover"
      />

      <View style={[styles.recipeInfo, { minHeight: imageDimensions.height }]}>
        <View style={styles.topContent}>
          <Text style={styles.recipeTitle}>{String(name || "")}</Text>
          <Text
            style={styles.recipeDescription}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {String(description || "")}
          </Text>
        </View>

        {(config.showTimeInfo || config.showStatus || config.showArrow) && (
          <View style={styles.recipeInfoRow}>
            <View style={styles.leftSection}>
              {renderTimeInfo()}
              {renderStatus()}
            </View>
            {renderArrow()}
          </View>
        )}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  recipeImage: {
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topContent: {
    gap: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.orange.orange700,
  },
  recipeDescription: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  recipeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    gap: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeInfoRowItem: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  recipeMeta: {
    fontSize: 12,
    color: Colors.text,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
  },

  chipBase: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
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

export default UniversalRecipeCard;
