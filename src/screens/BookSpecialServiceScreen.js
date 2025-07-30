import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import PickerModal from "react-native-picker-modal-view";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Components
import showToast from "../components/CustomToast";
import CustomLoader from "../components/CustomLoader";
import HeaderComponent from "../components/HeaderComponent";
import ProcessingLoader from "../components/ProcessingLoader";
import BookServiceCheckBoxComponent from "../components/BookServiceCheckBoxComponent";

// Icons
import ic_location from "../assets/icons/ic_location.png";
import ic_address from "../assets/icons/ic_address.png";
import ic_city from "../assets/icons/ic_city.png";
import ic_calendar from "../assets/icons/ic_calendar.png";
import ic_clock from "../assets/icons/ic_clock.png";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class BookSpecialServiceScreen extends Component {
  constructor(props) {
    super(props);

    const {
      ls_selectYourCity,
      ls_selectDate,
      ls_selectTime,
    } = localizedStrings;

    this.state = {
      isLoading: true,
      showProcessingLoader: false,
      isDatePickerVisible: false,
      isTimePickerVisible: false,

      address: "",

      cities: null,
      selectedCity: {
        Id: -1,
        Name: ls_selectYourCity,
        Value: ls_selectYourCity,
      },

      selectedServiceDate: ls_selectDate,
      selectedServiceTime: ls_selectTime,

      specialRequest: "",
    };

    this.bookedServiceIds = new Set();
    this.coords = null;
  }

  componentDidMount() {
    this.fetchServices();
  }

  fetchServices = async () => {
    try {
      // fetching vehicleInfo
      const vehicleInfo = this.props.navigation.getParam("vehicleInfo", null);

      if (vehicleInfo) {
        const { vehicleId } = vehicleInfo;

        // preparing params
        const params = {
          vehicleId,
        };

        // calling api
        const response = await makeRequest("specialServiceType", params);

        // processing response
        if (response) {
          const { success } = response;

          if (success) {
            const serviceList = response.specialRequestList;
            this.serviceList = serviceList.map((item, index) => (
              <BookServiceCheckBoxComponent
                info={item}
                handleSelectService={this.handleSelectService}
                key={index}
              />
            ));

            // fetching cities
            await this.fetchCities();
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleSelectService = (isChecked, serviceId) => {
    if (isChecked) {
      this.bookedServiceIds.add(serviceId);
    } else {
      this.bookedServiceIds.delete(serviceId);
    }
  };

  fetchCities = async () => {
    try {
      // calling api
      const response = await makeRequest("city");

      // processing response
      if (response) {
        const { success } = response;

        if (success) {
          const { cityList } = response;

          const cities = cityList.map((item) => ({
            Id: item.id,
            Name: item.city,
            Value: item.city,
          }));

          this.setState({ cities, isLoading: false });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleSpecialRequestChange = (specialRequest) => {
    this.setState({ specialRequest });
  };

  handleAddressChange = (address) => {
    this.setState({ address });
  };

  setAddressCallback = (address, coords) => {
    this.coords = coords;
    this.setState({ address });
  };

  setLocationCallback = (address, coords) => {
    this.coords = coords;
    this.setState({ address });
  };

  handleCurrentLocation = () => {
    this.props.navigation.push("CurrentLocation", {
      setAddressCallback: this.setAddressCallback,
      setLocationCallback: this.setLocationCallback,
    });
  };

  renderSelectCityPicker = (disabled, selected, showModal) => {
    const { selectedCity } = this.state;
    const { Value } = selectedCity;
    const { ls_selectYourCity } = localizedStrings;

    const labelStyle = {
      flex: 1,
      fontSize: 14,
      color: "#000",
    };

    if (Value === ls_selectYourCity) {
      labelStyle.color = "#ccc";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={[styles.signUpInputContainer, { paddingBottom: 6 }]}>
          <Image source={ic_city} resizeMode="cover" style={styles.pinIcon} />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectCity = (selectedCity) => {
    this.setState({ selectedCity });
    return selectedCity;
  };

  handleSelectCityClose = () => {
    const { selectedCity } = this.state;
    this.setState({ selectedCity });
  };

  handleContinue = async () => {
    try {
      const {
        address,
        selectedCity,
        selectedServiceDate,
        selectedServiceTime,
        specialRequest,
      } = this.state;

      const {
        ls_pleaseSelectSomeServices,
        ls_selectYourCity,
        ls_selectDate,
        ls_selectTime,
        ls_pleaseEnterYourAddress,
        ls_pleaseSelectYourCity,
        ls_pleaseSelectServiceDate,
        ls_pleaseSelectServiceTime,
      } = localizedStrings;

      if (this.bookedServiceIds.size > 0) {
        if (this.coords) {
          if (selectedCity.Value !== ls_selectYourCity) {
            if (selectedServiceDate !== ls_selectDate) {
              if (selectedServiceTime !== ls_selectTime) {
                // starting loader
                this.setState({ showProcessingLoader: true });

                // fetching vehicleInfo and userInfo
                const vehicleInfo = this.props.navigation.getParam(
                  "vehicleInfo",
                  null
                );
                const userInfo = await getData(KEYS.USER_INFO);

                if (vehicleInfo && userInfo) {
                  const { userId } = userInfo;
                  const { vehicleId } = vehicleInfo;

                  // Converting Set to Array then, comma separated string
                  const bookedServiceIds = [...this.bookedServiceIds].join();

                  const { latitude, longitude } = this.coords;

                  // preparing params
                  const params = {
                    userId,
                    vehicleId,
                    serviceType: bookedServiceIds,
                    address,
                    lat: latitude,
                    long: longitude,
                    cityId: selectedCity.Id,
                    serviceDate: selectedServiceDate,
                    time: selectedServiceTime,
                    specialRequest: specialRequest.trim(),
                  };

                  // calling api
                  const response = await makeRequest(
                    "bookSpecialService",
                    params
                  );

                  // processing response
                  if (response) {
                    // stopping loader
                    this.setState({ showProcessingLoader: false });

                    const { success, message } = response;

                    if (success) {
                      const { servieInfo } = response;

                      // forwarding to Confirm Order
                      this.props.navigation.push("ConfirmOrder", {
                        serviceInfo: servieInfo,
                        isSpecialService: true,
                      });
                    } else {
                      Alert.alert("", message, [{ text: "OK" }], {
                        cancelable: false,
                      });
                    }
                  }
                }
              } else {
                Alert.alert("", ls_pleaseSelectServiceTime, [{ text: "OK" }], {
                  cancelable: false,
                });
              }
            } else {
              Alert.alert("", ls_pleaseSelectServiceDate, [{ text: "OK" }], {
                cancelable: false,
              });
            }
          } else {
            Alert.alert("", ls_pleaseSelectYourCity, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        } else {
          Alert.alert("", ls_pleaseEnterYourAddress, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      } else {
        Alert.alert("", ls_pleaseSelectSomeServices, [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleServiceDate = () => {
    this.setState({ isDatePickerVisible: true });
  };

  handleDatePickerConfirm = (dateObj) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const selectedServiceDate = dateObj.toLocaleDateString("en-US", options);
    this.setState({ selectedServiceDate, isDatePickerVisible: false });
  };

  handleDatePickerCancel = () => {
    this.setState({ isDatePickerVisible: false });
  };

  handleServiceTime = () => {
    this.setState({ isTimePickerVisible: true });
  };

  handleTimePickerConfirm = (dateObj) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    const selectedServiceTime = dateObj.toLocaleTimeString("en-US", options);
    this.setState({ selectedServiceTime, isTimePickerVisible: false });
  };

  handleTimePickerCancel = () => {
    this.setState({ isTimePickerVisible: false });
  };

  render() {
    const { isLoading } = this.state;
    if (isLoading) {
      return <CustomLoader />;
    }

    const {
      ls_bookSpecialService,
      ls_specialServices,
      ls_selectLocation,
      ls_address,
      ls_continue,
      ls_search,
      ls_selectDate,
      ls_selectTime,
      ls_specialRequests,
      ls_youWillBeContactedByManager,
    } = localizedStrings;

    const {
      address,
      cities,
      selectedCity,
      selectedServiceDate,
      selectedServiceTime,
      specialRequest,
      isDatePickerVisible,
      isTimePickerVisible,
      showProcessingLoader,
    } = this.state;

    // dynamic styles
    const serviceDateStyle = { ...styles.serviceDateTimeStyle };
    if (selectedServiceDate === ls_selectDate) {
      serviceDateStyle.color = "#ccc";
    }

    const serviceTimeStyle = { ...styles.serviceDateTimeStyle };
    if (selectedServiceTime === ls_selectTime) {
      serviceTimeStyle.color = "#ccc";
    }

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          title={ls_bookSpecialService}
          nav={this.props.navigation}
        />

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View>
              <Text style={styles.serviceHeading}>{ls_specialServices}</Text>

              {this.serviceList}
            </View>

            <TouchableHighlight
              underlayColor="transparent"
              onPress={this.handleCurrentLocation}
            >
              <View style={styles.location}>
                <View style={styles.locationIconBackground}>
                  <Image source={ic_location} style={styles.locationIcon} />
                </View>
                <Text style={styles.locationTitle}>{ls_selectLocation}</Text>
              </View>
            </TouchableHighlight>

            <View style={styles.formContainer}>
              <View style={styles.signUpInputContainer}>
                <Image
                  source={ic_address}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />
                <TextInput
                  style={styles.addressInputField}
                  placeholder={ls_address}
                  placeholderTextColor="#ccc"
                  multiline
                  value={address}
                  onChangeText={this.handleAddressChange}
                />
              </View>

              <PickerModal
                items={cities}
                selected={selectedCity}
                onSelected={this.handleSelectCity}
                onClosed={this.handleSelectCityClose}
                backButtonDisabled
                showToTopButton={true}
                showAlphabeticalIndex={true}
                autoGenerateAlphabeticalIndex={true}
                searchPlaceholderText={ls_search}
                renderSelectView={this.renderSelectCityPicker}
              />

              <TouchableHighlight
                underlayColor="transparent"
                onPress={this.handleServiceDate}
              >
                <View
                  style={[styles.signUpInputContainer, { paddingBottom: 6 }]}
                >
                  <Image
                    source={ic_calendar}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <Text style={serviceDateStyle}>{selectedServiceDate}</Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="transparent"
                onPress={this.handleServiceTime}
              >
                <View
                  style={[styles.signUpInputContainer, { paddingBottom: 6 }]}
                >
                  <Image
                    source={ic_clock}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <Text style={serviceTimeStyle}>{selectedServiceTime}</Text>
                </View>
              </TouchableHighlight>

              <View style={styles.textareaContainer}>
                <TextInput
                  style={styles.textareaInput}
                  placeholder={ls_specialRequests}
                  placeholderTextColor="#ccc"
                  multiline={true}
                  numberOfLines={8}
                  value={specialRequest}
                  onChangeText={this.handleSpecialRequestChange}
                />
              </View>

              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handleContinue}
                style={styles.signUpButton}
              >
                <Text style={styles.signUpButtonText}>{ls_continue}</Text>
              </TouchableHighlight>

              <Text style={styles.noteLabel}>
                {ls_youWillBeContactedByManager}
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <DateTimePickerModal
          mode="date"
          isVisible={isDatePickerVisible}
          onConfirm={this.handleDatePickerConfirm}
          onCancel={this.handleDatePickerCancel}
        />

        <DateTimePickerModal
          mode="time"
          isVisible={isTimePickerVisible}
          onConfirm={this.handleTimePickerConfirm}
          onCancel={this.handleTimePickerCancel}
        />

        {showProcessingLoader && <ProcessingLoader />}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    flex: 1,
    margin: 10,
  },
  serviceHeading: {
    color: "#3b3b3b",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  services: {
    flex: 1,
    color: "#595959",
    fontSize: 12,
  },
  location: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  locationIconBackground: {
    width: 24,
    height: 24,
    marginRight: 10,
    backgroundColor: "#27aa04",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  locationIcon: {
    width: 12,
    height: 12,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  signUpInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
  },
  pinIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  addressInputField: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    paddingBottom: 3,
  },
  serviceDateTimeStyle: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    marginLeft: 2,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textareaInput: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    height: 110,
    textAlignVertical: "top",
  },
  signUpButton: {
    marginTop: 30,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    paddingVertical: 9,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  noteLabel: {
    flex: 1,
    color: "#a8aaab",
    fontSize: 10,
    textAlign: "center",
    marginTop: 6,
    alignSelf: "center",
  },
});
