import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

// Components
import OrderListComponent from "../components/OrderListComponent";

export default class OngoingOrderTab extends Component {
  renderItem = ({ item }) => {
    const { nav, refreshOrdersList } = this.props.info;

    return (
      <OrderListComponent
        item={item}
        nav={nav}
        refreshOrdersList={refreshOrdersList}
      />
    );
  };

  keyExtractor = (item, index) => index.toString();

  itemSeparator = () => <View style={styles.separator} />;

  render() {
    const { orders, status } = this.props.info;

    if (orders.length > 0) {
      return (
        <View style={styles.myOrderContainer}>
          <FlatList
            data={orders}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ItemSeparatorComponent={this.itemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        </View>
      );
    }

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{status}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },
  myOrderContainer: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
  listContentContainer: {
    paddingVertical: 8,
    marginHorizontal: 8,
  },
});
