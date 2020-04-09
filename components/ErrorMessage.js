import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ErrorMessage = ({errorType}) => (
  <View style={styles.container}>
    <Text>{errorType}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

export default ErrorMessage;
