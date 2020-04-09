/*
	Allows user to create a new account
*/

import React, {Component, Fragment} from 'react';
import {StyleSheet, SafeAreaView, View, Alert} from 'react-native';
import {Formik} from 'formik';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import * as yup from 'yup';
import ErrorMessage from '../components/ErrorMessage';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class SignUp extends Component {
  handleSubmit = values => {
    if (
      values.given_name.length > 0 &&
      values.family_name.length > 0 &&
      values.email.length > 0 &&
      values.password.length > 0
    ) {
      // send post request
      return (
        fetch(baseUrl + '/user/', {
          method: 'POST',
          headers: {
            Accept: 'applicaation/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            given_name: values.given_name,
            family_name: values.family_name,
            email: values.email,
            password: values.password,
          }),
        })
          // when response recieved
          .then(response => {
            if (response.status == '201') {
              Alert.alert('Account created');
              setTimeout(() => {
                this.props.navigation.navigate('Login');
              }, 3000);
            } else {
              Alert.alert('Account creation failed');
              setTimeout(() => {
                this.props.navigation.navigate('Login');
              }, 3000);
            }
          })
          .catch(error => {
            console.error(error);
          })
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Formik
          initialValues={{
            given_name: '',
            family_name: '',
            email: '',
            password: '',
          }}
          onSubmit={values => {
            this.handleSubmit(values);
          }}
          validationSchema={validationSchema}>
          {({
            handleChange,
            values,
            handleSubmit,
            errors,
            isValid,
            isSubmitting,
            touched,
          }) => (
            <Fragment>
              <FormInput // first name input
                name="Given Name"
                value={values.given_name}
                placeholder="First Name"
                onChangeText={handleChange('given_name')}
              />
              <ErrorMessage // first name error
                errorValue={touched.given_name && errors.given_name}
              />
              <FormInput // last name input
                name="Family Name"
                value={values.family_name}
                placeholder="Last Name"
                onChangeText={handleChange('family_name')}
              />
              <ErrorMessage // last name error
                errorValue={touched.family_name && errors.family_name}
              />
              <FormInput // email input
                name="Email"
                value={values.email}
                placeholder="Email"
                onChangeText={handleChange('email')}
              />
              <ErrorMessage // email error
                errorValue={touched.email && errors.email}
              />
              <FormInput // password input
                name="Password"
                value={values.password}
                placeholder="Password"
                secureTextEntry
                onChangeText={handleChange('password')}
              />
              <ErrorMessage // password error
                errorValue={touched.password && errors.password}
              />

              <View style={styles.buttonContainer}>
                <FormButton
                  buttonType="outline"
                  onPress={handleSubmit}
                  title="Sign Up"
                  disabled={!isValid || isSubmitting}
                  loading={isSubmitting}
                />
              </View>
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
  },
  buttonContainer: {
    margin: 25,
  },
});

const validationSchema = yup.object().shape({
  given_name: yup
    .string()
    .label('First Name')
    .min(2, 'Too short')
    .max(20, 'Too Long')
    .required('Please enter your first name'),
  family_name: yup
    .string()
    .label('Last Name')
    .min(2, 'Too short')
    .max(20, 'Too Long')
    .required('Please enter your last name'),
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
