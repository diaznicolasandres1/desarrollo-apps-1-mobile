import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { ButtonProps, Button as PaperButton } from "react-native-paper";

export const PrimaryButton = ({ ...props }: ButtonProps) => {
  return <PaperButton mode="contained" style={styles.primary} {...props} />;
};

export const SecondaryButton = ({ ...props }: ButtonProps) => {
  return (
    <PaperButton
      mode="text"
      textColor={Colors.olive.olive900}
      labelStyle={styles.secondaryLabel}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.orange.orange900,
  },
  secondaryLabel: {
    textDecorationLine: "underline",
    textDecorationColor: Colors.olive.olive900,
    textDecorationStyle: "solid",
  },
});
