/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  AppState,
  FlatList,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';

// Components
import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';
import VehicleListComponent from '../components/VehicleListComponent';
import CustomLoader from '../components/CustomLoader';
import showToast from '../components/CustomToast';

// Icon
import ic_add from '../assets/icons/ic_add.png';

// User Preference
import {KEYS, getData} from '../api/UserPreference';

// API
import {makeRequest} from '../api/ApiInfo';

// Localization
import {localizedStrings} from '../localization/Locale';

// Delegates
import {
  isAppOpenedByRemoteNotificationWhenAppClosed,
  resetIsAppOpenedByRemoteNotificationWhenAppClosed,
} from '../firebase_api/FirebaseAPI';

// References
export let homeScreenFetchNotificationCount = null;

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      status: null,
      vehicles: null,

      notificationCount: 0,
      appState: AppState.currentState,
    };
  }

  componentDidMount() {
    // navigating to Notification screen
    if (isAppOpenedByRemoteNotificationWhenAppClosed) {
      resetIsAppOpenedByRemoteNotificationWhenAppClosed();
      this.props.navigation.navigate('Notification');
      return;
    }

    homeScreenFetchNotificationCount = this.fetchNotificationCount;
    AppState.addEventListener('change', this.handleAppStateChange);
    this.fetchVehicles();
  }

  componentWillUnmount() {
    homeScreenFetchNotificationCount = null;
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  fetchVehicles = async () => {
    try {
      // starting loader
      this.setState({isLoading: true});

      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        // preparing request params
        const params = {
          userId: userInfo.userId,
        };

        // calling api
        const response = await makeRequest('viewVehicle', params);

        // processing response
        if (response) {
          const {success} = response;

          if (success) {
            const {vehicleList} = response;
            this.setState({
              vehicles: vehicleList,
              status: null,
              // isLoading: false,
            });
          } else {
            const {message} = response;
            this.setState({
              status: message,
              vehicles: null,
              // isLoading: false,
            });
          }

          // fetching notification count
          await this.fetchNotificationCount();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  deleteVehicle = async vehicleId => {
    try {
      // preparing request params
      const params = {
        vehicleId: vehicleId,
      };

      // calling api
      const response = await makeRequest('deleteVehicle', params);

      // processing response
      const {success, message} = response;

      if (success) {
        // refreshing list
        await this.fetchVehicles();

        // Success Toast
        showToast(message);
      } else {
        this.setState({status: message, vehicles: null, isLoading: false});
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchNotificationCount = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const {userId} = userInfo;

        // preparing params
        const params = {
          userId,
        };

        // calling api
        const response = await makeRequest('getNotificationCount', params);

        // processing response
        if (response) {
          const {success} = response;

          if (success) {
            const {notificationCount} = response;
            this.setState({notificationCount, isLoading: false});
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleAppStateChange = async nextAppState => {
    try {
      const {appState} = this.state;
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        await this.fetchNotificationCount();
      }

      this.setState({appState: nextAppState});
    } catch (error) {
      console.log(error.message);
    }
  };

  renderItem = ({item}) => (
    <VehicleListComponent
      item={item}
      refreshCallback={this.fetchVehicles}
      deleteVehicleCallback={this.deleteVehicle}
      nav={this.props.navigation}
    />
  );

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  handleAddVehicle = () => {
    this.props.navigation.push('AddVehicle', {
      refreshCallback: this.fetchVehicles,
    });
  };

  render() {
    if (this.state.isLoading) {
      return <CustomLoader />;
    }

    const {status, vehicles, notificationCount} = this.state;

    const {ls_home} = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          title={ls_home}
          navObj={this.props.navigation}
          showNotificationIcon
          notificationCount={notificationCount}
        />

        {status ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{status}</Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ItemSeparatorComponent={this.itemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        )}

        <TouchableHighlight
          underlayColor="transparent"
          onPress={this.handleAddVehicle}
          style={styles.addVehicle}>
          <Image source={ic_add} resizeMode="cover" style={styles.addIcon} />
        </TouchableHighlight>

        <FooterComponent nav={this.props.navigation} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff1',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#000',
    fontSize: 16,
  },
  listContentContainer: {
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  separator: {
    height: 8,
  },
  addVehicle: {
    width: 60,
    height: 60,
    backgroundColor: '#27aa04',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(39, 170, 4, 0.5)',
    position: 'absolute',
    left: 10,
    bottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 36,
    height: 36,
  },
});
