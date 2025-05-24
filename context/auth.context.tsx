import SplashScreen from "@/components/SplashScreen";
import { useStorage } from "@/hooks/useLocalStorage";
import { login } from "@/resources/login";
import { changePassword, recoveryPassword } from "@/resources/restore-password";
import { User } from "@/types/User";
import { SplashScreen as ExpoSplashScreen, useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";

ExpoSplashScreen.hideAsync();

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  onRecoveryCode: (email: string) => Promise<boolean>;
  onNewPassword: (password: string) => Promise<boolean>;
  onValidateCode: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{
    recoveryCode: string;
    email: string;
  } | null>(null);

  const { setItem, getItem, removeItem } = useStorage<User>();

  const onRecoveryCode = async (email: string) => {
    const response = await recoveryPassword(email);

    if (response.success) {
      console.log(response.recoveryCodeData!.recoveryCode);
      setRecoveryData({
        recoveryCode: response.recoveryCodeData!.recoveryCode,
        email: email,
      });
      Toast.show({
        type: "success",
        text1: "Código enviado",
        text2: response.recoveryCodeData!.message,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error al recuperar contraseña",
        text2: response.error?.message,
      });
    }

    return response.success;
  };

  const onlogin = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await login(email, password);
    if (response.success && response.user) {
      setIsAuthenticated(true);
      Toast.show({
        type: "success",
        text1: "Bienvenido 👋",
      });
      setItem("user", response.user);
      setUser(response.user);
      router.push("/(tabs)");
    } else {
      setIsAuthenticated(false);
      Toast.show({
        type: "error",
        text1: "Error al iniciar sesión",
        text2: response.error,
      });
    }
    setIsLoading(false);
    setRecoveryData(null);

  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    removeItem("user");
    setRecoveryData(null);
    router.push("/(unauth)");
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setIsAuthenticated(true);
    setRecoveryData(null);
    Toast.show({
      type: "success",
      text1: "Bienvenido 👋",
      text2: "Estás ingresando como invitado",
    });
    router.push("/(tabs)");
  };

  const onNewPassword = async (password: string): Promise<boolean> => {
    if (!recoveryData) {
      return false;
    }

    console.log({
      email: recoveryData.email,
      password,
      recoveryCode: recoveryData.recoveryCode,
    });

    const response = await changePassword(
      recoveryData.email,
      password,
      recoveryData.recoveryCode,
    );
    if (response.success) {
      Toast.show({
        type: "success",
        text1: "Contraseña cambiada",
      });
      setRecoveryData(null);
      return true;
    } else {
      Toast.show({
        type: "error",
        text1: "Error al cambiar contraseña",
        text2: response.error?.message,
      });
      return false;
    }
  };

  const onValidateCode = (code: string) => {
    if (!recoveryData) return false;
    const isCodeValid = code === recoveryData.recoveryCode;

    if (isCodeValid) {
      Toast.show({
        type: "success",
        text1: "Código verificado",
        text2: "El código ingresado es correcto",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Código incorrecto",
        text2: "El código ingresado es incorrecto",
      });
    }

    return isCodeValid;
  };

  const prepare = async () => {
    const user = await getItem("user");
    if (user) {
      setIsAuthenticated(true);
      setUser(user);
    }

    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  };

  useEffect(() => {
    prepare();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        isGuest,
        login: onlogin,
        loginAsGuest,
        logout,
        onNewPassword,
        onRecoveryCode,
        onValidateCode,
      }}
    >
      {isReady ? children : <SplashScreen />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
