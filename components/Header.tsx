import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Header = () => {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="person-circle-outline" size={25} />
        </TouchableOpacity>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => router.push("/logged/search")}>
            <Ionicons name="search-outline" size={25} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="settings-outline" size={25} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerText}>Recetas</Text>
    </View>
  );
};

export const AlternativeHeader = ({
  title = "Recetas",
}: {
  title?: string;
}) => {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={25} />
        </TouchableOpacity>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => router.push("/logged/create")}>
            <Ionicons name="add-circle-outline" size={25} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.alternativeHeaderText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: "10%",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconGroup: {
    flexDirection: "row",
    gap: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.orange.orange900,
    marginTop: 16,
  },
  alternativeHeaderText: {
    fontSize: 35,
    fontWeight: "bold",
    color: Colors.orange.orange900,
    marginTop: 16,
  },
});

export default Header;
