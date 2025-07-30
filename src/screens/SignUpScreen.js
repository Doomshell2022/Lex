/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Keyboard,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableHighlight,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import {SafeAreaView} from 'react-navigation';
import PickerModal from 'react-native-picker-modal-view';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// Images
import backgroundImage from '../assets/images/backgroundImage.jpg';
import logo from '../assets/images/logo.png';

// Icons
import ic_select_city from '../assets/icons/ic_select_city.png';
import ic_user from '../assets/icons/ic_user.png';
import ic_pin from '../assets/icons/ic_pin.png';
import email from '../assets/icons/email.png';
import ic_phone from '../assets/icons/ic_phone.png';
import ic_get_started from '../assets/icons/ic_get_started.png';

// Components
import CustomLoader from '../components/CustomLoader';
import ProcessingLoader from '../components/ProcessingLoader';

// API
import {makeRequest} from '../api/ApiInfo';

// Localization
import {localizedStrings} from '../localization/Locale';

export default class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    const {ls_selectYourCity} = localizedStrings;

    this.state = {
      isLoading: true,
      status: null,
      showGetStartedModal: false,
      showProcessingLoader: false,

      cities: null,
      selectedCity: {
        Id: -1,
        Name: ls_selectYourCity,
        Value: ls_selectYourCity,
      },

      userName: '',
      pin: '',
      firstName: '',
      lastName: '',
      emailId: '',
      mobileNumber: '',

      acceptTC: false,
    };
  }

  componentDidMount() {
    this.fetchCities();
  }

  fetchCities = async () => {
    try {
      // calling api
      const response = await makeRequest('city');

      // processing response
      if (response) {
        const {success} = response;

        if (success) {
          const {cityList} = response;

          const cities = cityList.map(item => ({
            Id: item.id,
            Name: item.city,
            Value: item.city,
          }));

          this.setState({cities, isLoading: false});
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleUserNameChange = changedText => {
    this.setState({userName: changedText});
  };

  handlePinChange = changedText => {
    this.setState({pin: changedText});
  };

  handleFirstNameChange = changedText => {
    this.setState({firstName: changedText});
  };

  handleLastNameChange = changedText => {
    this.setState({lastName: changedText});
  };

  handleEmailIdChange = changedText => {
    this.setState({emailId: changedText});
  };

  handleMobileNumberChange = changedText => {
    this.setState({mobileNumber: changedText});
  };

  handleSignIn = () => {
    // dismissing keyboard
    Keyboard.dismiss();

    this.props.navigation.pop();
  };

  handleSignUp = async () => {
    try {
      // dismissing keyboard
      Keyboard.dismiss();

      const {
        selectedCity,
        userName,
        pin,
        firstName,
        lastName,
        emailId,
        mobileNumber,
        acceptTC,
      } = this.state;

      const {
        ls_selectYourCity,
        ls_pleaseSelectYourCity,
        ls_pleaseEnterUserName,
        ls_pleaseEnter4DigitNumericPIN,
        ls_pleaseEnterYourFirstName,
        ls_pleaseEnterYourLastName,
        ls_pleaseEnterValidEmailAddress,
        ls_pleaseEnterValidMobileNumber,
        ls_pleaseAcceptTermsConditions,
      } = localizedStrings;

      if (selectedCity.Name !== ls_selectYourCity) {
        if (userName.trim() !== '') {
          if (this.isValidPIN(pin)) {
            if (firstName.trim() !== '') {
              if (lastName.trim() !== '') {
                if (this.isEmailAddress(emailId)) {
                  if (this.isMobileNumber(mobileNumber)) {
                    if (!acceptTC) {
                      Alert.alert(
                        '',
                        ls_pleaseAcceptTermsConditions,
                        [{text: 'OK'}],
                        {cancelable: false},
                      );
                      return;
                    }

                    // starting processing loader
                    this.setState({showProcessingLoader: true});

                    // preparing request params
                    const params = {
                      cityId: selectedCity.Id,
                      email: userName,
                      password: pin,
                      name: firstName,
                      lastName: lastName,
                      emailId: emailId,
                      mobile: mobileNumber,
                    };

                    // calling api
                    const response = await makeRequest('signup', params);

                    // stopping processing loader
                    this.setState({showProcessingLoader: false});

                    if (response.success) {
                      const {message} = response;
                      this.setState({
                        status: message,
                        showGetStartedModal: true,
                      });
                    } else {
                      const {message} = response;
                      Alert.alert('', message, [{text: 'OK'}], {
                        cancelable: false,
                      });
                    }
                  } else {
                    Alert.alert(
                      '',
                      ls_pleaseEnterValidMobileNumber,
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                  }
                } else {
                  Alert.alert(
                    '',
                    ls_pleaseEnterValidEmailAddress,
                    [{text: 'OK'}],
                    {cancelable: false},
                  );
                }
              } else {
                Alert.alert('', ls_pleaseEnterYourLastName, [{text: 'OK'}], {
                  cancelable: false,
                });
              }
            } else {
              Alert.alert('', ls_pleaseEnterYourFirstName, [{text: 'OK'}], {
                cancelable: false,
              });
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
      } else {
        Alert.alert('', ls_pleaseSelectYourCity, [{text: 'OK'}], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  isValidPIN(pin) {
    const pattern = /^\d{4}$/;
    return pattern.test(pin);
  }

  isMobileNumber(number) {
    const pattern = /^\d{10}$/;
    return pattern.test(number);
  }

  isEmailAddress(email) {
    // const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    const pattern = /\w+@\w+\.\w+/;
    return pattern.test(email);
  }

  handleCheckBoxClick = () => {
    this.setState(prevState => ({
      acceptTC: !prevState.acceptTC,
    }));
  };

  handleTCView = () => {
    // dismissing keyboard
    Keyboard.dismiss();

    this.props.navigation.push('TermsAndConditions');
  };

  renderPickerModalSelectView = (disabled, selected, showModal) => {
    const {selectedCity} = this.state;
    const {Value} = selectedCity;
    const {ls_selectYourCity} = localizedStrings;

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: '#fff',
    };

    if (Value === ls_selectYourCity) {
      labelStyle.color = '#ccc';
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={[styles.signUpInputContainer, {paddingBottom: 8}]}>
          <Image
            source={ic_select_city}
            resizeMode="cover"
            style={styles.pinIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectCity = selectedCity => {
    this.setState({selectedCity});
    return selectedCity;
  };

  handleSelectCityClose = () => {
    const {selectedCity} = this.state;
    this.setState({selectedCity});
  };

  render() {
    const {isLoading} = this.state;
    if (isLoading) {
      return <CustomLoader />;
    }

    const {
      ls_createYourAccount,
      ls_userName,
      ls_pin,
      ls_firstName,
      ls_lastName,
      ls_emailId,
      ls_mobileNumber,
      ls_acceptTermsAndConditions,
      ls_signUp,
      ls_alreadyHaveAnAccount,
      ls_signIn,
      ls_search,
    } = localizedStrings;

    const {cities, selectedCity} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.backgroundImageContainer}>
          <KeyboardAwareScrollView
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.contentContainer}>
              <Image source={logo} resizeMode="cover" style={styles.appLogo} />

              <Text style={styles.signUpHeading}>{ls_createYourAccount}</Text>

              <View style={styles.formContainer}>
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
                  renderSelectView={this.renderPickerModalSelectView}
                />

                <View style={styles.signUpInputContainer}>
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

                <View style={styles.signUpInputContainer}>
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
                </View>

                <View style={styles.signUpInputContainer}>
                  <Image
                    source={ic_user}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <TextInput
                    style={styles.inputDesign}
                    placeholder={ls_firstName}
                    placeholderTextColor="#ccc"
                    value={this.state.firstName}
                    onChangeText={this.handleFirstNameChange}
                  />
                </View>

                <View style={styles.signUpInputContainer}>
                  <Image
                    source={ic_user}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <TextInput
                    style={styles.inputDesign}
                    placeholder={ls_lastName}
                    placeholderTextColor="#ccc"
                    value={this.state.lastName}
                    onChangeText={this.handleLastNameChange}
                  />
                </View>

                <View style={styles.signUpInputContainer}>
                  <Image
                    source={email}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <TextInput
                    style={styles.inputDesign}
                    placeholder={ls_emailId}
                    placeholderTextColor="#ccc"
                    keyboardType="email-address"
                    value={this.state.emailId}
                    onChangeText={this.handleEmailIdChange}
                  />
                </View>

                <View style={styles.signUpInputContainer}>
                  <Image
                    source={ic_phone}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <TextInput
                    style={styles.inputDesign}
                    placeholder={ls_mobileNumber}
                    placeholderTextColor="#ccc"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={this.state.mobileNumber}
                    onChangeText={this.handleMobileNumberChange}
                  />
                </View>
              </View>

              <View style={styles.checkBoxContainer}>
                <CheckBox
                  style={styles.checkBox}
                  isChecked={this.state.acceptTC}
                  onClick={this.handleCheckBoxClick}
                />

                <Text style={styles.checkBoxTitle} onPress={this.handleTCView}>
                  {ls_acceptTermsAndConditions}
                </Text>
              </View>

              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handleSignUp}
                style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>{ls_signUp}</Text>
              </TouchableHighlight>

              <View style={styles.signIn}>
                <Text style={styles.oldUser}>{ls_alreadyHaveAnAccount}</Text>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={this.handleSignIn}>
                  <Text style={styles.signInButtonText}> {ls_signIn}</Text>
                </TouchableHighlight>
              </View>
            </View>
          </KeyboardAwareScrollView>

          {this.state.showGetStartedModal && this.renderGetStartedModal()}
          {this.state.showProcessingLoader && <ProcessingLoader />}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  renderGetStartedModal = () => {
    const {ls_continue} = localizedStrings;

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContentContainer}>
          <Image
            source={ic_get_started}
            resizeMode="cover"
            style={styles.getStartedImage}
          />

          <Text style={styles.getStartedText}>{this.state.status}</Text>

          <TouchableHighlight
            underlayColor="#27aa0480"
            onPress={this.handleSignIn}
            style={styles.continueButton}>
            <Text style={styles.continueButtonText}>{ls_continue}</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };
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
    alignItems: 'center',
    marginVertical: 30,
  },
  appLogo: {
    width: 200,
    height: 79,
    marginBottom: 15,
  },
  signUpHeading: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 15,
  },
  formContainer: {
    marginHorizontal: 24,
  },
  signUpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom: 10,
  },
  pinIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  inputDesign: {
    width: '100%',
    height: 40,
    fontSize: 16,
    color: '#fff',
  },
  signUpButton: {
    width: 110,
    height: 40,
    marginTop: 30,
    backgroundColor: '#27aa04',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  signIn: {
    flexDirection: 'row',
    marginTop: 20,
  },
  oldUser: {
    color: '#fff',
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    width: '80%',
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedImage: {
    width: 50,
    height: 50,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginVertical: 10,
  },
  continueButton: {
    width: 100,
    height: 30,
    marginTop: 12,
    backgroundColor: '#27aa04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  checkBoxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkBox: {
    width: 36,
    padding: 6,
  },
  checkBoxTitle: {
    fontSize: 15,
    color: '#fff',
  },
});
