/*
	Apps navigation structure
*/

import React from 'react';
import {Icon} from 'react-native-elements';

import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Profile from './Profile';
import EditProfile from './EditProfile';
import EditPhoto from './EditPhoto';
import Login from './Login';
import SignUp from './SignUp';
import HomeScreen from './HomeScreen';
import Search from './Search';
import PostChit from './PostChit';
import OtherProfile from './OtherProfile';
import Followers from './Followers';
import Following from './Following';

export const MainStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
});

export const OtherUserStack = createStackNavigator({
  Search: {
    screen: Search,
  },
  OtherProfile: {
    screen: OtherProfile,
  },
  Followers: {
    screen: Followers,
  },
  Following: {
    screen: Following,
  },
});

export const PostChitStack = createStackNavigator({
  Create: {
    screen: PostChit,
    navigationOptions: {
      headerShown: false,
    },
  },
  Photo: {
    screen: capturePhoto,
  },
});

export const Tabs = createBottomTabNavigator({
  Home: {
    screen: MainStack,
    navigationOptions: {
      tabBarIcon: () => <Icon name="home" />,
    },
  },
  Create: {
    screen: PostChitStack,
    navigationOptions: {
      tabBarIcon: () => <Icon name="add" />,
    },
  },
  Search: {
    screen: OtherUserStack,
    navigationOptions: {
      tabBarIcon: () => <Icon name="search" />,
    },
  },
});

export const UserStack = createStackNavigator({
  Profile: {
    screen: Profile,
  },
  EditProfile: {
    screen: EditProfile,
  },
  EditPhoto: {
    screen: EditPhoto,
  },
});

export const LoginStack = createStackNavigator({
  Login: {
    screen: Login,
  },
  SignUp: {
    screen: SignUp,
  },
});

export const Drawer = createDrawerNavigator({
  Home: {screen: Tabs},
  Login: {screen: LoginStack},
  Profile: {screen: UserStack},
});
