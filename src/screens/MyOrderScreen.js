import React, { Component } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { SafeAreaView } from "react-navigation";

// Components
import CustomLoader from "../components/CustomLoader";
import HeaderComponent from "../components/HeaderComponent";
import FooterComponent from "../components/FooterComponent";

// Tabs
import AllOrderTab from "./AllOrderTab";
import OngoingOrderTab from "./OngoingOrderTab";
import LastOrderTab from "./LastOrderTab";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// to create orders tab
const createAllOrdersTab = (info) => () => <AllOrderTab info={info} />;
const createOngoingOrdersTab = (info) => () => <OngoingOrderTab info={info} />;
const createLastOrdersTab = (info) => () => <LastOrderTab info={info} />;

let orderTabs = null;

// Localization
import { localizedStrings } from "../localization/Locale";

export default class MyOrderScreen extends Component {
  constructor(props) {
    super(props);

    const { ls_all, ls_ongoing, ls_last } = localizedStrings;

    this.state = {
      isLoading: true,

      tabView: {
        index: 0,
        routes: [
          { key: "AllOrderTab", title: ls_all },
          { key: "OngoingOrderTab", title: ls_ongoing },
          { key: "LastOrderTab", title: ls_last },
        ],
      },
    };

    this.initialLayout = {
      height: 0,
      width: Dimensions.get("window").width,
    };
  }

  componentDidMount() {
    this.fetchMyOrders();
  }

  fetchMyOrders = async () => {
    try {
      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo) {
        const { userId } = userInfo;

        // preparing params
        const params = {
          userId: userId,
        };

        // starting loader
        this.setState({ isLoading: true });

        // calling api
        const response = await makeRequest("myOrders", params);

        // processing response
        const { success, message } = response;

        if (success) {
          const { orderInfo: orders } = response;

          const { ls_noOngoingOrders, ls_noLastOrders } = localizedStrings;

          // filtering for ongoing orders
          const ongoingOrders = orders.filter(
            (order) => order.serviceStatus === "Pending"
          );

          // filtering for last orders
          const lastOrders = orders.filter(
            (order) => order.serviceStatus === "Complete"
          );

          // creating orders tabs
          const allOrdersTab = createAllOrdersTab({
            orders: orders,
            status: null,
            nav: this.props.navigation,
            refreshOrdersList: this.refreshOrdersList,
          });

          const ongoingOrdersTab = createOngoingOrdersTab({
            orders: ongoingOrders,
            status: ongoingOrders.length === 0 ? ls_noOngoingOrders : null,
            nav: this.props.navigation,
            refreshOrdersList: this.refreshOrdersList,
          });

          const lastOrdersTab = createLastOrdersTab({
            orders: lastOrders,
            status: lastOrders.length === 0 ? ls_noLastOrders : null,
            nav: this.props.navigation,
          });

          orderTabs = { allOrdersTab, ongoingOrdersTab, lastOrdersTab };

          // stopping loader
          this.setState({ isLoading: false });
        } else {
          // creating orders tabs
          const allOrdersTab = createAllOrdersTab({
            orders: null,
            status: message,
          });

          const ongoingOrdersTab = createOngoingOrdersTab({
            orders: [],
            status: message,
          });

          const lastOrdersTab = createLastOrdersTab({
            orders: [],
            status: message,
          });

          orderTabs = { allOrdersTab, ongoingOrdersTab, lastOrdersTab };

          // stopping loader
          this.setState({ isLoading: false });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  refreshOrdersList = async () => {
    try {
      await this.fetchMyOrders();
    } catch (error) {
      console.log(error.message);
    }
  };

  handleTabIndexChange = (index) => {
    let { tabView } = this.state;
    tabView.index = index;
    this.setState({ tabView: Object.create(tabView) });
  };

  renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "white" }}
      style={{
        backgroundColor: "#014f7d",
        borderTopColor: "#6ea5c4",
        borderTopWidth: 1,
      }}
    />
  );

  renderScene = () =>
    SceneMap({
      AllOrderTab: orderTabs.allOrdersTab,
      OngoingOrderTab: orderTabs.ongoingOrdersTab,
      LastOrderTab: orderTabs.lastOrdersTab,
    });

  render() {
    if (this.state.isLoading) {
      return <CustomLoader />;
    }

    const { ls_myOrders } = localizedStrings;

    return (
      <SafeAreaView style={styles.myOrder}>
        <HeaderComponent title={ls_myOrders} />

        <View style={styles.myOrderContainer}>
          <TabView
            navigationState={this.state.tabView}
            onIndexChange={this.handleTabIndexChange}
            renderScene={this.renderScene()}
            initialLayout={this.initialLayout}
            renderTabBar={this.renderTabBar}
          />
        </View>

        <FooterComponent nav={this.props.navigation} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  myOrder: {
    flex: 1,
    backgroundColor: "#f1f2f2",
  },
  myOrderContainer: {
    flex: 1,
  },
});
