import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Icons
import ic_back from "../assets/icons/ic_back.png";
import ic_bell from "../assets/icons/ic_bell.png";

const HeaderComponent = (props) => {
  const {
    nav,
    title,
    transparentBackground,
    showNotificationIcon,
    notificationCount,
  } = props;

  const handleBack = () => {
    nav.pop();
  };

  // container background configuration
  const containerBackgroundStyle = { backgroundColor: "#014f7d" };
  let containerStyle = [styles.headerContainer, containerBackgroundStyle];

  if (transparentBackground) {
    containerStyle = styles.headerContainer;
  }

  const handleNotification = () => {
    props.navObj.navigate("Notification");
  };

  const showNotificationBadge = notificationCount > 0;
  const isNotificationCountUpToTwoDigit = notificationCount < 100;

  return (
    <View style={containerStyle}>
      {nav && (
        <TouchableHighlight underlayColor="transparent" onPress={handleBack}>
          <Image source={ic_back} resizeMode="cover" style={styles.backIcon} />
        </TouchableHighlight>
      )}

      <Text style={styles.headerTitle}>{title}</Text>

      {showNotificationIcon && (
        <TouchableOpacity
          style={styles.notificationIconContainer}
          onPress={handleNotification}
        >
          <Image
            source={ic_bell}
            resizeMode="cover"
            style={styles.notificationIcon}
          />

          {showNotificationBadge && (
            <View style={styles.notificationBadgeContainer}>
              {isNotificationCountUpToTwoDigit ? (
                <Text style={styles.notificationBadge}>
                  {notificationCount}
                </Text>
              ) : (
                <Text style={styles.notificationBadge}>99+</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  headerContainer: {
    height: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
  },
  notificationIconContainer: {
    marginLeft: "auto",
    padding: wp(2),
  },
  notificationIcon: {
    width: wp(5.6),
    height: wp(5.6),
  },
  notificationBadgeContainer: {
    height: wp(3.3),
    paddingHorizontal: 3,
    backgroundColor: "red",
    borderRadius: wp(1.7),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: wp(2),
    left: wp(2),
  },
  notificationBadge: {
    flex: 1,
    color: "#fff",
    fontSize: wp(2.2),
    textAlign: "center",
  },
});
