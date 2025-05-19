import ScreenLayout from "@/components/ScreenLayout";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const ReceiptPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout>
      <View>
        <Text>Recibo ID: {id}</Text>
      </View>
    </ScreenLayout>
  );
};

export default ReceiptPage;
