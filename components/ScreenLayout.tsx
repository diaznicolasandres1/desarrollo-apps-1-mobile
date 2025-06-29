import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import Header, { AlternativeHeader } from "./Header";

const ScreenLayout = ({
  children,
  alternativeHeader,
}: {
  children: React.ReactNode;
  alternativeHeader?: {
    title?: string;
    actions?: React.ReactNode;
  };
}) => {
  return (
    <View style={styles.container}>
      {!alternativeHeader ? (
        <Header />
      ) : (
        <AlternativeHeader {...alternativeHeader} />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});

export default ScreenLayout;
