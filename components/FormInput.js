import React from 'react';
import {Input, Icon} from 'react-native-elements';
import {StyleSheet, View} from 'react-native';

const FormInput = ({iconName, iconColor, name, placeholder}) => (
  <View style={styles.container}>
    <Input
      icon={<Icon name={iconName} size={20} color={iconColor} />}
      name={name}
      placeholder={placeholder}
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

export default FormInput;
