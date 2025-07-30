import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import CheckBox from "react-native-check-box";

export default class BookServiceCheckBoxComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: false,
    };
  }

  handleCheckBoxClick = () => {
    this.setState(
      (prevState) => ({ isChecked: !prevState.isChecked }),
      () => {
        // Calling callback to mark service
        const { handleSelectService, info } = this.props;
        handleSelectService(this.state.isChecked, info.id);
      }
    );
  };

  render() {
    const { name, price } = this.props.info;

    return (
      <View style={styles.option}>
        <CheckBox
          style={styles.checkBox}
          rightText={name}
          isChecked={this.state.isChecked}
          onClick={this.handleCheckBoxClick}
        />

        <Text style={styles.serviceAmount}>L{price}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkBox: {
    flex: 1,
  },
  serviceAmount: {
    color: "#27aa04",
    fontWeight: "bold",
  },
});
