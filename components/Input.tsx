import { StyleSheet, View } from "react-native";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";

const INPUT_WIDTH = "80%";

export const SimpleInput = ({
  errorMessage,
  isError,
  helperText,
  style,
  ...props
}: TextInputProps & {
  errorMessage?: string;
  isError?: boolean;
  helperText?: string;
}) => {
  return (
    <View style={styles.container}>
      <TextInput {...props} style={[styles.input, style]} error={isError} />

      {isError && !!errorMessage && (
        <HelperText type="error" visible={true}>
          {errorMessage}
        </HelperText>
      )}

      {!isError && !!helperText && (
        <HelperText type="info" visible={true}>
          {helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: INPUT_WIDTH,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  input: {
    width: "100%",
  },
});
