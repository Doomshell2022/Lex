import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableHighlight
} from "react-native";

// Icons
import ic_home from "../assets/icons/ic_home.png";
import ic_user from "../assets/icons/ic_user.png";
import ic_order from "../assets/icons/ic_order.png";
import ic_offer from "../assets/icons/ic_offer.png";

// Localization
import { localizedStrings } from "../localization/Locale";

const FooterComponent = props => {
  const handleHome = () => {
    props.nav.navigate("Main");
  };

  const handleOrder = () => {
    props.nav.navigate("Order");
  };

  const handleOffer = () => {
    props.nav.navigate("Offer");
  };

  const handleProfile = () => {
    props.nav.navigate("Profile");
  };

  const { ls_home, ls_order, ls_offer, ls_profile } = localizedStrings;

  return (
    <View style={styles.headerContainer}>
      <TouchableHighlight
        underlayColor="transparent"
        onPress={handleHome}
        style={styles.footerOption}
      >
        <View style={styles.footerOptionContent}>
          <Image
            source={ic_home}
            resizeMode="cover"
            style={styles.footerOptionIcon}
          />
          <Text style={styles.footerOptionText}>{ls_home}</Text>
        </View>
      </TouchableHighlight>

      <TouchableHighlight
        underlayColor="transparent"
        onPress={handleOrder}
        style={styles.footerOption}
      >
        <View style={styles.footerOptionContent}>
          <Image
            source={ic_order}
            resizeMode="cover"
            style={styles.footerOptionIcon}
          />
          <Text style={styles.footerOptionText}>{ls_order}</Text>
        </View>
      </TouchableHighlight>

      <TouchableHighlight
        underlayColor="transparent"
        onPress={handleOffer}
        style={styles.footerOption}
      >
        <View style={styles.footerOptionContent}>
          <Image
            source={ic_offer}
            resizeMode="cover"
            style={styles.footerOptionIcon}
          />
          <Text style={styles.footerOptionText}>{ls_offer}</Text>
        </View>
      </TouchableHighlight>

      <TouchableHighlight
        underlayColor="transparent"
        onPress={handleProfile}
        style={styles.footerOption}
      >
        <View style={styles.footerOptionContent}>
          <Image
            source={ic_user}
            resizeMode="cover"
            style={styles.footerOptionIcon}
          />
          <Text style={styles.footerOptionText}>{ls_profile}</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default FooterComponent;

const styles = StyleSheet.create({
  headerContainer: {
    height: 44,
    backgroundColor: "#014f7d",
    flexDirection: "row",
    alignItems: "center"
  },
  footerOption: {
    flex: 1
  },
  footerOptionContent: {
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerOptionIcon: {
    width: 20,
    height: 20
  },
  footerOptionText: {
    fontSize: 12,
    color: "#fff"
  }
});
