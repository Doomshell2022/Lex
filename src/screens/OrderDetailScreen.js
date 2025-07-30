import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";

// Components
import HeaderComponent from "../components/HeaderComponent";

// Images
import ic_star from "../assets/icons/ic_star.png";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class OrderDetailScreen extends Component {
  constructor(props) {
    super(props);

    this.orderInfo = this.props.navigation.getParam("orderInfo", null);
    this.refreshOrdersList = this.props.navigation.getParam(
      "refreshOrdersList",
      null
    );
  }

  handleReview = () => {
    if (this.orderInfo) {
      const { orderId } = this.orderInfo;
      this.props.navigation.push("Review", { orderId });
    }
  };

  handlePayNow = () => {
    if (this.orderInfo && this.refreshOrdersList) {
      this.props.navigation.push("PendingPayment", {
        orderInfo: this.orderInfo,
        refreshOrdersList: this.refreshOrdersList,
      });
    }
  };

  renderPaymentHistory = (paymentHistory) => {
    const { ls_paid, ls_by, ls_on, ls_paymentHistory } = localizedStrings;

    const paymentHistoryInfo = paymentHistory.map((item, index) => {
      const { amount, mode, date } = item;

      return (
        <View style={styles.infoContainer} key={index}>
          <Text style={styles.info2}>
            {ls_paid} L{amount} {ls_by} {mode} {ls_on} {date}
          </Text>
        </View>
      );
    });

    return (
      <View style={styles.subContainer2}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{ls_paymentHistory}</Text>
        </View>
        {paymentHistoryInfo}
      </View>
    );
  };

  render() {
    if (this.orderInfo) {
      const {
        orderId,
        isSpecialService,
        vehicleImage,
        vehicleBrand,
        vehicleModel,
        serviceStatus,
        services,
        bookingDate,
        serviceDate,
        slot,
        washer,
        totalAmount,
        couponCode,
        couponDiscountPercent,
        couponDiscountAmount,
        paidAmount,
        pendingAmount,
        paymentMethod,
        transactionId,
        paymentHistory,
      } = this.orderInfo;

      const {
        ls_orderDetail,
        ls_orderId,
        ls_status,
        ls_services,
        ls_bookingDate,
        ls_serviceDate,
        ls_slot,
        ls_serviceTime,
        ls_washer,
        ls_totalAmount,
        ls_appliedCoupon,
        ls_payableAmount,
        ls_paidAmount,
        ls_pendingAmount,
        ls_paymentMethod,
        ls_transactionId,
        ls_payNow,
      } = localizedStrings;

      const serviceStatusColor = {
        color: serviceStatus === "Pending" ? "red" : "green",
      };
      const serviceStatusStyles = [styles.statusInfo, serviceStatusColor];

      const serviceTimeLabel = isSpecialService ? ls_serviceTime : ls_slot;

      return (
        <SafeAreaView style={styles.container}>
          <HeaderComponent title={ls_orderDetail} nav={this.props.navigation} />

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.subContainer1}>
              <Image
                source={{ uri: vehicleImage }}
                resizeMode="cover"
                style={styles.carImage}
              />

              <View style={styles.carDescription}>
                <Text style={styles.carTitle}>
                  {vehicleBrand + " " + vehicleModel}
                </Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.orderIdTitle}>{ls_orderId}: </Text>
                  <Text style={styles.orderIdInfo}>{orderId}</Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.orderIdTitle}>{ls_status}: </Text>
                  <Text style={serviceStatusStyles}>{serviceStatus}</Text>
                </View>
              </View>

              {serviceStatus === "Complete" && (
                <TouchableHighlight
                  style={styles.icon}
                  onPress={this.handleReview}
                  underlayColor="transparent"
                >
                  <Image
                    source={ic_star}
                    resizeMode="cover"
                    style={styles.iconImage}
                  />
                </TouchableHighlight>
              )}
            </View>

            <View style={styles.subContainer2}>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_services}:</Text>
                <Text style={styles.info}>{services.join(", ")}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_bookingDate}:</Text>
                <Text style={styles.info}>{bookingDate}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_serviceDate}:</Text>
                <Text style={styles.info}>{serviceDate}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{serviceTimeLabel}:</Text>
                <Text style={styles.info}>{slot}</Text>
              </View>

              {!isSpecialService && (
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{ls_washer}:</Text>
                  <Text style={styles.info}>{washer}</Text>
                </View>
              )}
            </View>

            <View style={styles.subContainer2}>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_totalAmount}:</Text>
                <Text style={[styles.info, { color: "green" }]}>
                  L{totalAmount}
                </Text>
              </View>

              {couponCode && (
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{ls_appliedCoupon}:</Text>
                  <Text style={[styles.info, { color: "green" }]}>
                    {couponCode}
                    <Text style={styles.couponDiscount}>
                      (-{couponDiscountPercent}%)
                    </Text>
                  </Text>
                </View>
              )}

              {couponCode && (
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{ls_payableAmount}:</Text>
                  <Text style={styles.info}>
                    L{totalAmount - couponDiscountAmount}
                  </Text>
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_paidAmount}:</Text>
                <Text style={styles.info}>L{paidAmount}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_pendingAmount}:</Text>
                <Text style={styles.info}>L{pendingAmount}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{ls_paymentMethod}:</Text>
                <Text style={styles.info}>{paymentMethod}</Text>
              </View>

              {paymentMethod === "Card" && (
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{ls_transactionId}:</Text>
                  <Text style={styles.info}>{transactionId}</Text>
                </View>
              )}
            </View>

            {paymentHistory && this.renderPaymentHistory(paymentHistory)}

            {pendingAmount > 0 && (
              <TouchableHighlight
                underlayColor="#0159AB80"
                onPress={this.handlePayNow}
                style={styles.payNowButton}
              >
                <Text style={styles.payNowButtonTitle}>{ls_payNow}</Text>
              </TouchableHighlight>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
  contentContainer: {
    padding: 8,
  },
  subContainer1: {
    flexDirection: "row",
    alignItems: "center",
    height: 110,
  },
  carImage: {
    width: 160,
    height: 110,
    borderRadius: 2,
  },
  carDescription: {
    flex: 1,
    height: "100%",
    padding: 8,
    justifyContent: "center",
  },
  carTitle: {
    color: "#00457B",
    fontSize: 18,
    fontWeight: "500",
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  title: {
    color: "#000",
    fontSize: 14,
    width: "30%",
  },
  info: {
    fontSize: 13,
    width: "70%",
  },
  info2: {
    fontSize: 13,
    width: "100%",
  },
  orderIdTitle: {
    color: "#000",
    fontSize: 14,
  },
  orderIdInfo: {
    color: "#8B0F00",
    fontSize: 13,
  },
  statusInfo: {
    fontSize: 13,
  },
  icon: {
    width: 36,
    height: 36,
    marginLeft: 4,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  subContainer2: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  couponDiscount: {
    color: "red",
  },
  payNowButton: {
    width: 130,
    height: 40,
    marginTop: 40,
    marginBottom: 4,
    backgroundColor: "#0159AB",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  payNowButtonTitle: {
    color: "#fff",
    fontSize: 14,
  },
});
