import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';

// Screens
import SplashScreen from './src/screens/SplashScreen';

// User Preference
import {KEYS, getData} from './src/api/UserPreference';

// Firebase API
import {
  createOnTokenRefreshListener,
  removeOnTokenRefreshListener,
  createNotificationListeners,
  removeNotificationListeners,
} from './src/firebase_api/FirebaseAPI';

// Routes
import {createRootNavigator} from './src/routes/Routes';
import {nsSetTopLevelNavigator} from './src/routes/NavigationService';

// Localization
import {localizedStrings} from './src/localization/Locale';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isLoggedIn: false,
    };

    // setting locale: 'es-HN'(Spanish-Honduras)
    localizedStrings.setLanguage('es-IN');
    // localizedStrings.setLanguage('es-HN');
  }

  componentDidMount() {
    try {
      setTimeout(this.initialSetup, 2000);

      // // Adding firebase listeners
      createOnTokenRefreshListener(this);
      createNotificationListeners(this);
    } catch (error) {
      console.log(error.message);
    }
  }

  componentWillUnmount() {
    // Removing firebase listeners
    removeOnTokenRefreshListener(this);
    removeNotificationListeners(this);
  }

  initialSetup = async () => {
    try {
      // Fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);
      const isLoggedIn = userInfo ? true : false;

      this.setState({isLoggedIn, isLoading: false});
    } catch (error) {
      console.log(error.message);
    }
  };

  setNavigatorRef = ref => {
    nsSetTopLevelNavigator(ref);
  };

  render() {
    const {isLoading} = this.state;
    if (isLoading) {
      return <SplashScreen />;
    }

    const {isLoggedIn} = this.state;
    const RootNavigator = createRootNavigator(isLoggedIn);
    const AppContainer = createAppContainer(RootNavigator);
    return <AppContainer ref={this.setNavigatorRef} />;
  }
}
