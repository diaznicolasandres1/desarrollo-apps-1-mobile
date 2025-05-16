import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

type NetworkStatus = {
  isConnected: boolean;
  isWifi: boolean;
  isCellular: boolean;
};

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: !!state.isConnected,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
};
