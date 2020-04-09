/*
	Allows user edit profile, name, image and email
*/

import React, {Component, Fragment} from 'react';
import {StyleSheet, View, Alert, AsyncStorage} from 'react-native';
import {Formik} from 'formik';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import * as yup from 'yup';
import ErrorMessage from '../components/ErrorMessage';
import {Avatar} from 'react-native-elements';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class EditProfile extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      isLodaing: true,
      photo: '',
      userDetails: {},
      auth: {},
    };
  }

  // when profile information is submitted
  handleSubmit = values => {
    // send patch request
    return (
      fetch(baseUrl + '/user/' + this.state.auth.id, {
        method: 'PATCH',
        withCredentials: true,
        headers: {
          'X-Authorization': this.state.auth.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          given_name: values.given_name,
          family_name: values.family_name,
          email: values.email,
          password: values.password,
        }),
      })
        // when response is recieved
        .then(response => {
          if (response.status == '201') {
            Alert.alert('Profile updated');
          } else {
            Alert.alert('Failed to update profile');
          }
        })
        .catch(error => {
          console.error(error);
        })
    );
  };

  // if image is pressed
  imagePressed = () => {
    this.props.navigation.navigate('EditPhoto');
  };

  // get current user
  getUser = async () => {
    try {
      let response = await AsyncStorage.getItem('auth');
      let authKey = (await JSON.parse(response)) || {};
      this.setState({
        auth: authKey,
      });
      this.getData(this.state.auth.id);
      this.getPhoto(this.state.auth.id);
    } catch (err) {
      console.log(err);
    }
  };

  // get current user's photo
  getPhoto = id => {
    return fetch(baseUrl + '/user/' + id + '/photo')
      .then(response => response.blob())
      .then(image => {
        let reader = new FileReader();
        reader.onload = () => {
          this.setState({
            isLoading: false,
            photo: reader.result,
          });
        };
        reader.readAsDataURL(image);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // get current user's information
  getData = id => {
    return fetch(baseUrl + '/user/' + id)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          isLoading: false,
          userDetails: responseJson,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.getUser();
  }

  render() {
    return (
      <View style={styles.container}>
        <Formik
          enableReinitialize
          initialValues={this.state.userDetails}
          onSubmit={values => {
            this.handleSubmit(values);
          }}
          validationSchema={validationSchema}>
          {({handleChange, values, handleSubmit, errors, touched}) => (
            <Fragment>
              <View style={styles.buttonContainer}>
                <FormButton // save button
                  buttonType="outline"
                  onPress={handleSubmit}
                  title="Save"
                />
              </View>
              <Avatar // profile photo
                style={styles.avatar}
                source={{uri: this.state.photo}}
                onPress={() => this.imagePressed()}
              />
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
                secureTextEntry={true}
                onChangeText={handleChange('password')}
              />
              <ErrorMessage // password error
                errorValue={touched.password && errors.password}
              />
            </Fragment>
          )}
        </Formik>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  avatar: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    position: 'absolute',
  },
  buttonContainer: {
    margin: 20,
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
