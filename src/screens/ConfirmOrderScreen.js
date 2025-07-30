import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import RadioForm from "react-native-simple-radio-button";

// Components
import HeaderComponent from "../components/HeaderComponent";
// import showToast from '../components/CustomToast'
import FetchingLoader from "../components/FetchingLoader";
import ProcessingLoader from "../components/ProcessingLoader";

// Images
import ic_promo_code from "../assets/icons/ic_promo_code.png";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class ConfirmOrderScreen extends Component {
  constructor(props) {
    super(props);

    this.serviceInfo = this.props.navigation.getParam("serviceInfo", null);
    const serviceAmount = this.serviceInfo ? this.serviceInfo.serviceAmount : 0;

    this.state = {
      showFetchingLoader: false,
      showProcessingLoader: false,

      couponCode: "",
      paymentMode: 0,

      discount: "0",
      grandTotal: serviceAmount,
    };

    const { ls_cash, ls_creditCard } = localizedStrings;

    this.radio_props = [
      { label: ls_cash, value: 0 },
      { label: ls_creditCard, value: 1 },
    ];
  }

  handlePromoCodeChange = (couponCode) => {
    this.setState({ couponCode });
  };

  handlePaymentMode = (value) => {
    this.setState({ paymentMode: value });
  };

  handleApplyCoupon = async () => {
    try {
      const { couponCode } = this.state;

      if (couponCode != "") {
        const { serviceInfo } = this;

        if (serviceInfo) {
          // starting fetching loader
          this.setState({ showFetchingLoader: true });

          // preparing params
          const params = {
            serviceId: serviceInfo.serviceId,
            couponCode: couponCode,
          };

          // calling api
          const response = await makeRequest("applyCoupon", params);

          // stopping fetching loader
          this.setState({ showFetchingLoader: false });

          // processing response
          const { success, message } = response;

          if (success) {
            // processing discount
            this.couponInfo = response.coupon;
            const { discountPercent } = this.couponInfo;
            const { serviceAmount } = serviceInfo;

            const discount = Math.round(
              (serviceAmount * discountPercent) / 100
            );
            const grandTotal = serviceAmount - discount;

            this.setState({ discount, grandTotal });

            // Success Toast
            // showToast(message)
          } else {
            Alert.alert("", message, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        }
      } else {
        Alert.alert("", "Please enter coupon code!", [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handlePayNow = async () => {
    try {
      // starting processing loader
      this.setState({ showProcessingLoader: true });

      // fetching userInfo, serviceInfo and isSpecialService
      const userInfo = await getData(KEYS.USER_INFO);
      const { serviceInfo } = this;
      const isSpecialService = this.props.navigation.getParam(
        "isSpecialService",
        null
      );

      if (userInfo && serviceInfo && typeof isSpecialService === "boolean") {
        const { userId } = userInfo;
        const { serviceId } = serviceInfo;
        const { paymentMode } = this.state;

        // preparing params
        const params = {
          userId: userId,
          serviceId: serviceId,
          payMethod:
            (paymentMode === 0 && "Cash") || (paymentMode === 1 && "Card"),
        };

        if (this.couponInfo) {
          const { id: couponCodeId, discountPercent } = this.couponInfo;

          // adding to params
          params.couponCodeId = couponCodeId;
          params.discountPercent = discountPercent;
        }

        // Transferring control for Card Payment
        // if (paymentMode === 1) {
        //   // stopping processing loader
        //   this.setState({ showProcessingLoader: false });

        //   this.props.navigation.push("SelectCard", { params });
        //   return;
        // }

        // calling api
        const api = isSpecialService
          ? "specialServiceConfirm"
          : "serviceConfirm";
        const response = await makeRequest(api, params);

        // processing response
        if (response) {
          // stopping processing loader
          this.setState({ showProcessingLoader: false });

          const { success, message } = response;

          if (success) {
            // navigating to MyOrders
            this.props.navigation.navigate("Order");
          } else {
            Alert.alert("", message, [{ text: "OK" }], {
              cancelable: false,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleSeeOffers = () => {
    this.props.navigation.push("MyOffer", { isPushed: true });
  };

  handleRemoveCoupon = () => {
    if (this.serviceInfo) {
      this.setState({
        discount: "0",
        grandTotal: this.serviceInfo.serviceAmount,
        couponCode: "",
      });
    }
  };

  render() {
    const { serviceInfo } = this;

    if (serviceInfo) {
      const services = serviceInfo.services.join(", ");
      const serviceAmount = serviceInfo.serviceAmount;

      const {
        discount,
        grandTotal,
        showFetchingLoader,
        showProcessingLoader,
        couponCode,
      } = this.state;

      // localization
      const {
        ls_confirmOrder,
        ls_doYouHaveAnyPromotionalCode,
        ls_enterPromoCode,
        ls_seeOffers,
        ls_apply,
        ls_remove,
        ls_subtotal,
        ls_promo,
        ls_grandTotal,
        ls_book,
      } = localizedStrings;

      let couponButtonTitle = ls_seeOffers;
      let couponButtonAction = this.handleSeeOffers;

      if (couponCode.trim()) {
        if (discount === "0") {
          couponButtonTitle = ls_apply;
          couponButtonAction = this.handleApplyCoupon;
        } else {
          couponButtonTitle = ls_remove;
          couponButtonAction = this.handleRemoveCoupon;
        }
      }

      return (
        <SafeAreaView style={styles.confirmOrderContainer}>
          <HeaderComponent
            title={ls_confirmOrder}
            nav={this.props.navigation}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.confirmOrderContent}
          >
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailContent}>{services}</Text>
              <Text style={styles.amount}>L{serviceAmount}</Text>
            </View>

            <View style={styles.promoCode}>
              <Text style={styles.promoTitle}>
                {ls_doYouHaveAnyPromotionalCode}
              </Text>

              <View style={styles.promoContainer}>
                <View style={styles.signUpInputContainer}>
                  <Image
                    source={ic_promo_code}
                    resizeMode="cover"
                    style={styles.pinIcon}
                  />
                  <TextInput
                    style={styles.inputDesign}
                    placeholder={ls_enterPromoCode}
                    placeholderTextColor="#ccc"
                    value={this.state.couponCode}
                    onChangeText={this.handlePromoCodeChange}
                  />
                </View>

                <TouchableHighlight
                  underlayColor="#99999980"
                  onPress={couponButtonAction}
                  style={styles.couponButton}
                >
                  <Text style={styles.couponButtonText}>
                    {couponButtonTitle}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>

            <View style={styles.paymentOption}>
              <RadioForm
                radio_props={this.radio_props}
                initial={this.state.paymentMode}
                onPress={this.handlePaymentMode}
                buttonSize={16}
                buttonColor={"#505050"}
                selectedButtonColor={"#27aa04"}
                labelColor={"#505050"}
                labelStyle={styles.radioButtonLabel}
                style={styles.checkboxButton}
              />
            </View>

            <View style={styles.billingAmount}>
              <View style={styles.subtotal}>
                <Text style={styles.billingText}>{ls_subtotal}</Text>
                <Text style={styles.billingText}>L{serviceAmount}</Text>
              </View>

              <View style={styles.subtotal}>
                <Text style={styles.billingText}>
                  {ls_promo}
                  <Text style={styles.codeColor}>(CARWASH)</Text>
                </Text>
                <Text style={styles.billingText}>-L{discount}</Text>
              </View>

              <View style={[styles.subtotal, styles.grandTotal]}>
                <Text style={styles.billingText}>{ls_grandTotal}</Text>
                <Text style={styles.billingText}>L{grandTotal}</Text>
              </View>

              <TouchableHighlight
                underlayColor="#27aa0480"
                onPress={this.handlePayNow}
                style={styles.signUpButton}
              >
                <Text style={styles.signUpButtonText}>{ls_book}</Text>
              </TouchableHighlight>
            </View>
          </ScrollView>

          {showFetchingLoader && (
            <FetchingLoader message="Applying Promo Code..." />
          )}
          {showProcessingLoader && <ProcessingLoader />}
        </SafeAreaView>
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  confirmOrderContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
  },
  confirmOrderContent: {
    flex: 1,
  },
  orderDetail: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  orderDetailContent: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
  },
  amount: {
    width: 100,
    backgroundColor: "#27aa04",
    alignSelf: "center",
    textAlign: "center",
    paddingVertical: 10,
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  promoCode: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  promoTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  promoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  signUpInputContainer: {
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pinIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  inputDesign: {
    flex: 1,
    height: 40,
    fontSize: 13,
  },
  couponButton: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    marginLeft: 6,
  },
  couponButtonText: {
    fontSize: 12,
    color: "#999",
  },
  paymentOption: {
    height: 50,
    backgroundColor: "#f1f2f2",
    justifyContent: "center",
  },
  radioButtonLabel: {
    fontSize: 16,
    color: "#505050",
    marginRight: 20,
    marginLeft: 2,
  },
  checkboxButton: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  billingAmount: {
    padding: 10,
  },
  subtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  billingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  codeColor: {
    color: "#27aa04",
  },
  grandTotal: {
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  signUpButton: {
    backgroundColor: "#27aa04",
    width: 100,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
