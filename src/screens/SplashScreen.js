import React from "react";
import { Image, ImageBackground, StyleSheet } from "react-native";

// Images
import backgroundImage from "../assets/images/backgroundImage.jpg";
import logo from "../assets/images/logo.png";

const SplashScreen = () => {
  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.container}
    >
      <Image source={logo} resizeMode="cover" style={styles.logo} />
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 200,
    height: 79,
    marginTop: -40
  }
});
