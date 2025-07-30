import React, {Component} from 'react';
import {StyleSheet, ScrollView, Text, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import HeaderComponent from '../components/HeaderComponent';
import {localizedStrings} from '../localization/Locale';

export default class TermsAndConditionsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
      isLoading: true,
    };
    this.url = 'https://www.lexcarwashapp.com/termsandconditions'; // assume it returns HTML or plain text
  }

  componentDidMount() {
    this.loadTerms();
  }

  loadTerms = async () => {
    try {
      const response = await fetch(this.url);
      const text = await response.text();

      // Optional: remove HTML tags if needed
      const plainText = text.replace(/<\/?[^>]+(>|$)/g, '');

      this.setState({content: plainText, isLoading: false});
    } catch (error) {
      console.log('Error loading terms:', error.message);
      this.setState({content: 'Failed to load terms.', isLoading: false});
    }
  };

  render() {
    const {ls_termsAndConditions} = localizedStrings;
    const {content, isLoading} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          title={ls_termsAndConditions}
          nav={this.props.navigation}
        />

        {isLoading ? (
          <ActivityIndicator size="large" style={{marginTop: 32}} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.paragraph}>{content}</Text>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
});
