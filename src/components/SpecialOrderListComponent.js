import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableHighlight,
} from "react-native";

// Localization
import { localizedStrings } from "../localization/Locale";

const SpecialOrderListComponent = (props) => {
  const { item, nav } = props;

  const {
    vehicleImage,
    vehicleBrand,
    vehicleModel,
    serviceDate,
    serviceTime,
    serviceStatus,
    amount,
  } = item;

  const { ls_payableAmount, ls_status } = localizedStrings;

  const handleItemTap = () => {
    nav.push("SpecialOrderDetail", { orderInfo: item });
  };

  return (
    <TouchableHighlight underlayColor="#ccc" onPress={handleItemTap}>
      <View style={styles.serviceContainer}>
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
            <Text style={styles.slot}>({serviceTime})</Text>
          </Text>

          <Text style={styles.paymentInfo}>
            {ls_status}:<Text style={styles.slot}> {serviceStatus}</Text>
          </Text>

          {amount !== null && (
            <Text style={styles.paymentInfo}>
              {ls_payableAmount}:
              <Text style={styles.amount}>{" L" + amount}</Text>
            </Text>
          )}
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default SpecialOrderListComponent;

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
  amount: {
    color: "#27aa04",
    fontWeight: "500",
  },
  slot: {
    color: "#8B0F00",
  },
});
