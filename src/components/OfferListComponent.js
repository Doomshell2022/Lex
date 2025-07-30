import React from "react";
import {
  Text,
  View,
  Clipboard,
  StyleSheet,
  TouchableHighlight
} from "react-native";

// Components
import showToast from "../components/CustomToast";

// Localization
import { localizedStrings } from "../localization/Locale";

const OfferListComponent = props => {
  const { ls_codeCopied } = localizedStrings;

  const handleOfferDetail = () => {
    Clipboard.setString(props.item.promoCode);
    showToast(ls_codeCopied);
  };

  return (
    <TouchableHighlight underlayColor="#ffffff80" onPress={handleOfferDetail}>
      <View style={styles.offerContainer}>
        <Text style={styles.offerTitle}>{props.item.promoCode}</Text>

        <Text style={styles.offerDetail}>{props.item.message}</Text>

        <Text style={styles.description}>{props.item.description}</Text>

        <Text style={styles.validity}>{props.item.expiryDate}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default OfferListComponent;

const styles = StyleSheet.create({
  offerContainer: {
    padding: 8,
    backgroundColor: "#fff"
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#27aa04",
    marginBottom: 6
  },
  offerDetail: {
    width: "100%",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4
  },
  description: {
    width: "100%",
    fontSize: 13,
    marginBottom: 10
  },
  validity: {
    fontSize: 12,
    alignSelf: "flex-end"
  }
});
