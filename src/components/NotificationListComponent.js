import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Images
import ic_notification_bell from "../assets/icons/ic_notification_bell.png";

const NotificationListComponent = (props) => {
  const { item } = props;
  const { title, message, created } = item;

  return (
    <View style={styles.container}>
      <View style={styles.notificationHeader}>
        <Image
          source={ic_notification_bell}
          resizeMode="cover"
          style={styles.bellIcon}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.notificationBody}>
        <Text style={styles.message}>{message}</Text>
      </View>

      <Text style={styles.date}>{created}</Text>
    </View>
  );
};

export default NotificationListComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 2,
    padding: wp(2),
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  bellIcon: {
    width: wp(5.4),
    aspectRatio: 1 / 1,
  },
  title: {
    color: "#333",
    fontSize: wp(4),
    fontWeight: "100",
    marginLeft: wp(2),
  },
  notificationBody: {
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    paddingBottom: hp(2),
  },
  message: {
    color: "#5a5a5a",
    fontSize: wp(3.2),
    textAlign: "justify",
  },
  date: {
    color: "#a6a6a6",
    fontSize: wp(2.6),
    marginTop: wp(2),
  },
});
