import { createSwitchNavigator,createAppContainer } from 'react-navigation';
import { AuthStack, 
    RightRiderRootNavigator, 
    LeftRiderRootNavigator, 
    RightDriverRootNavigator, 
    LeftDriverRootNavigator} from './MainNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

const AppNavigator= createSwitchNavigator({
        AuthLoading: AuthLoadingScreen,
        Auth: AuthStack,
        RightRiderRoot: RightRiderRootNavigator,
        LeftRiderRoot: LeftRiderRootNavigator,
        RightDriverRoot: RightDriverRootNavigator,
        LeftDriverRoot: LeftDriverRootNavigator
        },
        {
            initialRouteName: 'AuthLoading'
        }
    );
const AppContainer = createAppContainer(AppNavigator);
export default AppContainer;
  