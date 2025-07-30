import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableHighlight,
} from "react-native";

// Localization
import { localizedStrings } from "../localization/Locale";

const OrderListComponent = (props) => {
  const handlePayNow = () => {
    const { nav, item, refreshOrdersList } = props;
    nav.push("PendingPayment", { orderInfo: item, refreshOrdersList });
  };

  const handleItemTap = () => {
    const { nav, item, refreshOrdersList } = props;
    nav.push("OrderDetail", { orderInfo: item, refreshOrdersList });
  };

  const {
    isSpecialService,
    vehicleImage,
    vehicleBrand,
    vehicleModel,
    serviceDate,
    slot,
    totalAmount,
    couponDiscountAmount,
    paidAmount,
    pendingAmount,
  } = props.item;

  const { ls_payableAmount, ls_paidAmount, ls_pendingAmount, ls_payNow } =
    localizedStrings;

  // dynamic styles
  const serviceContainerStyle = {
    ...styles.serviceContainer,
  };

  if (isSpecialService) {
    serviceContainerStyle.backgroundColor = "#fffbe5";
  }

  return (
    <TouchableHighlight underlayColor="#ccc" onPress={handleItemTap}>
      <View style={serviceContainerStyle}>
        <Image
          source={{ uri: vehicleImage }}
          resizeMode="cover"
          style={styles.carImage}
        />

        <View style={styles.serviceInfo}>
          <Text style={styles.carName}>
            {vehicleBrand + " " + vehicleModel}
          </Text>

          <Text style={styles.paymentInfo}>
            {serviceDate}
            <Text style={styles.slot}>({slot})</Text>
          </Text>

          <Text style={styles.paymentInfo}>
            {ls_payableAmount}:
            <Text style={styles.amount}>
              {" L" + (totalAmount - couponDiscountAmount)}
            </Text>
          </Text>

          <Text style={styles.paymentInfo}>
            {ls_paidAmount}:<Text style={styles.amount}> L{paidAmount}</Text>
          </Text>

          <View style={styles.rowContainer}>
            <Text style={styles.paymentInfo}>
              {ls_pendingAmount}:
              <Text style={styles.amount}> L{pendingAmount}</Text>
            </Text>

            {/* {pendingAmount > 0 && (
              <TouchableHighlight
                style={styles.bookServiceButton}
                onPress={handlePayNow}
                underlayColor="#27aa0480"
              >
                <Text style={styles.bookServiceText}>{ls_payNow}</Text>
              </TouchableHighlight>
            )} */}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default OrderListComponent;

const styles = StyleSheet.create({
  serviceContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 2,
  },
  carImage: {
    width: 108,
    height: 90,
    borderRadius: 2,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 8,
  },
  carName: {
    fontSize: 13,
    fontWeight: "bold",
  },
  paymentInfo: {
    fontSize: 13,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    color: "#27aa04",
    fontWeight: "500",
  },
  slot: {
    color: "#8B0F00",
    fontSize: 12,
  },
  bookServiceButton: {
    padding: 6,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  bookServiceText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  editDelete: {
    alignItems: "center",
  },
});
