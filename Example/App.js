import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useScreens } from 'react-native-screens';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
  createAppContainer,
  NavigationActions,
} from 'react-navigation';

useScreens();

class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Sign in!" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Dashboard',
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Show me more of the app" onPress={this._showMoreApp} />
        <Button title="Actually, sign me out :)" onPress={this._signOutAsync} />

        <Button
          title="open"
          onPress={() => {
            this.props.navigation.openDrawer();
          }}
        />
      </View>
    );
  }

  _showMoreApp = () => {
    this.props.navigation.navigate('Other');
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}

class OtherScreen extends React.Component {
  static navigationOptions = {
    title: 'StockKeep',
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>STOCK KEEP</Text>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />

        <Button
          title="open"
          onPress={() => {
            this.props.navigation.openDrawer();
          }}
        />

        <StatusBar barStyle="default" />
      </View>
    );
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}

const delay = ms => new Promise(res => setTimeout(res, ms));

class AuthLoadingScreen extends React.Component {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    await delay(1000);

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const AppStack = createStackNavigator({
  Home: HomeScreen,
  Other: OtherScreen,
});
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

class ListScreen extends React.Component {
  render() {
    const parent = this.props.navigation.dangerouslyGetParent();
    const { index } = parent.state;

    console.log(parent);
    return (
      <View style={styles.container}>
        <Text>list screen stack {index}</Text>
        <Button
          title="more"
          onPress={() => {
            this.props.navigation.push('list');
          }}
        />
        <Button
          title="back"
          onPress={() => {
            this.props.navigation.dismiss();
            // console.log(parent.state.key);

            // this.props.navigation.dispatch(
            //   NavigationActions.back({ key: parent.state.key })
            // );
          }}
        />
        <Button
          title="pop"
          onPress={() => {
            this.props.navigation.popToTop();
          }}
        />
        <Text>{JSON.stringify(this.props, null, 2)}</Text>
      </View>
    );
  }
}

const CustomBack = props => {
  console.log(props);

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(props);

        if (props.scene.index === 0) {
          props.scene.descriptor.navigation.dismiss();
        } else {
          props.scene.descriptor.navigation.goBack();
        }
      }}>
      <Text>back back</Text>
    </TouchableOpacity>
  );
};

const MeasureStack = createStackNavigator({
  list: {
    screen: ListScreen,
    title: 'measure select',
    navigationOptions: {
      headerLeft: props => <CustomBack {...props} />,
    },
  },
});

class HomeScreenTAB extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home!</Text>

        <Button
          title="measure selection"
          onPress={() => {
            this.props.navigation.push('measure');
          }}
        />

        <Button
          title="open"
          onPress={() => {
            this.props.navigation.toggleDrawer();
          }}
        />
      </View>
    );
  }
}

class SettingsScreenTAB extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Settings!</Text>
        <Button
          title="open"
          onPress={() => {
            this.props.navigation.toggleDrawer();
          }}
        />
      </View>
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Home: HomeScreenTAB,
  Settings: SettingsScreenTAB,
});

const dashboardStack = createStackNavigator(
  {
    tabs: TabNavigator,
    measure: MeasureStack,
  },
  {
    initialRouteName: 'tabs',
    headerMode: 'none',
  }
);

const MyDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: dashboardStack,
  },
  Notifications: {
    screen: OtherScreen,
  },
});

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: MyDrawerNavigator,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
);

export default class App extends React.Component {
  someEvent() {
    // call navigate for AppNavigator here:
    this.navigator &&
      this.navigator.dispatch(
        NavigationActions.navigate({ routeName: someRouteName })
      );
  }
  render() {
    return (
      <AppContainer
        onNavigationStateChange={(prevState, newState, action) => {
          // console.log({ prevState, newState, action });
        }}
        ref={nav => {
          this.navigator = nav;
        }}
      />
    );
  }
}
