/*
	Screen to allow user login
*/

import React, {Component, Fragment} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Alert,
  AsyncStorage,
} from 'react-native';
import {Button} from 'react-native-elements';
import {Formik} from 'formik';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import * as yup from 'yup';
import ErrorMessage from '../components/ErrorMessage';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class Login extends Component {
  // when login is submit
  handleSubmit = values => {
    // send post request
    if (values.email.length > 0 && values.password.length > 0) {
      return (
        fetch(baseUrl + '/login', {
          method: 'POST',
          headers: {
            Accept: 'applicaation/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        })
          // when response is recieved
          .then(response => {
            if (response.status == '200') {
              this.props.navigation.navigate('Home');
              return response.json();
            } else {
              Alert.alert('Wrong email/password!');
              return {};
            }
          })
          .then(responseJson => {
            console.log(responseJson);
            this.storeAuth('auth', responseJson);
          })
          .catch(error => {
            console.error(error);
          })
      );
    }
  };

  // go to signup page
  goToSignup = () => this.props.navigation.navigate('SignUp');

  // store authentication
  storeAuth = async (key, item) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Formik
          initialValues={{email: '', password: ''}}
          onSubmit={values => {
            this.handleSubmit(values);
          }}
          validationSchema={validationSchema}>
          {({handleChange, values, handleSubmit, errors, isValid, touched}) => (
            <Fragment>
              <FormInput // email input
                name="Email"
                value={values.email}
                placeholder="Enter Email"
                onChangeText={handleChange('email')}
              />
              <ErrorMessage // email error
                errorValue={touched.email && errors.email}
              />
              <FormInput // password input
                name="Password"
                value={values.password}
                placeholder="Enter Password"
                secureTextEntry
                onChangeText={handleChange('password')}
              />
              <ErrorMessage // password error
                errorValue={touched.password && errors.password}
              />
              <View style={styles.buttonContainer}>
                <FormButton // login button
                  buttonType="outline"
                  onPress={handleSubmit}
                  title="Login"
                  buttonColor="#039BE5"
                  disabled={!isValid}
                />
              </View>
              <Button // sign up button
                title="Sign Up"
                onPress={this.goToSignup}
              />
            </Fragment>
          )}
        </Formik>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    margin: 20,
  },
});

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .label('Email')
    .email('Enter a valid email')
    .required('Please enter your email'),
  password: yup
    .string()
    .label('Password')
    .required()
    .min(5, 'Password must have at least 5 characters'),
});
