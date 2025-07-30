import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Platform,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import ImagePicker from "react-native-image-picker";
import Permissions from "react-native-permissions";
import PickerModal from "react-native-picker-modal-view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Components
import HeaderComponent from "../components/HeaderComponent";
import ProcessingLoader from "../components/ProcessingLoader";
import CustomLoader from "../components/CustomLoader";
import showToast from "../components/CustomToast";

// Icons
import ic_vehicle_size from "../assets/icons/ic_vehicle_size.png";
import ic_vehicle_brand from "../assets/icons/ic_vehicle_brand.png";
import ic_vehicle_modal from "../assets/icons/ic_vehicle_modal.png";
import ic_vehicle_color from "../assets/icons/ic_vehicle_color.png";
import ic_vehicle_year from "../assets/icons/ic_vehicle_year.png";
import ic_license_plate from "../assets/icons/ic_license_plate.png";
import ic_fuel_type from "../assets/icons/ic_fuel_type.png";
import ic_engine_size from "../assets/icons/ic_engine_size.png";
import ic_upload_photo from "../assets/icons/ic_upload_photo.png";
import ic_car_detail from "../assets/icons/ic_car_detail.png";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// API
import { makeRequest } from "../api/ApiInfo";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class AddVehicleScreen extends Component {
  constructor(props) {
    super(props);

    const {
      ls_selectVehicleSize,
      ls_selectFuelType,
      ls_diesel,
      ls_cng,
      ls_howOftenDetailYourCar,
      ls_onceAWeek,
      ls_onceEveryTwoWeeks,
    } = localizedStrings;

    this.state = {
      isLoading: true,
      showProcessingLoader: false,
      photoPermission: null,

      vehicleSizes: null,
      selectedVehicleSize: {
        Id: -1,
        Name: ls_selectVehicleSize,
        Value: ls_selectVehicleSize,
      },

      vehicleBrand: "",
      vehicleModel: "",
      vehicleColor: "",
      vehicleYear: "",
      licensePlate: "",
      engineSize: "",

      fuelTypes: [
        {
          Id: 1,
          Name: ls_diesel,
          Value: ls_diesel,
        },
        {
          Id: 2,
          Name: ls_cng,
          Value: ls_cng,
        },
      ],
      selectedFuelType: {
        Id: -1,
        Name: ls_selectFuelType,
        Value: ls_selectFuelType,
      },

      vehicleImage: null,
      vehicleImageName: "",

      serviceFrequencies: [
        {
          Id: 1,
          Name: ls_onceAWeek,
          Value: ls_onceAWeek,
        },
        {
          Id: 2,
          Name: ls_onceEveryTwoWeeks,
          Value: ls_onceEveryTwoWeeks,
        },
      ],
      selectedServiceFrequency: {
        Id: -1,
        Name: ls_howOftenDetailYourCar,
        Value: ls_howOftenDetailYourCar,
      },

      // edit form
      vehicleId: null,
    };

    // checking for edit vehicle
    const vehicleInfo = this.props.navigation.getParam("vehicleInfo", null);
    if (vehicleInfo) {
      this.setupEditForm(vehicleInfo);
    }
  }

  componentDidMount() {
    this.fetchVehicleSize();
  }

  setupEditForm = (vehicleInfo) => {
    const {
      vehicleId,
      vehicleSize,
      vehicleBrand,
      modal: vehicleModel,
      color: vehicleColor,
      year,
      licensePlate,
      fuelType,
      engineSize,
      oftencarDetail: serviceFrequency,
    } = vehicleInfo;

    const selectedVehicleSize = {
      Id: vehicleSize.id,
      Name: vehicleSize.name,
      Value: vehicleSize.name,
    };

    const vehicleYear = year.toString();

    const { fuelTypes, serviceFrequencies } = this.state;
    const selectedFuelType = fuelTypes.find((item) => item.Name === fuelType);

    const infoObj = {
      ...this.state,
      vehicleId,
      selectedVehicleSize,
      vehicleBrand,
      vehicleModel,
      vehicleColor,
      vehicleYear,
      licensePlate,
      selectedFuelType,
      engineSize,
    };

    if (serviceFrequency) {
      const selectedServiceFrequency = serviceFrequencies.find(
        (item) => item.Name === serviceFrequency
      );

      infoObj.selectedServiceFrequency = selectedServiceFrequency;
    }

    // updating state
    this.state = infoObj;
  };

  fetchVehicleSize = async () => {
    try {
      // calling api
      const response = await makeRequest("vehicleSize");

      // processing response
      if (response) {
        const { success } = response;

        if (success) {
          const { vehicleSize } = response;

          const vehicleSizes = vehicleSize.map((item) => ({
            Id: item.id,
            Name: item.vehicleSizename,
            Value: item.vehicleSizename,
          }));

          this.setState({ vehicleSizes, isLoading: false });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleVehicleBrandChange = (changedText) => {
    this.setState({ vehicleBrand: changedText });
  };

  handleVehicleModelChange = (changedText) => {
    this.setState({ vehicleModel: changedText });
  };

  handleVehicleColorChange = (changedText) => {
    this.setState({ vehicleColor: changedText });
  };

  handleVehicleYearChange = (changedText) => {
    this.setState({ vehicleYear: changedText });
  };

  handleLicensePlateChange = (changedText) => {
    this.setState({ licensePlate: changedText });
  };

  handleEngineSizeChange = (changedText) => {
    this.setState({ engineSize: changedText });
  };

  requestPermission = async () => {
    try {
      // Request permission to access photos
      const response = await Permissions.request("photo");
      this.setState({ photoPermission: response });
    } catch (error) {
      console.log(error.message);
    }
  };

  handleChoosePhoto = async () => {
    try {
      // checking photo permission
      await this.requestPermission();

      if (this.state.photoPermission === "authorized") {
        const options = { noData: true };

        ImagePicker.launchImageLibrary(options, (response) => {
          if (response.uri && response.type.startsWith("image/")) {
            this.setState({
              vehicleImage: response,
              vehicleImageName: response.fileName,
            });
          }
        });
      }
      // else {
      // 	// requesting photo permission again to access photos
      // 	await this.requestPermission()
      // }
    } catch (error) {
      console.log(error.message);
    }
  };

  isValidYear(year) {
    const pattern = /^\d{4}$/;
    return pattern.test(year);
  }

  handleAddVehicle = async () => {
    try {
      const {
        selectedVehicleSize,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        vehicleYear,
        licensePlate,
        selectedFuelType,
        engineSize,
        vehicleImage,
        selectedServiceFrequency,
      } = this.state;

      const {
        ls_pleaseSelectVehicleSize,
        ls_pleaseEnterVehicleBrand,
        ls_pleaseEnterVehicleModel,
        ls_pleaseEnterVehicleColor,
        ls_pleaseEnterValidVehicleYear,
        ls_pleaseEnterLicensePlate,
        ls_pleaseSelectFuelType,
        ls_pleaseUploadVehicleImage,
        ls_selectVehicleSize,
        ls_selectFuelType,
        ls_howOftenDetailYourCar,
      } = localizedStrings;

      if (selectedVehicleSize.Name != ls_selectVehicleSize) {
        if (vehicleBrand.trim() != "") {
          if (vehicleModel.trim() != "") {
            if (vehicleColor.trim() != "") {
              if (this.isValidYear(vehicleYear)) {
                if (licensePlate.trim() != "") {
                  if (selectedFuelType.Name != ls_selectFuelType) {
                    // if (engineSize.trim() != '') {
                    if (vehicleImage) {
                      // starting processing loader
                      this.setState({ showProcessingLoader: true });

                      // fetching userInfo
                      const userInfo = await getData(KEYS.USER_INFO);

                      if (userInfo) {
                        // preparing file to upload
                        const uploadVehicleImage = {
                          name: vehicleImage.fileName,
                          type: vehicleImage.type,
                          uri:
                            Platform.OS === "android"
                              ? vehicleImage.uri
                              : vehicleImage.uri.replace("file://", ""), // to test on iOS
                        };

                        // preparing request params
                        let params = {
                          userId: userInfo.userId,
                          vehicleType: selectedVehicleSize.Id,
                          brand: vehicleBrand,
                          modal: vehicleModel,
                          color: vehicleColor,
                          year: vehicleYear,
                          licensePlate: licensePlate,
                          fuelType: selectedFuelType.Name,
                          engineSize: engineSize.trim(),
                          "vehicleImg[]": uploadVehicleImage,
                        };

                        if (
                          selectedServiceFrequency.Name !=
                          ls_howOftenDetailYourCar
                        ) {
                          params["oftencarDetail"] =
                            selectedServiceFrequency.Name;
                        }

                        // calling api
                        const response = await makeRequest(
                          "addVehicle",
                          params
                        );

                        // stopping processing loader
                        this.setState({ showProcessingLoader: false });

                        // processing response
                        const { success, message } = response;

                        if (success) {
                          const { getParam, pop } = this.props.navigation;

                          const refreshCallback = getParam(
                            "refreshCallback",
                            null
                          );

                          if (refreshCallback) {
                            // Navigating back
                            pop();

                            // Refreshing vehicle list
                            await refreshCallback();

                            // Success Toast
                            showToast(message);
                          }
                        } else {
                          Alert.alert("", message, [{ text: "OK" }], {
                            cancelable: false,
                          });
                        }
                      }
                    } else {
                      Alert.alert(
                        "",
                        ls_pleaseUploadVehicleImage,
                        [{ text: "OK" }],
                        { cancelable: false }
                      );
                    }
                    // } else {
                    // 	Alert.alert(
                    // 		'',
                    // 		'Please enter engine size!',
                    // 		[{ text: 'OK' }],
                    // 		{ cancelable: false },
                    // 	)
                    // }
                  } else {
                    Alert.alert("", ls_pleaseSelectFuelType, [{ text: "OK" }], {
                      cancelable: false,
                    });
                  }
                } else {
                  Alert.alert(
                    "",
                    ls_pleaseEnterLicensePlate,
                    [{ text: "OK" }],
                    { cancelable: false }
                  );
                }
              } else {
                Alert.alert(
                  "",
                  ls_pleaseEnterValidVehicleYear,
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              }
            } else {
              Alert.alert("", ls_pleaseEnterVehicleColor, [{ text: "OK" }], {
                cancelable: false,
              });
            }
          } else {
            Alert.alert("", ls_pleaseEnterVehicleModel, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        } else {
          Alert.alert("", ls_pleaseEnterVehicleBrand, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      } else {
        Alert.alert("", ls_pleaseSelectVehicleSize, [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleEditVehicle = async () => {
    try {
      const {
        selectedVehicleSize,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        vehicleYear,
        licensePlate,
        selectedFuelType,
        engineSize,
        vehicleImage,
        selectedServiceFrequency,
        vehicleId,
      } = this.state;

      const {
        ls_pleaseSelectVehicleSize,
        ls_pleaseEnterVehicleBrand,
        ls_pleaseEnterVehicleModel,
        ls_pleaseEnterVehicleColor,
        ls_pleaseEnterValidVehicleYear,
        ls_pleaseEnterLicensePlate,
        ls_pleaseSelectFuelType,
        ls_selectVehicleSize,
        ls_selectFuelType,
        ls_howOftenDetailYourCar,
      } = localizedStrings;

      if (selectedVehicleSize.Name != ls_selectVehicleSize) {
        if (vehicleBrand.trim() != "") {
          if (vehicleModel.trim() != "") {
            if (vehicleColor.trim() != "") {
              if (this.isValidYear(vehicleYear)) {
                if (licensePlate.trim() != "") {
                  if (selectedFuelType.Name != ls_selectFuelType) {
                    // if (engineSize.trim() != '') {
                    // if (vehicleImage) {
                    // starting processing loader
                    this.setState({ showProcessingLoader: true });

                    if (vehicleId) {
                      // preparing request params
                      let params = {
                        vehicleId: vehicleId,
                        vehicleType: selectedVehicleSize.Id,
                        brand: vehicleBrand,
                        modal: vehicleModel,
                        color: vehicleColor,
                        year: vehicleYear,
                        licensePlate: licensePlate,
                        fuelType: selectedFuelType.Name,
                        engineSize: engineSize.trim(),
                      };

                      if (vehicleImage) {
                        // preparing file to upload
                        const uploadVehicleImage = {
                          name: vehicleImage.fileName,
                          type: vehicleImage.type,
                          uri:
                            Platform.OS === "android"
                              ? vehicleImage.uri
                              : vehicleImage.uri.replace("file://", ""), // to test on iOS
                        };

                        params["vehicleImg[]"] = uploadVehicleImage;
                      }

                      if (
                        selectedServiceFrequency.Name !=
                        ls_howOftenDetailYourCar
                      ) {
                        params["oftencarDetail"] =
                          selectedServiceFrequency.Name;
                      }

                      // calling api
                      const response = await makeRequest("editVehicle", params);

                      // stopping processing loader
                      this.setState({ showProcessingLoader: false });

                      // processing response
                      const { success, message } = response;

                      if (success) {
                        const { getParam, pop } = this.props.navigation;

                        const refreshCallback = getParam(
                          "refreshCallback",
                          null
                        );

                        if (refreshCallback) {
                          // Navigating back
                          pop();

                          // Refreshing vehicle list
                          await refreshCallback();

                          // Success Toast
                          showToast(message);
                        }
                      } else {
                        Alert.alert("", message, [{ text: "OK" }], {
                          cancelable: false,
                        });
                      }
                    }
                    // } else {
                    // 	Alert.alert(
                    // 		'',
                    // 		'Please upload vehicle image!',
                    // 		[{ text: 'OK' }],
                    // 		{ cancelable: false },
                    // 	)
                    // }
                    // } else {
                    // 	Alert.alert(
                    // 		'',
                    // 		'Please enter engine size!',
                    // 		[{ text: 'OK' }],
                    // 		{ cancelable: false },
                    // 	)
                    // }
                  } else {
                    Alert.alert("", ls_pleaseSelectFuelType, [{ text: "OK" }], {
                      cancelable: false,
                    });
                  }
                } else {
                  Alert.alert(
                    "",
                    ls_pleaseEnterLicensePlate,
                    [{ text: "OK" }],
                    { cancelable: false }
                  );
                }
              } else {
                Alert.alert(
                  "",
                  ls_pleaseEnterValidVehicleYear,
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              }
            } else {
              Alert.alert("", ls_pleaseEnterVehicleColor, [{ text: "OK" }], {
                cancelable: false,
              });
            }
          } else {
            Alert.alert("", ls_pleaseEnterVehicleModel, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        } else {
          Alert.alert("", ls_pleaseEnterVehicleBrand, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      } else {
        Alert.alert("", ls_pleaseSelectVehicleSize, [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  renderSelectVehicleSizePicker = (disabled, selected, showModal) => {
    const { selectedVehicleSize } = this.state;
    const { Value } = selectedVehicleSize;

    const containerStyle = {
      ...styles.signUpInputContainer,
      paddingBottom: 8,
    };

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#ccc",
    };

    const { ls_selectVehicleSize } = localizedStrings;
    if (Value !== ls_selectVehicleSize) {
      labelStyle.color = "#000";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={containerStyle}>
          <Image
            source={ic_vehicle_size}
            resizeMode="cover"
            style={styles.pinIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectVehicleSize = (selectedVehicleSize) => {
    this.setState({ selectedVehicleSize });
    return selectedVehicleSize;
  };

  handleSelectVehicleSizeClose = () => {
    const { selectedVehicleSize } = this.state;
    this.setState({ selectedVehicleSize });
  };

  renderSelectFuelTypePicker = (disabled, selected, showModal) => {
    const { selectedFuelType } = this.state;
    const { Value } = selectedFuelType;

    const containerStyle = {
      ...styles.signUpInputContainer,
      paddingBottom: 8,
    };

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#ccc",
    };

    const { ls_selectFuelType } = localizedStrings;
    if (Value !== ls_selectFuelType) {
      labelStyle.color = "#000";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={containerStyle}>
          <Image
            source={ic_fuel_type}
            resizeMode="cover"
            style={styles.pinIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectFuelType = (selectedFuelType) => {
    this.setState({ selectedFuelType });
    return selectedFuelType;
  };

  handleSelectFuelTypeClose = () => {
    const { selectedFuelType } = this.state;
    this.setState({ selectedFuelType });
  };

  renderServiceFrequencyPicker = (disabled, selected, showModal) => {
    const { selectedServiceFrequency } = this.state;
    const { Value } = selectedServiceFrequency;

    const containerStyle = {
      ...styles.signUpInputContainer,
      paddingBottom: 8,
    };

    const labelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#ccc",
    };

    const { ls_howOftenDetailYourCar } = localizedStrings;
    if (Value !== ls_howOftenDetailYourCar) {
      labelStyle.color = "#000";
    }

    const handlePress = disabled ? null : showModal;

    return (
      <TouchableHighlight underlayColor="transparent" onPress={handlePress}>
        <View style={containerStyle}>
          <Image
            source={ic_car_detail}
            resizeMode="cover"
            style={styles.pinIcon}
          />
          <Text style={labelStyle}>{Value}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  handleSelectServiceFrequency = (selectedServiceFrequency) => {
    this.setState({ selectedServiceFrequency });
    return selectedServiceFrequency;
  };

  handleSelectServiceFrequencyClose = () => {
    const { selectedServiceFrequency } = this.state;
    this.setState({ selectedServiceFrequency });
  };

  render() {
    const { isLoading } = this.state;
    if (isLoading) {
      return <CustomLoader />;
    }

    const {
      ls_addVehicle,
      ls_updateVehicle,
      ls_vehicleBrand,
      ls_vehicleModel,
      ls_vehicleColor,
      ls_vehicleYear,
      ls_licensePlate,
      ls_engineSize,
      ls_uploadVehicleImage,
      ls_add,
      ls_update,
      ls_search,
    } = localizedStrings;

    const {
      vehicleId,
      vehicleSizes,
      selectedVehicleSize,
      fuelTypes,
      selectedFuelType,
      serviceFrequencies,
      selectedServiceFrequency,
      vehicleImageName,
    } = this.state;

    const headerTitle = vehicleId ? ls_updateVehicle : ls_addVehicle;
    const submitButtonTitle = vehicleId ? ls_update : ls_add;
    const submitButtonOnPress = vehicleId
      ? this.handleEditVehicle
      : this.handleAddVehicle;

    const imagePickerContainerStyle = {
      ...styles.signUpInputContainer,
      paddingBottom: 8,
    };

    const imagePickerLabelStyle = {
      flex: 1,
      fontSize: 16,
      color: "#ccc",
    };

    if (vehicleImageName) {
      imagePickerLabelStyle.color = "#000";
    }

    const imagePickerLabel = vehicleImageName || ls_uploadVehicleImage;

    return (
      <SafeAreaView style={styles.addVehicleContainer}>
        <HeaderComponent title={headerTitle} nav={this.props.navigation} />

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <PickerModal
              items={vehicleSizes}
              selected={selectedVehicleSize}
              onSelected={this.handleSelectVehicleSize}
              onClosed={this.handleSelectVehicleSizeClose}
              backButtonDisabled
              showToTopButton={true}
              showAlphabeticalIndex={true}
              autoGenerateAlphabeticalIndex={true}
              searchPlaceholderText={ls_search}
              renderSelectView={this.renderSelectVehicleSizePicker}
            />

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_vehicle_brand}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_vehicleBrand}
                placeholderTextColor="#ccc"
                value={this.state.vehicleBrand}
                onChangeText={this.handleVehicleBrandChange}
              />
            </View>

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_vehicle_modal}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_vehicleModel}
                placeholderTextColor="#ccc"
                value={this.state.vehicleModel}
                onChangeText={this.handleVehicleModelChange}
              />
            </View>

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_vehicle_color}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_vehicleColor}
                placeholderTextColor="#ccc"
                value={this.state.vehicleColor}
                onChangeText={this.handleVehicleColorChange}
              />
            </View>

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_vehicle_year}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_vehicleYear}
                placeholderTextColor="#ccc"
                maxLength={4}
                keyboardType="numeric"
                value={this.state.vehicleYear}
                onChangeText={this.handleVehicleYearChange}
              />
            </View>

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_license_plate}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_licensePlate}
                placeholderTextColor="#ccc"
                value={this.state.licensePlate}
                onChangeText={this.handleLicensePlateChange}
              />
            </View>

            <PickerModal
              items={fuelTypes}
              selected={selectedFuelType}
              onSelected={this.handleSelectFuelType}
              onClosed={this.handleSelectFuelTypeClose}
              backButtonDisabled
              showToTopButton={true}
              showAlphabeticalIndex={true}
              autoGenerateAlphabeticalIndex={true}
              searchPlaceholderText={ls_search}
              renderSelectView={this.renderSelectFuelTypePicker}
            />

            <View style={styles.signUpInputContainer}>
              <Image
                source={ic_engine_size}
                resizeMode="cover"
                style={styles.pinIcon}
              />
              <TextInput
                style={styles.inputDesign}
                placeholder={ls_engineSize}
                placeholderTextColor="#ccc"
                value={this.state.engineSize}
                onChangeText={this.handleEngineSizeChange}
              />
            </View>

            <TouchableHighlight
              underlayColor="transparent"
              onPress={this.handleChoosePhoto}
            >
              <View style={imagePickerContainerStyle}>
                <Image
                  source={ic_upload_photo}
                  resizeMode="cover"
                  style={styles.pinIcon}
                />
                <Text style={imagePickerLabelStyle}>{imagePickerLabel}</Text>
              </View>
            </TouchableHighlight>

            <PickerModal
              items={serviceFrequencies}
              selected={selectedServiceFrequency}
              onSelected={this.handleSelectServiceFrequency}
              onClosed={this.handleSelectServiceFrequencyClose}
              backButtonDisabled
              showToTopButton={true}
              showAlphabeticalIndex={true}
              autoGenerateAlphabeticalIndex={true}
              searchPlaceholderText={ls_search}
              renderSelectView={this.renderServiceFrequencyPicker}
            />

            <TouchableHighlight
              underlayColor="#27aa0480"
              onPress={submitButtonOnPress}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpButtonText}>{submitButtonTitle}</Text>
            </TouchableHighlight>
          </View>
        </KeyboardAwareScrollView>

        {this.state.showProcessingLoader && <ProcessingLoader />}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  addVehicleContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  formContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  signUpInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cfcfcf",
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
    color: "#000",
    fontSize: 16,
  },
  signUpButton: {
    width: 100,
    height: 40,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
