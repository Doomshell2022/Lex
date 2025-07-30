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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Components
import CustomLoader from "../components/CustomLoader";
import FetchingLoader from "../components/FetchingLoader";
import ProcessingLoader from "../components/ProcessingLoader";
import HeaderComponent from "../components/HeaderComponent";
import BookServiceCheckBoxComponent from "../components/BookServiceCheckBoxComponent";

// Icons
import ic_location from "../assets/icons/ic_location.png";
import ic_address from "../assets/icons/ic_address.png";
import ic_city from "../assets/icons/ic_city.png";
import ic_slot from "../assets/icons/ic_slot.png";
import ic_vehicle_year from "../assets/icons/ic_vehicle_year.png";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class BookServiceScreen extends Component {
  constructor(props) {
    super(props);

    const {
      ls_selectYourCity,
      ls_selectDate,
      ls_selectSlot,
    } = localizedStrings;

    this.state = {
      isLoading: true,
      showProcessingLoader: false,
      showFetchingLoader: false,

      address: "",

      cities: null,
      selectedCity: {
        Id: -1,
        Name: ls_selectYourCity,
        Value: ls_selectYourCity,
      },

      bookingDates: null,
      selectedBookingDate: {
        Id: -1,
        Name: ls_selectDate,
        Value: ls_selectDate,
      },

      slots: null,
      selectedSlot: {
        Id: -1,
        Name: ls_selectSlot,
        Value: ls_selectSlot,
      },

      specialRequest: "",
    };

    this.bookedServiceIds = new Set();
    this.coords = null;
  }

  componentDidMount() {
    this.fetchServices();
  }

  handleSelectService = (isChecked, serviceId) => {
    if (isChecked) {
      this.bookedServiceIds.add(serviceId);
    } else {
      this.bookedServiceIds.delete(serviceId);
    }
  };

  fetchServices = async () => {
    try {
      // fetching vehicleInfo
      const vehicleInfo = this.props.navigation.getParam("vehicleInfo", null);

      if (vehicleInfo) {
        // preparing params
        const { vehicleId } = vehicleInfo;
        const params = {
          vehicleId: vehicleId,
        };

        // calling api
        const response = await makeRequest("serviceType", params);

        // processing response
        const { success } = response;

        if (success) {
          const serviceList = response.serviceTypelist;
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
    } catch (error) {
      console.log(error.message);
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

          this.setState({ cities });

          // fetching booking dates
          await this.fetchBookingDates();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchBookingDates = async () => {
    try {
      // calling api
      const response = await makeRequest("getBookingDate");

      // processing response
      if (response) {
        const { success, message } = response;

        if (success) {
          const { dates } = response;
          const bookingDates = dates.map((item, index) => ({
            Id: index,
            Name: item,
            Value: item,
          }));

          this.setState({ bookingDates, isLoading: false });
        } else {
          Alert.alert("", message, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleAddressChange = (changedText) => {
    this.setState({ address: changedText });
  };

  handleContinue = async () => {
    try {
      const {
        address,
        selectedCity,
        selectedBookingDate,
        selectedSlot,
        specialRequest,
      } = this.state;

      const {
        ls_pleaseSelectSomeServices,
        ls_pleaseEnterYourAddress,
        ls_pleaseSelectYourCity,
        ls_pleaseSelectServiceDate,
        ls_pleaseSelectServiceSlot,
        ls_selectYourCity,
        ls_selectDate,
        ls_selectSlot,
      } = localizedStrings;

      if (this.bookedServiceIds.size > 0) {
        if (this.coords) {
          if (selectedCity.Value !== ls_selectYourCity) {
            if (selectedBookingDate.Value !== ls_selectDate) {
              if (selectedSlot.Value !== ls_selectSlot) {
                // starting processing loader
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

                  // Preparing selected date
                  const serviceDate = selectedBookingDate.Value.replace(
                    "Hoy(",
                    ""
                  ).replace(")", "");

                  const { latitude, longitude } = this.coords;

                  // preparing params
                  const params = {
                    userId: userId,
                    vehicleId: vehicleId,
                    serviceType: bookedServiceIds,
                    address,
                    lat: latitude,
                    long: longitude,
                    cityId: selectedCity.Id,
                    serviceDate: serviceDate,
                    slotId: selectedSlot.Id,
                    specialRequest: specialRequest.trim(),
                  };

                  // calling api
                  const response = await makeRequest("bookService", params);

                  // stopping processing loader
                  this.setState({ showProcessingLoader: false });

                  // processing response
                  const { success, message } = response;

                  if (success) {
                    const { servieInfo } = response;

                    // forwarding to Confirm Order
                    this.props.navigation.push("ConfirmOrder", {
                      serviceInfo: servieInfo,
                      isSpecialService: false,
                    });
                  } else {
                    Alert.alert("", message, [{ text: "OK" }], {
                      cancelable: false,
                    });
                  }
                }
              } else {
                Alert.alert("", ls_pleaseSelectServiceSlot, [{ text: "OK" }], {
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
      fontSize: 16,
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

  renderSelectBookingDatePicker = (disabled, selected, showModal) => {
    const { selectedBookingDate } = this.state;
    const { Value } = selectedBookingDate;
    const { ls_selectDate } = localizedStrings;

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#000",
    };

    if (Value === ls_selectDate) {
      labelStyle.color = "#ccc";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={[styles.signUpInputContainer, { paddingBottom: 6 }]}>
          <Image
            source={ic_vehicle_year}
            resizeMode="cover"
            style={styles.pinIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectBookingDate = async (selectedBookingDate) => {
    try {
      if (selectedBookingDate.Value) {
        // starting fetching loader
        this.setState({ showFetchingLoader: true });

        const selectedDate = selectedBookingDate.Value.replace(
          "Hoy(",
          ""
        ).replace(")", "");

        // calling api
        const response = await makeRequest("slots", { date: selectedDate });

        // processing response
        if (response) {
          const { success, message } = response;

          // stopping fetching loader
          this.setState({ showFetchingLoader: false });

          if (success) {
            const { slotList } = response;

            const slots = slotList.map((item) => {
              const { id, minTime, maxTime } = item;
              const label = minTime + " to " + maxTime;
              const slot = {
                Id: id,
                Name: label,
                Value: label,
              };

              return slot;
            });

            this.setState({ slots });
          } else {
            this.setState({ slots: [] });
            Alert.alert("", message, [{ text: "OK" }], { cancelable: false });
          }
        }

        const { ls_selectSlot } = localizedStrings;

        this.setState({
          // set
          selectedBookingDate,

          // reset
          selectedSlot: {
            Id: -1,
            Name: ls_selectSlot,
            Value: ls_selectSlot,
          },
        });

        return selectedBookingDate;
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleSelectBookingDateClose = () => {
    const { selectedBookingDate } = this.state;
    this.setState({ selectedBookingDate });
  };

  renderSelectSlotPicker = (disabled, selected, showModal) => {
    const { selectedSlot } = this.state;
    const { Value } = selectedSlot;
    const { ls_selectSlot } = localizedStrings;

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#000",
    };

    if (Value === ls_selectSlot) {
      labelStyle.color = "#ccc";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={[styles.signUpInputContainer, { paddingBottom: 6 }]}>
          <Image source={ic_slot} resizeMode="cover" style={styles.pinIcon} />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectSlot = (selectedSlot) => {
    this.setState({ selectedSlot });
    return selectedSlot;
  };

  handleSelectSlotClose = () => {
    const { selectedSlot } = this.state;
    this.setState({ selectedSlot });
  };

  handleSpecialRequestChange = (specialRequest) => {
    this.setState({ specialRequest });
  };

  render() {
    if (this.state.isLoading) {
      return <CustomLoader />;
    }

    const {
      ls_bookService,
      ls_selectYourService,
      ls_selectLocation,
      ls_address,
      ls_selectDate,
      ls_continue,
      ls_fetchingServiceSlots,
      ls_search,
      ls_specialRequests,
    } = localizedStrings;

    const {
      cities,
      selectedCity,
      bookingDates,
      selectedBookingDate,
      slots,
      selectedSlot,
      specialRequest,
    } = this.state;

    const showSelectSlotPicker =
      selectedBookingDate.Value !== ls_selectDate && slots.length > 0;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent title={ls_bookService} nav={this.props.navigation} />

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View>
              <Text style={styles.serviceHeading}>{ls_selectYourService}</Text>
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
                  value={this.state.address}
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

              <PickerModal
                items={bookingDates}
                selected={selectedBookingDate}
                onSelected={this.handleSelectBookingDate}
                onClosed={this.handleSelectBookingDateClose}
                backButtonDisabled
                showToTopButton={true}
                showAlphabeticalIndex={true}
                autoGenerateAlphabeticalIndex={true}
                searchPlaceholderText={ls_search}
                renderSelectView={this.renderSelectBookingDatePicker}
              />

              {showSelectSlotPicker && (
                <PickerModal
                  items={slots}
                  selected={selectedSlot}
                  onSelected={this.handleSelectSlot}
                  onClosed={this.handleSelectSlotClose}
                  backButtonDisabled
                  showToTopButton={true}
                  showAlphabeticalIndex={true}
                  autoGenerateAlphabeticalIndex={true}
                  searchPlaceholderText={ls_search}
                  renderSelectView={this.renderSelectSlotPicker}
                />
              )}

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
            </View>
          </View>
        </KeyboardAwareScrollView>

        {this.state.showFetchingLoader && (
          <FetchingLoader message={ls_fetchingServiceSlots} />
        )}
        {this.state.showProcessingLoader && <ProcessingLoader />}
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
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 10,
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
    marginBottom: 10,
  },
  pinIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  inputDesign: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
  },
  addressInputField: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingBottom: 3,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textareaInput: {
    color: "#000",
    fontSize: 14,
    height: 110,
    textAlignVertical: "top",
  },
  signUpButton: {
    width: 100,
    height: 40,
    marginTop: 30,
    backgroundColor: "#27aa04",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
