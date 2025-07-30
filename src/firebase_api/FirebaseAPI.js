import {Platform, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {nsNavigate} from '../routes/NavigationService';
import uploadToken from './UploadTokenAPI';
import {homeScreenFetchNotificationCount} from '../screens/HomeScreen';

export let isAppOpenedByRemoteNotificationWhenAppClosed = false;

const CHANNEL_ID = 'lex'; // ✅ ek hi channel use karo

// Create Android Notification Channel
const createAndroidNotificationChannel = async () => {
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Lex Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  } catch (error) {
    console.error('Failed to create notification channel:', error.message);
  }
};

// Check and Request Notification Permission
export const checkPermission = async () => {
  try {
    const authStatus = await messaging().hasPermission();
    if (authStatus) {
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
    await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
    });

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
    console.log('✅ FCM Token:', fcmToken);

    if (fcmToken) {
      const response = await uploadToken(fcmToken);
      if (response?.success !== 1) {
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
    // Foreground notifications
    thisArg.onNotificationListener = messaging().onMessage(
      async remoteMessage => {
        console.log('Foreground notification:', remoteMessage);

        if (Platform.OS === 'ios') {
          Alert.alert(
            remoteMessage.notification?.title || 'Notification',
            remoteMessage.notification?.body || 'You have a new message',
          );
        }

        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          android: {
            channelId: CHANNEL_ID,
            smallIcon: 'ic_notification', // res/drawable/ic_notification.png hona chahiye
          },
          ios: {
            sound: 'default',
          },
        });

        if (homeScreenFetchNotificationCount) {
          await homeScreenFetchNotificationCount();
        }
      },
    );

    // Background notification tapped
    thisArg.onNotificationOpenedListener = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Background notification tapped:', remoteMessage);
        nsNavigate('Notification');
      },
    );

    // Notification opened app (cold start)
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('App opened by notification:', initialNotification);
      isAppOpenedByRemoteNotificationWhenAppClosed = true;
      nsNavigate('Notification');
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
