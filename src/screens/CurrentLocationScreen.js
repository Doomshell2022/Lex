import React, { Component } from "react";
import {
  Text,
  View,
  Alert,
  FlatList,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import Permissions from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";

// Components
import HeaderComponent from "../components/HeaderComponent";

// API
import { makeRequestWithoutBaseURL, makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class CurrentLocationScreen extends Component {
  constructor(props) {
    super(props);

    const {
      ls_fetchingSavedAddress,
      ls_fetchingCurrentLocation,
    } = localizedStrings;

    this.state = {
      isLoadingAddress: true,
      addressList: null,
      addressStatus: ls_fetchingSavedAddress,

      isLoading: true,
      locationData: null,
      status: ls_fetchingCurrentLocation,
    };

    this.setLocationCallback = this.props.navigation.getParam(
      "setLocationCallback",
      null
    );

    this.setAddressCallback = this.props.navigation.getParam(
      "setAddressCallback",
      null
    );
  }

  componentDidMount() {
    this.fetchCurrentPosition();

    this.fetchSavedAddresses();
  }

  fetchSavedAddresses = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        // preparing params
        const { userId } = userInfo;
        const params = {
          userId,
        };

        // calling api
        const response = await makeRequest("getAddress", params);

        // parsing response
        if (response) {
          const { success } = response;

          if (success) {
            const { address } = response;

            this.setState({
              addressList: address,
              addressStatus: null,
              isLoadingAddress: false,
            });
          } else {
            const { message } = response;

            this.setState({
              addressStatus: message,
              addressList: null,
              isLoadingAddress: false,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchCurrentPosition = async () => {
    try {
      // checking location permission
      const locationPermission = await this.requestPermission();

      if (locationPermission === "authorized") {
        const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          showLocationDialog: true,
          forceRequestLocation: true,
        };

        Geolocation.getCurrentPosition(
          this.geolocationSuccessCallback,
          this.geolocationErrorCallback,
          options
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  geolocationSuccessCallback = async (position) => {
    try {
      const API_KEY = "AIzaSyBb3j8Aiv60CadZ_wJS_5wg2KBO6081a_k";
      this.coords = position.coords;
      const { latitude, longitude } = this.coords;

      const response = await makeRequestWithoutBaseURL(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );

      const { status } = response;

      if (status === "OK") {
        const { results } = response;

        // filtering addresses result(taking first address only)
        const filteredResult = [results[0]];

        this.setState({
          locationData: filteredResult,
          status: null,
          isLoading: false,
        });
      } else {
        const { error_message } = response;
        this.setState({
          status: error_message,
          locationData: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  geolocationErrorCallback = (error) => {
    this.props.navigation.pop();

    if (
      error.code === 2 &&
      error.message === "No location provider available."
    ) {
      Alert.alert(
        "",
        "Make sure your device's Location/GPS is ON",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } else {
      console.log(error.code, error.message);

      Alert.alert(
        "Error",
        "Something went wrong...\nMake sure your device's Location/GPS is ON",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  requestPermission = async () => {
    try {
      // Request permission to access location
      const response = await Permissions.request("location");
      return response;
    } catch (error) {
      console.log(error.message);
    }
  };

  handleSelectLocation = (address) => {
    if (this.setLocationCallback && this.coords) {
      return () => {
        this.props.navigation.pop();
        this.setLocationCallback(address, this.coords);
      };
    }

    return null;
  };

  handleSelectAddress = (address, coords) => {
    if (this.setAddressCallback) {
      return () => {
        this.props.navigation.pop();
        this.setAddressCallback(address, coords);
      };
    }

    return null;
  };

  renderItem = ({ item }) => (
    <TouchableHighlight
      style={styles.addressContainer}
      underlayColor="transparent"
      onPress={this.handleSelectLocation(item.formatted_address)}
    >
      <Text style={styles.address}>{item.formatted_address}</Text>
    </TouchableHighlight>
  );

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  addressRenderItem = ({ item }) => {
    const { address, latitude, longitude } = item;
    const coords = { latitude, longitude };

    return (
      <TouchableHighlight
        style={styles.addressContainer}
        underlayColor="transparent"
        onPress={this.handleSelectAddress(address, coords)}
      >
        <Text style={styles.address}>{address}</Text>
      </TouchableHighlight>
    );
  };

  addressKeyExtractor = (item, index) => index.toString();

  render() {
    const { addressStatus, addressList, status, locationData } = this.state;

    const {
      ls_selectLocation,
      ls_currentLocation,
      ls_savedAddress,
    } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          title={ls_selectLocation}
          nav={this.props.navigation}
        />

        <View style={styles.locationContainer}>
          <Text style={styles.title}>{ls_currentLocation}</Text>

          {status ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{status}</Text>
            </View>
          ) : (
            <FlatList
              data={locationData}
              renderItem={this.renderItem}
              keyExtractor={this.keyExtractor}
              ItemSeparatorComponent={this.itemSeparator}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContentContainer}
            />
          )}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.addressListContainer}>
          <Text style={styles.title}>{ls_savedAddress}</Text>

          {addressStatus ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{addressStatus}</Text>
            </View>
          ) : (
            <FlatList
              data={addressList}
              renderItem={this.addressRenderItem}
              keyExtractor={this.addressKeyExtractor}
              ItemSeparatorComponent={this.itemSeparator}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContentContainer}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efeff1",
  },
  locationContainer: {
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    backgroundColor: "#8b8b8b",
  },
  addressListContainer: {
    flex: 5,
  },
  addressContainer: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 2,
    padding: 8,
    justifyContent: "center",
  },
  address: {
    color: "#000",
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  listContentContainer: {
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#949494",
    fontSize: 14,
  },
  title: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    marginTop: 4,
  },
});
