import React from "react";
import {
  Text,
  View,
  Alert,
  Image,
  StyleSheet,
  TouchableHighlight,
} from "react-native";

// Icons
import ic_edit from "../assets/icons/ic_edit.png";
import ic_delete from "../assets/icons/ic_delete.png";
import ic_book_service_white from "../assets/icons/ic_book_service_white.png";
import ic_book_special_service_white from "../assets/icons/ic_book_special_service_white.png";

// Localization
import { localizedStrings } from "../localization/Locale";

const VehicleListComponent = (props) => {
  const handleBookService = () => {
    props.nav.push("BookService", { vehicleInfo: props.item });
  };

  const handleBookSpecialService = () => {
    props.nav.push("BookSpecialService", { vehicleInfo: props.item });
  };

  const handleEditVehicle = () => {
    props.nav.push("AddVehicle", {
      vehicleInfo: props.item,
      refreshCallback: props.refreshCallback,
    });
  };

  const {
    ls_deleteTitle,
    ls_deleteMessage,
    ls_cancel,
    ls_ok,
  } = localizedStrings;

  const handleDeleteVehicle = () => {
    Alert.alert(
      ls_deleteTitle,
      ls_deleteMessage,
      [
        { text: ls_cancel, style: "cancel" },
        { text: ls_ok, onPress: handleDeleteOkPress },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteOkPress = async () => {
    try {
      await props.deleteVehicleCallback(props.item.vehicleId);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.serviceContainer}>
      <Image
        source={{ uri: props.item.vehicleImg }}
        resizeMode="cover"
        style={styles.carImage}
      />

      <View style={styles.serviceInfo}>
        <Text style={styles.carName}>{props.item.vehicleBrand}</Text>

        <Text style={styles.carType}>{props.item.modal}</Text>

        <View style={styles.serviceButtonContainer}>
          <TouchableHighlight
            underlayColor="#27aa0480"
            onPress={handleBookService}
            style={styles.bookServiceButton}
          >
            <Image
              source={ic_book_special_service_white}
              resizeMode="cover"
              style={styles.bookServiceIcon}
            />
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="#27aa0480"
            onPress={handleBookSpecialService}
            style={styles.bookServiceButton}
          >
            <Image
              source={ic_book_service_white}
              resizeMode="cover"
              style={styles.bookServiceIcon}
            />
          </TouchableHighlight>
        </View>
      </View>

      <View style={styles.editDelete}>
        <TouchableHighlight
          underlayColor="#1995dd80"
          onPress={handleEditVehicle}
          style={[styles.icon, styles.editIcon]}
        >
          <Image source={ic_edit} resizeMode="cover" style={styles.iconImage} />
        </TouchableHighlight>

        <TouchableHighlight
          underlayColor="#e2161980"
          onPress={handleDeleteVehicle}
          style={[styles.icon, styles.deleteIcon]}
        >
          <Image
            source={ic_delete}
            resizeMode="cover"
            style={styles.iconImage}
          />
        </TouchableHighlight>
      </View>
    </View>
  );
};

export default VehicleListComponent;

const styles = StyleSheet.create({
  serviceContainer: {
    backgroundColor: "#fff",
    borderRadius: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  carImage: {
    width: 100,
    height: 84,
    borderRadius: 2,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  carName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceButtonContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  bookServiceButton: {
    marginRight: 10,
    backgroundColor: "#27aa04",
    borderRadius: 4,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  bookServiceIcon: {
    height: 22,
    aspectRatio: 1 / 1,
  },
  editDelete: {
    alignItems: "center",
  },
  icon: {
    width: 36,
    height: 36,
    backgroundColor: "#1995dd",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    marginBottom: 5,
  },
  deleteIcon: {
    backgroundColor: "#e21619",
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});
