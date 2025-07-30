/* eslint-disable prettier/prettier */
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

// Login Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import ForgotPinScreen from '../screens/ForgotPinScreen';
import TemporaryPinScreen from '../screens/TemporaryPinScreen';
import NewPinScreen from '../screens/NewPinScreen';

// Home Screens
import HomeScreen from '../screens/HomeScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import CurrentLocationScreen from '../screens/CurrentLocationScreen';
import ConfirmOrderScreen from '../screens/ConfirmOrderScreen';
import SelectCardScreen from '../screens/SelectCardScreen';
import CardPaymentScreen from '../screens/CardPaymentScreen';
import BookSpecialServiceScreen from '../screens/BookSpecialServiceScreen';

// Order Screens
import MyOrderScreen from '../screens/MyOrderScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import PendingPaymentScreen from '../screens/PendingPaymentScreen';
import SelectCardPendingPaymentScreen from '../screens/SelectCardPendingPaymentScreen';
import CardPendingPaymentScreen from '../screens/CardPendingPaymentScreen';
import ReviewScreen from '../screens/ReviewScreen';

// Offer Screens
import OfferScreen from '../screens/OfferScreen';

// Profile Screens
import ProfileScreen from '../screens/ProfileScreen';
import ResetPinScreen from '../screens/ResetPinScreen';

// Notification Screen
import NotificationScreen from '../screens/NotificationScreen';

// ----- Stack Navigators -----
const LoggedOutNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    SignUp: SignUpScreen,
    TermsAndConditions: TermsAndConditionsScreen,
    ForgotPin: ForgotPinScreen,
    TemporaryPin: TemporaryPinScreen,
    NewPin: NewPinScreen,
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
  },
);

const HomeNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    AddVehicle: AddVehicleScreen,
    BookService: BookServiceScreen,
    BookSpecialService: BookSpecialServiceScreen,
    CurrentLocation: CurrentLocationScreen,
    ConfirmOrder: ConfirmOrderScreen,
    SelectCard: SelectCardScreen,
    CardPayment: CardPaymentScreen,
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);

const OrderNavigator = createStackNavigator(
  {
    MyOrder: MyOrderScreen,
    OrderDetail: OrderDetailScreen,
    PendingPayment: PendingPaymentScreen,
    SelectCardPendingPayment: SelectCardPendingPaymentScreen,
    CardPendingPayment: CardPendingPaymentScreen,
    Review: ReviewScreen,
  },
  {
    initialRouteName: 'MyOrder',
    headerMode: 'none',
  },
);

const OfferNavigator = createStackNavigator(
  {
    MyOffer: OfferScreen,
  },
  {
    initialRouteName: 'MyOffer',
    headerMode: 'none',
  },
);

const ProfileNavigator = createStackNavigator(
  {
    MyProfile: ProfileScreen,
    ResetPin: ResetPinScreen,
  },
  {
    initialRouteName: 'MyProfile',
    headerMode: 'none',
  },
);

// ----- Logged In Switch Navigator -----
const LoggedInNavigator = createSwitchNavigator(
  {
    Main: HomeNavigator,
    Order: OrderNavigator,
    Offer: OfferNavigator,
    Profile: ProfileNavigator,
    Notification: NotificationScreen,
  },
  {
    initialRouteName: 'Main',
  },
);

// ----- Root Switch Navigator (exported function) -----
export const createRootNavigator = isLoggedIn => {
  return createAppContainer(
    createSwitchNavigator(
      {
        LoggedOut: LoggedOutNavigator,
        LoggedIn: LoggedInNavigator,
      },
      {
        initialRouteName: isLoggedIn ? 'LoggedIn' : 'LoggedOut',
      },
    ),
  );
};
