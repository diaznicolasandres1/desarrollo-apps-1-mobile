import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "green",
        backgroundColor: "#e0ffe0",
        borderRadius: 10,
        marginBottom: 20,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "400",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: "#ffe0e0",
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
