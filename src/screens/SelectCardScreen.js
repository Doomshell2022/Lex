import React, { Component } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { SafeAreaView } from "react-navigation";

// Components
import HeaderComponent from "../components/HeaderComponent";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class SelectCardScreen extends Component {
  constructor(props) {
    super(props);

    const { ls_fetchingCards } = localizedStrings;

    this.state = {
      cards: null,
      status: ls_fetchingCards,
    };
  }

  componentDidMount() {
    this.fetchSavedCards();
  }

  fetchSavedCards = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        // preparing params
        const { userId } = userInfo;
        const params = { userId };

        // calling api
        const response = await makeRequest("getCards", params);

        // parsing response
        if (response) {
          const { success } = response;

          if (success) {
            const { cards } = response;

            this.setState({
              cards,
              status: null,
            });
          } else {
            const { message } = response;

            this.setState({
              status: message,
              cards: null,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  handleCardSelect = (card) => {
    if (card) {
      return () => {
        // fetching navigation params
        const params = this.props.navigation.getParam("params", null);

        if (params) {
          this.props.navigation.push("CardPayment", { info: { params, card } });
        }
      };
    }

    return null;
  };

  renderItem = ({ item }) => {
    const { cardDetail } = item;
    const cardObj = JSON.parse(cardDetail);
    const { number } = cardObj;

    const numberArr = number.split(" ");
    const cardNumber =
      numberArr[0] + " ...." + " .... " + numberArr[numberArr.length - 1];

    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={this.handleCardSelect(cardObj)}
      >
        <View style={styles.addressContainer}>
          <Text style={styles.address}>{cardNumber}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  handleUseAnotherCard = () => {
    // fetching navigation params
    const params = this.props.navigation.getParam("params", null);

    if (params) {
      this.props.navigation.push("CardPayment", { info: { params } });
    }
  };

  render() {
    const { status, cards } = this.state;

    const { ls_selectCardToPay, ls_useAnotherCard } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          title={ls_selectCardToPay}
          nav={this.props.navigation}
        />

        {status ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{status}</Text>
          </View>
        ) : (
          <FlatList
            data={cards}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ItemSeparatorComponent={this.itemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        )}

        <TouchableHighlight
          underlayColor="#27aa0480"
          onPress={this.handleUseAnotherCard}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{ls_useAnotherCard}</Text>
        </TouchableHighlight>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efeff1",
  },
  addressContainer: {
    flex: 1,
    height: 50,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 2,
    justifyContent: "center",
  },
  address: {
    color: "#000",
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  listContentContainer: {
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#949494",
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: "#27aa04",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});
