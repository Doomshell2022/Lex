import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import RadioForm from "react-native-simple-radio-button";
import { SafeAreaView } from "react-navigation";

// Components
import HeaderComponent from "../components/HeaderComponent";
import ProcessingLoader from "../components/ProcessingLoader";
import showToast from "../components/CustomToast";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class PendingPaymentScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showProcessingLoader: false,
      paymentMode: 0,
    };

    const { ls_cash, ls_creditCard } = localizedStrings;

    this.radio_props = [
      { label: ls_cash, value: 0 },
      { label: ls_creditCard, value: 1 },
    ];

    this.orderInfo = this.props.navigation.getParam("orderInfo", null);
    this.refreshOrdersList = this.props.navigation.getParam(
      "refreshOrdersList",
      null
    );
  }

  handlePaymentMode = (value) => {
    this.setState({ paymentMode: value });
  };

  handlePayNow = async () => {
    try {
      // fetching userInfo and orderInfo
      const userInfo = await getData(KEYS.USER_INFO);
      const { orderInfo, refreshOrdersList } = this;

      if (userInfo && orderInfo && refreshOrdersList) {
        // starting processing loader
        this.setState({ showProcessingLoader: true });

        const { userId } = userInfo;
        const { orderId: serviceId } = orderInfo;
        const { paymentMode } = this.state;

        // preparing params
        const params = {
          userId,
          serviceId,
          // methodType:
          //   (paymentMode === 0 && "Cash") || (paymentMode === 1 && "Card"),
        };

        // // Transferring control for Card Payment
        // if (paymentMode === 1) {
        //   // stopping processing loader
        //   this.setState({ showProcessingLoader: false });

        //   this.props.navigation.push("SelectCardPendingPayment", {
        //     info: { params, refreshOrdersList }
        //   });
        //   return;
        // }

        // calling api
        const response = await makeRequest("payByCashPendingAmount", params);

        // stopping processing loader
        this.setState({ showProcessingLoader: false });

        // processing response
        const { success } = response;

        if (success) {
          // Navigating to My Orders
          this.props.navigation.navigate("MyOrder");

          // Refreshing Orders
          refreshOrdersList();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    const { pendingAmount } = this.orderInfo;
    const { showProcessingLoader } = this.state;

    const { ls_pendingPayment, ls_pendingAmount, ls_payPendingAmount } =
      localizedStrings;

    return (
      <SafeAreaView style={styles.confirmOrderContainer}>
        <HeaderComponent
          title={ls_pendingPayment}
          nav={this.props.navigation}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.confirmOrderContent}
        >
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailContent}>{ls_pendingAmount}</Text>
            <Text style={styles.amount}>L{pendingAmount}</Text>
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

          <TouchableHighlight
            underlayColor="#27aa0480"
            onPress={this.handlePayNow}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpButtonText}>{ls_payPendingAmount}</Text>
          </TouchableHighlight>
        </ScrollView>

        {showProcessingLoader && <ProcessingLoader />}
      </SafeAreaView>
    );
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
    color: "#333",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  amount: {
    width: 100,
    backgroundColor: "#00BFFF",
    alignSelf: "center",
    textAlign: "center",
    paddingVertical: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 10,
  },
  paymentOption: {
    height: 50,
    marginTop: 20,
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
  signUpButton: {
    height: 44,
    marginTop: 50,
    padding: 10,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
