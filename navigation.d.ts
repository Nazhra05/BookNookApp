import { NavigatorScreenParams } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Login: undefined;
      Signup: undefined;
      PendingVerification: undefined;
      TabNavigator: NavigatorScreenParams<TabParamList>;
      // Add other routes here
    }
  }

  type TabParamList = {
    Home: undefined;
    History: undefined;
    Barcode: undefined;
    Profile: undefined;
  };
}
