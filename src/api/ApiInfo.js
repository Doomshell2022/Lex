/* eslint-disable prettier/prettier */
import axios from 'axios';

// Base URL
const BASE_URL = 'https://www.lexcarwashapp.com/mobilenew/'; // Live Online Server

// Methods
export const makeRequest = async (api, params = null) => {
  try {
    let response;

    if (params) {
      // For POST with multipart/form-data
      const formData = new FormData();
      for (const key in params) {
        formData.append(key, params[key]);
      }

      response = await axios.post(BASE_URL + api, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // For GET request with no cache
      response = await axios.get(BASE_URL + api, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const makeRequestWithoutBaseURL = async (api, params = null) => {
  try {
    let response;

    if (params) {
      const formData = new FormData();
      for (const key in params) {
        formData.append(key, params[key]);
      }

      response = await axios.post(api, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      response = await axios.get(api, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
