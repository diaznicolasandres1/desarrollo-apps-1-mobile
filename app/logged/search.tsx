import ScreenLayout from "@/components/ScreenLayout";
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

const Search = () => {
  return (
    <ScreenLayout alternativeHeader={{ title: "Buscá tus recetas" }}>
      <View>
        <Text>Search</Text>
      </View>
    </ScreenLayout>
  );
};

export default Search;
