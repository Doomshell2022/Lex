import React, { Component } from "react";
import {
  Text,
  View,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableHighlight
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { CreditCardInput } from "react-native-credit-card-input";
import CheckBox from "react-native-check-box";

// Components
import FetchingLoader from "../components/FetchingLoader";

// Images
import cardImageFront from "../assets/images/card-front.png";
import cardImageBack from "../assets/images/card-back.png";

// API
import { makeRequest } from "../api/ApiInfo";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class CardPendingPaymentScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isChecked: false
    };

    // fetching navigation params
    this.info = this.props.navigation.getParam("info", null);
  }

  componentDidMount() {
    // setting values in card fields
    if (this.info) {
      const { card } = this.info;
      const { CCInput } = this.refs;

      if (card && CCInput) {
        const { number, expiry } = card;
        CCInput.setValues({ number, expiry });
      }
    }
  }

  handleCreditCardInputChange = form => {
    this.cardForm = form;
  };

  handlePayment = async () => {
    try {
      const { cardForm } = this;

      if (!cardForm) {
        Alert.alert("", "Please fill card details", [{ text: "OK" }], {
          cancelable: false
        });

        return;
      }

      const { valid } = cardForm;

      if (valid && this.info) {
        // starting loader
        this.setState({ isProcessing: true });

        // preparing info
        const { params: receivedParams, refreshOrdersList } = this.info;

        // preparing params
        const { number, cvc, expiry } = cardForm.values;
        const cardNumber = number.replace(/ /g, "");
        const cardExpiry = expiry.replace("/", "");

        let params = {
          ...receivedParams,
          cardNumber,
          cardExpiry,
          cvv: cvc
        };

        // adding optional param 'saveCard'
        if (this.state.isChecked) {
          const cardDetail = { number, expiry };
          params.saveCard = JSON.stringify(cardDetail);
        }

        // calling api
        const response = await makeRequest("payByCardPendingAmount", params);

        // stopping loader
        this.setState({ isProcessing: false });

        // processing response
        const { sucess, message } = response;

        if (sucess) {
          // navigating to my orders
          this.props.navigation.navigate("MyOrder");

          // refreshing orders
          refreshOrdersList();
        } else {
          Alert.alert("", message, [{ text: "OK" }], {
            cancelable: false
          });
        }
      } else {
        Alert.alert("", "Filled card data is not valid!", [{ text: "OK" }], {
          cancelable: false
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleBack = () => {
    this.props.navigation.pop();
  };

  handleCheckBoxClick = () => {
    this.setState(prevState => ({
      isChecked: !prevState.isChecked
    }));
  };

  render() {
    const {
      ls_enterYourCardDetails,
      ls_cardNumber,
      ls_expiry,
      ls_saveCardForFutureUse,
      ls_proceedToPay,
      ls_processingPayment
    } = localizedStrings;

    const cardLabels = {
      number: ls_cardNumber,
      expiry: ls_expiry,
      cvc: "CVC/CCV"
    };

    return (
      <SafeAreaView style={styles.container}>
        <TouchableHighlight
          underlayColor="transparent"
          onPress={this.handleBack}
          style={styles.crossButton}
        >
          <Text style={styles.crossButtonTitle}>X</Text>
        </TouchableHighlight>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{ls_enterYourCardDetails}</Text>

            <View style={styles.cardView}>
              <CreditCardInput
                ref="CCInput"
                onChange={this.handleCreditCardInputChange}
                labels={cardLabels}
                cardImageFront={cardImageFront}
                cardImageBack={cardImageBack}
              />
            </View>

            {!this.info.card && (
              <CheckBox
                style={styles.checkBox}
                rightText={ls_saveCardForFutureUse}
                rightTextStyle={styles.checkBoxTitle}
                isChecked={this.state.isChecked}
                onClick={this.handleCheckBoxClick}
              />
            )}

            <TouchableHighlight
              underlayColor="#27aa0480"
              onPress={this.handlePayment}
              style={styles.payButton}
            >
              <Text style={styles.payButtonText}>{ls_proceedToPay}</Text>
            </TouchableHighlight>
          </View>
        </ScrollView>

        {this.state.isProcessing && (
          <FetchingLoader message={ls_processingPayment} />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  crossButton: {
    width: 26,
    aspectRatio: 1 / 1,
    backgroundColor: "#000",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 6,
    marginRight: 6
  },
  crossButtonTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500"
  },
  scrollContainer: {
    flex: 1,
    alignItems: "center"
  },
  contentContainer: {
    flex: 1,
    width: "90%",
    alignItems: "center"
  },
  title: {
    color: "#000",
    fontSize: 20,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 40
  },
  cardView: {
    width: "100%"
  },
  payButton: {
    width: 160,
    height: 40,
    marginTop: "auto",
    marginBottom: 20,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16
  },
  checkBox: {
    width: "100%",
    marginLeft: 20,
    marginTop: 8,
    padding: 4
  },
  checkBoxTitle: {
    fontSize: 15
  }
});
