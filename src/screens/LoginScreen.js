/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableHighlight,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// Images
import backgroundImage from '../assets/images/backgroundImage.jpg';
import logo from '../assets/images/logo.png';

// Icons
import ic_reset_pin from '../assets/icons/ic_reset_pin.png';
import ic_pin from '../assets/icons/ic_pin.png';
import ic_user from '../assets/icons/ic_user.png';

// Components
import ProcessingLoader from '../components/ProcessingLoader';

// API
import {makeRequest} from '../api/ApiInfo';

// User Preference
import {KEYS, storeData} from '../api/UserPreference';

// Localization
import {localizedStrings} from '../localization/Locale';

// Firebase API
import {checkPermission} from '../firebase_api/FirebaseAPI';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showProcessingLoader: false,

      userName: '',
      pin: '',
    };
  }

  handleUserNameChange = changedText => {
    this.setState({userName: changedText});
  };

  handlePinChange = changedText => {
    this.setState({pin: changedText});
  };

  handleSignUp = () => {
    // dismissing keyboard
    Keyboard.dismiss();

    this.props.navigation.push('SignUp');
  };

  isValidPIN(pin) {
    const pattern = /^\d{4}$/;
    return pattern.test(pin);
  }

  handleLogin = async () => {
    try {
      // dismissing keyboard
      Keyboard.dismiss();

      const {userName, pin} = this.state;

      const {ls_pleaseEnterUserName, ls_pleaseEnter4DigitNumericPIN} =
        localizedStrings;

      if (userName.trim() != '') {
        if (this.isValidPIN(pin.trim())) {
          // starting processing loader
          this.setState({showProcessingLoader: true});

          // preparing request params
          const params = {
            email: userName,
            password: pin,
          };

          // calling api
          const response = await makeRequest('userLogin', params);

          // processing response
          if (response) {
            const {success} = response;

            if (success) {
              // persisting user info
              const {userInfo} = response;
              await storeData(KEYS.USER_INFO, userInfo);

              // checking firebase messaging permission
              await checkPermission();

              // stopping processing loader
              this.setState({showProcessingLoader: false});

              // navigating to home screen
              this.props.navigation.navigate('LoggedIn');
            } else {
              // stopping processing loader
              this.setState({showProcessingLoader: false});

              const {message} = response;
              Alert.alert('', message, [{text: 'OK'}], {
                cancelable: false,
              });
            }
          }
        } else {
          Alert.alert('', ls_pleaseEnter4DigitNumericPIN, [{text: 'OK'}], {
            cancelable: false,
          });
        }
      } else {
        Alert.alert('', ls_pleaseEnterUserName, [{text: 'OK'}], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleForgotPin = () => {
    // dismissing keyboard
    Keyboard.dismiss();

    this.props.navigation.push('ForgotPin');
  };

  render() {
    const {ls_userName, ls_pin, ls_login, ls_newHere, ls_signUp} =
      localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.backgroundImageContainer}>
          <KeyboardAwareScrollView
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.contentContainer}>
            <Image source={logo} resizeMode="cover" style={styles.appLogo} />

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

              <View style={styles.loginInputContainer}>
                <Image
                  source={ic_pin}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />

                <TextInput
                  style={styles.inputDesign}
                  placeholder={ls_pin}
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={this.state.pin}
                  onChangeText={this.handlePinChange}
                />

                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={this.handleForgotPin}
                  style={styles.resetButton}>
                  <Image
                    source={ic_reset_pin}
                    resizeMode="cover"
                    style={styles.resetButtonIcon}
                  />
                </TouchableHighlight>
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handleLogin}
                style={styles.loginButton}>
                <Text style={styles.loginButtonText}>{ls_login}</Text>
              </TouchableHighlight>

              <View style={styles.signUp}>
                <Text style={styles.newUser}>{ls_newHere}</Text>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={this.handleSignUp}>
                  <Text style={styles.signUpButtonText}> {ls_signUp}</Text>
                </TouchableHighlight>
              </View>
            </View>
          </KeyboardAwareScrollView>

          {this.state.showProcessingLoader && <ProcessingLoader />}
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImageContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  appLogo: {
    width: 200,
    height: 79,
    marginBottom: 30,
    alignSelf: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    marginVertical: 30,
  },
  loginInputContainer: {
    flexDirection: 'row',
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinIcon: {
    width: 24,
    height: 24,
  },
  inputDesign: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#fff',
  },
  resetButton: {
    width: 30,
    height: 30,
    backgroundColor: '#27aa04',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  resetButtonIcon: {
    width: 20,
    height: 20,
  },
  bottomContainer: {
    alignItems: 'center',
  },
  loginButton: {
    width: 110,
    height: 40,
    backgroundColor: '#27aa04',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  signUp: {
    flexDirection: 'row',
    marginTop: 20,
  },
  newUser: {
    color: '#fff',
  },
  signUpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
