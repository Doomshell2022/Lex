// API
import { makeRequest } from "../api/ApiInfo";

// User Preference
import { KEYS, getData } from "../api/UserPreference";

const uploadToken = async (fcmToken) => {
  try {
    // fetching userInfo
    const userInfo = await getData(KEYS.USER_INFO);

    if (userInfo) {
      const { userId } = userInfo;

      // preparing params
      const params = {
        userId,
        token: fcmToken,
      };

      // calling api
      const response = await makeRequest("uploadToken", params);
      return response;
    }
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

export default uploadToken;
