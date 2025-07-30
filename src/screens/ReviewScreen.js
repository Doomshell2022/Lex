import React, { Component } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableHighlight
} from "react-native";
import { AirbnbRating } from "react-native-ratings";
import { SafeAreaView } from "react-navigation";

// Components
import HeaderComponent from "../components/HeaderComponent";
import ProcessingLoader from "../components/ProcessingLoader";
import showToast from "../components/CustomToast";

// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

// Localization
import { localizedStrings } from "../localization/Locale";

export default class ReviewScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showProcessingLoader: false,
      comment: ""
    };

    this.rating = 0;

    // fetching order id
    this.orderId = this.props.navigation.getParam("orderId", null);
  }

  handleCommentChange = changedText => {
    this.setState({ comment: changedText });
  };

  handleRatingChange = rating => {
    this.rating = rating;
  };

  handleSubmitReview = async () => {
    try {
      // Validation
      if (this.rating === 0) {
        Alert.alert("", "Please select some rating", [{ text: "OK" }]);
        return;
      }

      // fetching userInfo
      const userInfo = await getData(KEYS.USER_INFO);

      if (userInfo && this.orderId) {
        // starting loader
        this.setState({ showProcessingLoader: true });

        // preparing params
        const { userId } = userInfo;

        const params = {
          userId: userId,
          serviceId: this.orderId,
          ratingValue: this.rating,
          description: this.state.comment
        };

        // calling api
        const response = await makeRequest("reviews", params);

        // stopping loader
        this.setState({ showProcessingLoader: false });

        // processing response
        const { success, message } = response;

        if (success) {
          // navigating
          this.props.navigation.pop();

          // success toast
          setTimeout(() => {
            showToast(message);
          }, 300);
        } else {
          // error toast
          showToast(message);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    const {
      ls_orderReview,
      ls_rateThisService,
      ls_tellOthersHowIsYourExperienceWithUs,
      ls_comments,
      ls_submitReview
    } = localizedStrings;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent title={ls_orderReview} nav={this.props.navigation} />

        <ScrollView contentContainerStyle={styles.reviewContainer}>
          <View style={styles.starRating}>
            <Text style={styles.reviewHeading}>{ls_rateThisService}</Text>

            <Text style={styles.subHeading}>
              {ls_tellOthersHowIsYourExperienceWithUs}
            </Text>

            <AirbnbRating
              count={5}
              defaultRating={0}
              size={20}
              showRating={false}
              onFinishRating={this.handleRatingChange}
            />
          </View>

          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={ls_comments}
              placeholderTextColor={"#9E9E9E"}
              multiline={true}
              numberOfLines={4}
              value={this.state.comment}
              onChangeText={this.handleCommentChange}
            />
          </View>

          <TouchableHighlight
            underlayColor="#27aa0480"
            onPress={this.handleSubmitReview}
            style={styles.reviewButton}
          >
            <Text style={styles.reviewUpButtonText}>{ls_submitReview}</Text>
          </TouchableHighlight>
        </ScrollView>

        {this.state.showProcessingLoader && <ProcessingLoader />}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efeff1"
  },
  reviewContainer: {
    flex: 1,
    margin: 8
  },
  starRating: {
    marginBottom: 8,
    paddingVertical: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  },
  reviewHeading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 10
  },
  commentContainer: {
    marginBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff"
  },
  commentInput: {
    color: "#000",
    fontSize: 13
  },
  reviewButton: {
    width: 120,
    height: 40,
    marginTop: 15,
    backgroundColor: "#27aa04",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  reviewUpButtonText: {
    color: "#fff",
    fontSize: 14
  }
});
