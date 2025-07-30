import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableHighlight,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-navigation";

// Images
import backgroundImage from "../assets/images/backgroundImage.jpg";
import logo from "../assets/images/logo.png";

// Icons
import ic_pin from "../assets/icons/ic_pin.png";

// Components
import ProcessingLoader from "../components/ProcessingLoader";
import showToast from "../components/CustomToast";
import HeaderComponent from "../components/HeaderComponent";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData, clearData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class ResetPinScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPin: "",
      newPin: "",
      confirmPin: "",
      isProcessing: false
    };
  }

  handleCurrentPinChange = changedText => {
    this.setState({ currentPin: changedText });
  };

  handleNewPinChange = changedText => {
    this.setState({ newPin: changedText });
  };

  handleConfirmPinChange = changedText => {
    this.setState({ confirmPin: changedText });
  };

  handleSubmit = async () => {
    const { currentPin, newPin, confirmPin } = this.state;

    const {
      ls_pleaseEnter4DigitCurrentPIN,
      ls_pleaseEnter4DigitNewPIN,
      ls_pleaseEnter4DigitConfirmPIN,
      ls_newAndConfirmPinDoesNotMatch
    } = localizedStrings;

    // validations
    if (!this.isValidPIN(currentPin.trim())) {
      Alert.alert("", ls_pleaseEnter4DigitCurrentPIN, [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    if (!this.isValidPIN(newPin.trim())) {
      Alert.alert("", ls_pleaseEnter4DigitNewPIN, [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    if (!this.isValidPIN(confirmPin.trim())) {
      Alert.alert("", ls_pleaseEnter4DigitConfirmPIN, [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    if (newPin != confirmPin) {
      Alert.alert("", ls_newAndConfirmPinDoesNotMatch, [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    try {
      // starting loader
      this.setState({ isProcessing: true });

      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const { userName } = userInfo;

        // preparing params
        const params = {
          email: userName,
          password: currentPin,
          newPin
        };

        // calling api
        const response = await makeRequest("resetPin", params);

        // processing response
        if (response) {
          // stopping loader
          this.setState({ isProcessing: false });

          const { success, message } = response;

          if (success) {
            // clearing user preferences
            await clearData();

            // resetting navigation
            this.props.navigation.navigate("LoggedOut");

            // success message
            showToast(message);
          } else {
            Alert.alert("", message, [{ text: "OK" }], {
              cancelable: false
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  isValidPIN(pin) {
    const pattern = /^\d{4}$/;
    return pattern.test(pin);
  }

  render() {
    const {
      ls_resetPin,
      ls_setYourNewPin,
      ls_currentPIN,
      ls_newPin,
      ls_confirmPin,
      ls_submit
    } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          style={styles.backgroundImageContainer}
          source={backgroundImage}
          resizeMode="cover"
        >
          <HeaderComponent
            title={ls_resetPin}
            nav={this.props.navigation}
            transparentBackground
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <Image source={logo} resizeMode="cover" style={styles.appLogo} />

            <Text style={styles.temporaryPinMessage}>{ls_setYourNewPin}</Text>

            <View style={styles.formContainer}>
              <View style={styles.newInputContainer}>
                <Image
                  source={ic_pin}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_currentPIN}
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={this.state.currentPin}
                  onChangeText={this.handleCurrentPinChange}
                />
              </View>

              <View style={styles.newInputContainer}>
                <Image
                  source={ic_pin}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_newPin}
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={this.state.newPin}
                  onChangeText={this.handleNewPinChange}
                />
              </View>

              <View style={styles.newInputContainer}>
                <Image
                  source={ic_pin}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_confirmPin}
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={this.state.confirmPin}
                  onChangeText={this.handleConfirmPinChange}
                />
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handleSubmit}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>{ls_submit}</Text>
              </TouchableHighlight>
            </View>
          </ScrollView>

          {this.state.isProcessing && <ProcessingLoader />}
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImageContainer: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center"
  },
  appLogo: {
    width: 200,
    height: 79,
    marginTop: -40,
    marginBottom: 30,
    alignSelf: "center"
  },
  temporaryPinMessage: {
    color: "#fff",
    width: "80%",
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center"
  },
  formContainer: {
    marginHorizontal: 20,
    marginVertical: 30
  },
  newInputContainer: {
    flexDirection: "row",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    marginBottom: 16,
    justifyContent: "space-between",
    alignItems: "center"
  },
  pinIcon: {
    width: 24,
    height: 24
  },
  inputDesign: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#fff"
  },
  bottomContainer: {
    alignItems: "center"
  },
  submitButton: {
    width: 100,
    height: 40,
    backgroundColor: "#27aa04",
    alignItems: "center",
    justifyContent: "center"
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500"
  }
});
