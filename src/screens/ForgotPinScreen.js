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
import ic_user from "../assets/icons/ic_user.png";

// Components
import ProcessingLoader from "../components/ProcessingLoader";
import showToast from "../components/CustomToast";
import HeaderComponent from "../components/HeaderComponent";

// API
import { makeRequest } from "../api/ApiInfo";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class ForgotPinScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: "",
      isProcessing: false
    };
  }

  handleUserNameChange = changedText => {
    this.setState({ userName: changedText });
  };

  handleNext = async () => {
    const { userName } = this.state;

    // validation
    if (userName.trim() === "") {
      Alert.alert("", "Please enter user name", [{ text: "OK" }], {
        cancelable: false
      });
      return;
    }

    try {
      // starting loader
      this.setState({ isProcessing: true });

      // preparing params
      const params = {
        email: userName
      };

      // calling api
      const response = await makeRequest("forgotPassword", params);

      // processing response
      if (response) {
        // stopping loader
        this.setState({ isProcessing: false });

        const { success, message } = response;

        if (success) {
          this.props.navigation.push("TemporaryPin", { userName });
          showToast(message);
        } else {
          Alert.alert("", message, [{ text: "OK" }], {
            cancelable: false
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    const {
      ls_forgotPin,
      ls_enterYourUserNameToResetPin,
      ls_userName,
      ls_next
    } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.backgroundImageContainer}
        >
          <HeaderComponent
            title={ls_forgotPin}
            nav={this.props.navigation}
            transparentBackground
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <Image source={logo} resizeMode="cover" style={styles.appLogo} />

            <Text style={styles.temporaryPinMessage}>
              {ls_enterYourUserNameToResetPin}
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.loginInputContainer}>
                <Image
                  source={ic_user}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_userName}
                  placeholderTextColor="#ccc"
                  value={this.state.userName}
                  onChangeText={this.handleUserNameChange}
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
    fontSize: 16,
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
