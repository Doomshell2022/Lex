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
import HeaderComponent from "../components/HeaderComponent";

// API
import { makeRequest } from "../api/ApiInfo";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class TemporaryPinScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tempPin: "",
      isProcessing: false
    };
  }

  handleTempPinChange = changedText => {
    this.setState({ tempPin: changedText });
  };

  handleNext = async () => {
    const { tempPin } = this.state;

    // validation
    if (!this.isValidPIN(tempPin.trim())) {
      Alert.alert("", "Please enter a 4-digit Numeric PIN", [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    try {
      // starting loader
      this.setState({ isProcessing: true });

      // fetching navigation params
      const userName = this.props.navigation.getParam("userName", null);

      if (userName) {
        // preparing params
        const params = {
          email: userName,
          tmppin: tempPin
        };

        // calling api
        const response = await makeRequest("tmpLogin", params);

        // processing response
        if (response) {
          // stopping loader
          this.setState({ isProcessing: false });

          const { success } = response;

          if (success) {
            const { userInfo } = response;
            this.props.navigation.push("NewPin", {
              info: { tempPin, userInfo }
            });
          } else {
            const { message } = response;
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
    const { ls_temporaryPin, ls_enterTemporaryPin, ls_next } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          style={styles.backgroundImageContainer}
          source={backgroundImage}
          resizeMode="cover"
        >
          <HeaderComponent
            title={ls_temporaryPin}
            nav={this.props.navigation}
            transparentBackground
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <Image source={logo} resizeMode="cover" style={styles.appLogo} />

            <Text style={styles.temporaryPinMessage}>
              {ls_enterTemporaryPin}
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.loginInputContainer}>
                <Image
                  source={ic_pin}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_temporaryPin}
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={this.state.tempPin}
                  onChangeText={this.handleTempPinChange}
                />
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handleNext}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>{ls_next}</Text>
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
  loginInputContainer: {
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
  nextButton: {
    width: 100,
    height: 40,
    backgroundColor: "#27aa04",
    alignItems: "center",
    justifyContent: "center"
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500"
  }
});
