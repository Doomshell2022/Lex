import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Keyboard,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import PickerModal from "react-native-picker-modal-view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Components
import HeaderComponent from "../components/HeaderComponent";
import FooterComponent from "../components/FooterComponent";
import CustomLoader from "../components/CustomLoader";
import ProcessingLoader from "../components/ProcessingLoader";
import showToast from "../components/CustomToast";

// Images
import user_image from "../assets/images/user_image.jpg";

// Icons
import ic_logout from "../assets/icons/ic_logout.png";
import ic_edit_profile from "../assets/icons/ic_edit_profile.png";
import ic_user_blue from "../assets/icons/ic_user_blue.png";
import ic_phone_blue from "../assets/icons/ic_phone_blue.png";
import ic_email_blue from "../assets/icons/ic_email_blue.png";
import ic_reset_pin from "../assets/icons/ic_reset_pin.png";
import ic_address from "../assets/icons/ic_address.png";

// User Preference
import { clearData, KEYS, getData } from "../api/UserPreference";

// API
import { makeRequest } from "../api/ApiInfo";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    const { ls_selectYourCity } = localizedStrings;

    this.state = {
      isLoading: true,
      showProcessingLoader: false,

      isProfileEditable: false,
      profile: null,

      firstName: "",
      lastName: "",

      cities: null,
      selectedCity: {
        Id: -1,
        Name: ls_selectYourCity,
        Value: ls_selectYourCity,
      },
    };
  }

  componentDidMount() {
    this.fetchCities();
  }

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

          // fetching user profile
          await this.fetchProfile();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchProfile = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const { userId } = userInfo;

        // preparing params
        const params = {
          userId: userId,
        };

        // calling api
        const response = await makeRequest("getProfile", params);

        // processing response
        if (response) {
          const { success } = response;

          if (success) {
            const { profile } = response;
            const { firstName, lastName, cityId, cityName } = profile;

            const selectedCity = {
              Id: cityId,
              Name: cityName,
              Value: cityName,
            };

            this.setState({
              profile,
              firstName,
              lastName,
              selectedCity,
              isLoading: false,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleLogout = () => {
    const { ls_logout, ls_confirmLogoutMessage } = localizedStrings;

    Alert.alert(
      ls_logout,
      ls_confirmLogoutMessage,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: this.handleLogoutOkPress },
      ],
      { cancelable: false }
    );
  };

  handleLogoutOkPress = async () => {
    try {
      // clearing user preferences
      await clearData();

      // resetting navigation
      this.props.navigation.navigate("LoggedOut");
    } catch (error) {
      console.log(error.message);
    }
  };

  handleProfileEdit = async () => {
    try {
      await this.setState({ isProfileEditable: !this.state.isProfileEditable });
    } catch (error) {
      console.log(error.message);
    }
  };

  handleFirstNameChange = (changedText) => {
    this.setState({ firstName: changedText });
  };

  handleLastNameChange = (changedText) => {
    this.setState({ lastName: changedText });
  };

  handleUpdateProfile = async () => {
    try {
      // dismissing keyboard
      Keyboard.dismiss();

      const { firstName, lastName, selectedCity, profile } = this.state;

      const {
        ls_pleaseEnterYourFirstName,
        ls_pleaseEnterYourLastName,
        ls_pleaseSelectYourCity,
        ls_selectYourCity,
      } = localizedStrings;

      if (firstName.trim() !== "") {
        if (lastName.trim() !== "") {
          if (selectedCity.Name !== ls_selectYourCity) {
            // starting processing loader
            this.setState({ showProcessingLoader: true });

            // fetching userInfo
            const userInfo = await getData(KEYS.USER_INFO);

            if (userInfo) {
              const { userId } = userInfo;

              // preparing params
              const params = {
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                cityId: selectedCity.Id,
              };

              // calling api
              const response = await makeRequest("editProfile", params);

              // stopping processing loader
              await this.setState({ showProcessingLoader: false });

              // processing response
              const { success, message } = response;

              if (success) {
                // success toast
                showToast(message);

                // updating profile info
                const updatedProfile = {
                  ...profile,
                  firstName: firstName,
                  lastName: lastName,
                };

                await this.setState({
                  profile: updatedProfile,
                  isProfileEditable: false,
                });
              } else {
                Alert.alert("", message, [{ text: "OK" }], {
                  cancelable: false,
                });
              }
            }
          } else {
            Alert.alert("", ls_pleaseSelectYourCity, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        } else {
          Alert.alert("", ls_pleaseEnterYourLastName, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      } else {
        Alert.alert("", ls_pleaseEnterYourFirstName, [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleResetPin = () => {
    this.props.navigation.push("ResetPin");
  };

  handleSelectCity = (selectedCity) => {
    this.setState({ selectedCity });
    return selectedCity;
  };

  handleSelectCityClose = () => {
    const { selectedCity } = this.state;
    this.setState({ selectedCity });
  };

  renderPickerModalSelectView = (disabled, selected, showModal) => {
    const { selectedCity, isProfileEditable } = this.state;
    const { Value } = selectedCity;

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#ccc",
    };

    if (isProfileEditable) {
      labelStyle.color = "#000";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={styles.editFields}>
          <Image
            source={ic_address}
            resizeMode="cover"
            style={styles.inputIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.isLoading) {
      return <CustomLoader />;
    }

    const { profile, cities, selectedCity, isProfileEditable } = this.state;
    const { firstName, lastName, userName, mobile, email } = profile;

    const {
      ls_profile,
      ls_firstName,
      ls_lastName,
      ls_updateProfile,
      ls_resetPin,
      ls_search,
    } = localizedStrings;

    const inputFieldStyle = { ...styles.inputDesign };
    if (isProfileEditable) {
      inputFieldStyle.color = "#000";
    }

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent title={ls_profile} />

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.profileContent}
        >
          <View style={styles.userProfileSection}>
            <Image
              source={user_image}
              resizeMode="cover"
              style={styles.userImage}
            />

            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{firstName + " " + lastName}</Text>

              <TouchableHighlight
                underlayColor="transparent"
                onPress={this.handleProfileEdit}
                style={styles.editProfileIconContainer}
              >
                <Image
                  source={ic_edit_profile}
                  resizeMode="cover"
                  style={styles.editProfileIcon}
                />
              </TouchableHighlight>
            </View>

            <TouchableHighlight
              underlayColor="transparent"
              onPress={this.handleLogout}
              style={styles.logoutButton}
            >
              <Image
                source={ic_logout}
                resizeMode="cover"
                style={styles.logoutButtonIcon}
              />
            </TouchableHighlight>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.infoFields}>
              <Image
                source={ic_user_blue}
                resizeMode="cover"
                style={styles.infoIcons}
              />
              <Text style={styles.infoContent}>{userName}</Text>
            </View>
            <View style={styles.infoFields}>
              <Image
                source={ic_phone_blue}
                resizeMode="cover"
                style={styles.infoIcons}
              />
              <Text style={styles.infoContent}>{mobile}</Text>
            </View>
            <View style={styles.infoFields}>
              <Image
                source={ic_email_blue}
                resizeMode="cover"
                style={styles.infoIcons}
              />
              <Text style={styles.infoContent}>{email}</Text>
            </View>
          </View>

          <View style={styles.editFields}>
            <Image
              source={ic_user_blue}
              resizeMode="cover"
              style={styles.inputIcon}
            />
            <TextInput
              style={inputFieldStyle}
              placeholder={ls_firstName}
              placeholderTextColor="#ccc"
              value={this.state.firstName}
              onChangeText={this.handleFirstNameChange}
              editable={this.state.isProfileEditable}
            />
          </View>

          <View style={styles.editFields}>
            <Image
              source={ic_user_blue}
              resizeMode="cover"
              style={styles.inputIcon}
            />
            <TextInput
              style={inputFieldStyle}
              placeholder={ls_lastName}
              placeholderTextColor="#ccc"
              value={this.state.lastName}
              onChangeText={this.handleLastNameChange}
              editable={this.state.isProfileEditable}
            />
          </View>

          <PickerModal
            items={cities}
            selected={selectedCity}
            onSelected={this.handleSelectCity}
            onClosed={this.handleSelectCityClose}
            disabled={!this.state.isProfileEditable}
            backButtonDisabled
            showToTopButton={true}
            showAlphabeticalIndex={true}
            autoGenerateAlphabeticalIndex={true}
            searchPlaceholderText={ls_search}
            renderSelectView={this.renderPickerModalSelectView}
          />

          {this.state.isProfileEditable ? (
            <TouchableHighlight
              underlayColor="#27aa0480"
              onPress={this.handleUpdateProfile}
              style={styles.updateProfileButton}
            >
              <Text style={styles.resetPinText}>{ls_updateProfile}</Text>
            </TouchableHighlight>
          ) : (
            <TouchableHighlight
              underlayColor="#27aa0480"
              onPress={this.handleResetPin}
              style={styles.resetPinButton}
            >
              <View style={styles.resetContainer}>
                <Image
                  source={ic_reset_pin}
                  resizeMode="cover"
                  style={styles.inputIcon}
                />
                <Text style={styles.resetPinText}>{ls_resetPin}</Text>
              </View>
            </TouchableHighlight>
          )}
        </KeyboardAwareScrollView>

        <FooterComponent nav={this.props.navigation} />

        {this.state.showProcessingLoader && <ProcessingLoader />}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efeff1",
  },
  profileContent: {
    flex: 1,
  },
  userProfileSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 15,
    margin: 8,
    borderRadius: 2,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b3b3b",
  },
  editProfileIconContainer: {
    marginLeft: 10,
    padding: 8,
  },
  editProfileIcon: {
    width: 20,
    height: 20,
  },
  logoutButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  logoutButtonIcon: {
    width: 22,
    height: 22,
  },
  userInfo: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 8,
  },
  infoFields: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
  },
  infoIcons: {
    height: 24,
    width: 24,
  },
  infoContent: {
    fontSize: 16,
    marginLeft: 10,
  },
  editFields: {
    backgroundColor: "#fff",
    height: 46,
    flexDirection: "row",
    marginHorizontal: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  inputDesign: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "#ccc",
  },
  resetPinButton: {
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "center",
  },
  resetContainer: {
    paddingHorizontal: 6,
    height: 40,
    borderRadius: 2,
    backgroundColor: "#27aa04",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resetPinText: {
    color: "#fff",
    fontSize: 15,
  },
  updateProfileButton: {
    padding: 10,
    borderRadius: 2,
    backgroundColor: "#27aa04",
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});
