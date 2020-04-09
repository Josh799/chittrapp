import 'react-native-gesture-handler';
import {createAppContainer} from 'react-navigation';
import {Drawer} from './navigators'

const AppContainer = createAppContainer(Drawer)

export default AppContainer;