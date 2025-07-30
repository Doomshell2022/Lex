import React, { Component } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-navigation";

// Components
import HeaderComponent from "../components/HeaderComponent";
import FooterComponent from "../components/FooterComponent";
import OfferListComponent from "../components/OfferListComponent";
import CustomLoader from "../components/CustomLoader";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class OfferScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      status: null,
      offers: null
    };

    // fetching received navigation params
    this.isScreenPushed = this.props.navigation.getParam("isPushed", null);
  }

  componentDidMount() {
    this.fetchOffers();
  }

  fetchOffers = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const userId = userInfo.userId;

        // calling api
        const response = await makeRequest("offer", { userId });

        // processing response
        const { success } = response;

        if (success) {
          const { offerInfo } = response;
          this.setState({ offers: offerInfo, status: null, isLoading: false });
        } else {
          const { message } = response;
          this.setState({ status: message, offers: null, isLoading: false });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  renderItem = ({ item }) => <OfferListComponent item={item} />;

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  render() {
    if (this.state.isLoading) {
      return <CustomLoader />;
    }

    const { ls_offers } = localizedStrings;

    let headerProps = { title: ls_offers };
    if (this.isScreenPushed) {
      headerProps.nav = this.props.navigation;
    }

    const { status, offers } = this.state;

    return (
      <SafeAreaView style={styles.offerContainer}>
        <HeaderComponent {...headerProps} />

        {status ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{status}</Text>
          </View>
        ) : (
          <FlatList
            data={offers}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ItemSeparatorComponent={this.itemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        )}

        {!this.isScreenPushed && (
          <FooterComponent nav={this.props.navigation} />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  offerContainer: {
    flex: 1,
    backgroundColor: "#efeff1"
  },
  separator: {
    height: 8
  },
  listContentContainer: {
    marginHorizontal: 8,
    paddingVertical: 8
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  messageText: {
    color: "#000",
    fontSize: 16
  }
});
