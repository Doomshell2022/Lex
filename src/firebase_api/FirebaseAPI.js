import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {nsNavigate} from '../routes/NavigationService';

// API
import uploadToken from './UploadTokenAPI';

// Delegates
import {homeScreenFetchNotificationCount} from '../screens/HomeScreen';
// import {getData, KEYS} from '../api/UserPreference';

// References
export let isAppOpenedByRemoteNotificationWhenAppClosed = false;

// Create Android Notification Channel
const createAndroidNotificationChannel = async () => {
  try {
    await notifee.createChannel({
      id: 'lex',
      name: 'Lex Channel',
      importance: AndroidImportance.HIGH,
      description: 'Lex app notification channel',
    });
  } catch (error) {
    console.error('Failed to create notification channel:', error.message);
  }
};

// Check and Request Notification Permission
export const checkPermission = async () => {
  try {
    const enabled = await messaging().hasPermission();

    if (enabled) {
      // If permission granted, set up notification channel and fetch FCM token
      if (Platform.OS === 'android') {
        await createAndroidNotificationChannel();
      }
      await getToken();
    } else {
      await requestPermission();
    }
  } catch (error) {
    console.error('Error checking notification permission:', error.message);
  }
};

const requestPermission = async () => {
  try {
    // Request permission
    await messaging().requestPermission();

    // Set up notification channel and fetch FCM token
    if (Platform.OS === 'android') {
      await createAndroidNotificationChannel();
    }
    await getToken();
  } catch (error) {
    console.error('Error requesting notification permission:', error.message);
  }
};

// Fetch FCM Token
const getToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);

    if (fcmToken) {
      const response = await uploadToken(fcmToken);
      if (response?.success !== 1) {
        // Retry if upload fails
        await uploadToken(fcmToken);
      }
    }
  } catch (error) {
    console.error('Error fetching FCM token:', error.message);
  }
};

// Handle Token Refresh
const onTokenRefreshCallback = async fcmToken => {
  try {
    if (fcmToken) {
      const response = await uploadToken(fcmToken);
      if (response?.success !== 1) {
        // Retry if upload fails
        await uploadToken(fcmToken);
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error.message);
  }
};

export const createOnTokenRefreshListener = thisArg => {
  thisArg.onTokenRefreshListener = messaging().onTokenRefresh(
    onTokenRefreshCallback,
  );
};

export const removeOnTokenRefreshListener = thisArg => {
  if (thisArg.onTokenRefreshListener) {
    thisArg.onTokenRefreshListener();
  }
};

// Notification Listeners
export const createNotificationListeners = async thisArg => {
  try {
    // Handle notifications received in the foreground
    thisArg.onNotificationListener = messaging().onMessage(
      async remoteMessage => {
        console.log('Foreground notification:', remoteMessage);

        // Display notification using Notifee
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          android: {
            channelId: 'ezypayroll',
            smallIcon: 'ic_notification', // Ensure you have this icon in res/drawable
          },
        });

        // Fetch notification count for HomeScreen
        if (homeScreenFetchNotificationCount) {
          await homeScreenFetchNotificationCount();
        }
      },
    );

    // Handle notifications tapped in the background
    thisArg.onNotificationOpenedListener = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Background notification tapped:', remoteMessage);
        nsNavigate('Notification'); // Navigate to Notification screen
      },
    );

    // Handle notification that opened the app (app was closed)
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('App opened by notification:', initialNotification);
      isAppOpenedByRemoteNotificationWhenAppClosed = true;
      // Handle navigation or other actions here
    }
  } catch (error) {
    console.error('Error creating notification listeners:', error.message);
  }
};

export const removeNotificationListeners = thisArg => {
  if (thisArg.onNotificationListener) {
    thisArg.onNotificationListener();
  }
  if (thisArg.onNotificationOpenedListener) {
    thisArg.onNotificationOpenedListener();
  }
};

export const resetIsAppOpenedByRemoteNotificationWhenAppClosed = () => {
  isAppOpenedByRemoteNotificationWhenAppClosed = false;
};
// import {Platform} from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import notifee, {AndroidImportance} from '@notifee/react-native';
// import {nsNavigate} from '../routes/NavigationService';
// import uploadToken from './UploadTokenAPI';
// import {Alert} from 'react-native';

// export let isAppOpenedByRemoteNotificationWhenAppClosed = false;

// const createAndroidNotificationChannel = async () => {
//   try {
//     await notifee.createChannel({
//       id: 'ezypayroll',
//       name: 'Ezypayroll Channel',
//       importance: AndroidImportance.HIGH,
//       sound: 'default',
//     });
//   } catch (error) {
//     console.log('Error creating notification channel:', error.message);
//   }
// };

// export const checkPermission = async () => {
//   try {
//     const enabled = await messaging().hasPermission();
//     if (enabled) {
//       if (Platform.OS === 'android') {
//         await createAndroidNotificationChannel();
//       }
//       await getToken();
//     } else {
//       await requestPermission();
//     }
//   } catch (error) {
//     console.error('Error checking notification permission:', error.message);
//   }
// };

// const requestPermission = async () => {
//   try {
//     await messaging().requestPermission({
//       alert: true,
//       badge: true,
//       sound: true,
//     });

//     if (Platform.OS === 'android') {
//       await createAndroidNotificationChannel();
//     }
//     await getToken();
//   } catch (error) {
//     console.error('Error requesting notification permission:', error.message);
//   }
// };

// const getToken = async () => {
//   try {
//     const fcmToken = await messaging().getToken();
//     console.log('FCM Token:', fcmToken);
//     if (fcmToken) {
//       const response = await uploadToken(fcmToken);
//       if (response?.success !== 1) {
//         await uploadToken(fcmToken);
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching FCM token:', error.message);
//   }
// };

// const onTokenRefreshCallback = async fcmToken => {
//   try {
//     if (fcmToken) {
//       const response = await uploadToken(fcmToken);
//       if (response?.success !== 1) {
//         await uploadToken(fcmToken);
//       }
//     }
//   } catch (error) {
//     console.error('Error refreshing token:', error.message);
//   }
// };

// export const createNotificationListeners = async thisArg => {
//   try {
//     // Foreground notifications
//     thisArg.onNotificationListener = messaging().onMessage(
//       async remoteMessage => {
//         console.log('iOS Foreground Notification:', remoteMessage);
//         Alert.alert(
//           remoteMessage.notification?.title || 'Notification',
//           remoteMessage.notification?.body || 'You have a new message',
//         );

//         await notifee.displayNotification({
//           title: remoteMessage.notification?.title || 'Notification',
//           body: remoteMessage.notification?.body || 'Message received',
//           android: {
//             channelId: 'ezypayroll',
//             smallIcon: 'ic_notification',
//           },
//           ios: {
//             sound: 'default',
//           },
//         });
//       },
//     );

//     // Background notification tapped
//     thisArg.onNotificationOpenedListener = messaging().onNotificationOpenedApp(
//       remoteMessage => {
//         console.log('iOS Background Notification Tapped:', remoteMessage);
//         nsNavigate('Notification'); // Navigate to your Notification screen
//       },
//     );

//     // Handle notification that opened the app from a closed state
//     const initialNotification = await messaging().getInitialNotification();
//     if (initialNotification) {
//       console.log('iOS App Opened by Notification:', initialNotification);
//       isAppOpenedByRemoteNotificationWhenAppClosed = true;
//       nsNavigate('Notification'); // Handle navigation or custom action
//     }
//   } catch (error) {
//     console.error('Error setting notification listeners:', error.message);
//   }
// };
