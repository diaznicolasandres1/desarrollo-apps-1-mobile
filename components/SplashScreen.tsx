import { Colors } from "@/constants/Colors";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.icon} />
      <Text style={styles.text}>¡Bienvenido!</Text>
      <ActivityIndicator size="large" color="black" style={styles.loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  text: {
    fontSize: 30,
    marginBottom: 40,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
});

export default SplashScreen;
