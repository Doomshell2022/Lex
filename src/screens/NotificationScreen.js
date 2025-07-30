import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-navigation";
import { firebase } from "@react-native-firebase/messaging";

// Components
import CustomLoader from "../components/CustomLoader";
import HeaderComponent from "../components/HeaderComponent";
import FooterComponent from "../components/FooterComponent";
import NotificationListComponent from "../components/NotificationListComponent";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class NotificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      notifications: null,
      status: null,
      isListRefreshing: false,
    };
  }

  componentDidMount() {
    this.fetchNotifications();
  }

  fetchNotifications = async () => {
    try {
      // starting loader
      this.setState({ isLoading: true });

      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const { userId } = userInfo;

        // preparing params
        const params = {
          userId,
        };

        // calling api
        const response = await makeRequest("notificationList", params);

        // processing response
        if (response) {
          const { success } = response;

          if (success) {
            const { notificationInfo: notifications } = response;
            this.setState({ notifications, status: null });

            // resetting notification count
            await this.resetNotificationCount(params);
          } else {
            const { message } = response;

            this.setState({
              status: message,
              notifications: null,
              isLoading: false,
              isListRefreshing: false,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  resetNotificationCount = async (params) => {
    try {
      // calling api
      const response = await makeRequest("resetNotificationCount", params);

      // processing response
      if (response) {
        const { success } = response;

        if (success) {
          firebase.notifications().removeAllDeliveredNotifications();
          this.setState({ isLoading: false, isListRefreshing: false });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleListRefresh = async () => {
    try {
      // pull-to-refresh
      this.setState({ isListRefreshing: true });

      // updating list
      await this.fetchNotifications();
    } catch (error) {
      console.log(error.message);
    }
  };

  renderItem = ({ item }) => <NotificationListComponent item={item} />;

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  render() {
    const { isLoading } = this.state;
    if (isLoading) {
      return <CustomLoader />;
    }

    const { notifications, status, isListRefreshing } = this.state;

    const { ls_notifications } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent title={ls_notifications} />

        {notifications ? (
          <FlatList
            data={notifications}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ItemSeparatorComponent={this.itemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            refreshing={isListRefreshing}
            onRefresh={this.handleListRefresh}
          />
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{status}</Text>
          </View>
        )}

        <FooterComponent nav={this.props.navigation} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efeff1",
  },
  listContentContainer: {
    padding: wp(2),
  },
  separator: {
    height: wp(2),
  },
  messageContainer: {
    flex: 1,
    padding: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#000",
    fontSize: wp(4),
    textAlign: "center",
  },
});
