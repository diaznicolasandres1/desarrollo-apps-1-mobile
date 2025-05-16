import { Colors } from "@/constants/Colors";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.azul.azul600,
        backgroundColor: Colors.azul.azul100,
        borderRadius: 10,
        marginBottom: 20,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: Colors.red.red600,
        backgroundColor: Colors.red.red100,
        borderRadius: 10,
        marginBottom: 20,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
};
