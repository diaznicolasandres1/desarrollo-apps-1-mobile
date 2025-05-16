import { useStorage } from "@/hooks/useLocalStorage";
import { login } from "@/resources/login";
import { User } from "@/types/User";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setItem, getItem, removeItem } = useStorage();

  const onlogin = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await login(email, password);
    if (response.success) {
      setIsAuthenticated(true);
      Toast.show({
        type: "success",
        text1: "Bienvenido 👋",
      });
      setItem("user", response.user);
      setUser(response.user);
    } else {
      setIsAuthenticated(false);
      Toast.show({
        type: "error",
        text1: "Error al iniciar sesión",
        text2: response.error?.message,
      });
    }
    setIsLoading(false);
  };
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    removeItem("user");
  };

  useEffect(() => {
    getItem("user").then((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login: onlogin, logout, isLoading }}
    >
      {children}
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
