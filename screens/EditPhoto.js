/*
	Changes the profile photo
*/

import React, {Component} from 'react';
import {View, Button, StyleSheet, AsyncStorage, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class EditPhoto extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      photo: null,
      auth: {},
    };
  }

  // get current user
  getUser = async () => {
    let response = await AsyncStorage.getItem('auth');
    let authKey = (await JSON.parse(response)) || {};
    this.setState({
      auth: authKey,
    });
  };

  //update profile photo
  updatePhoto = async () => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log(data);

      // send post request
      return fetch(baseUrl + '/user/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg',
          'X-Authorization': this.state.auth.token,
        },
        body: data,
      })
        .then(response => {
          Alert.alert('Profile photo updated');
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  componentDidMount() {
    this.getUser();
  }

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
        />
        <View style={styles.containerInner}>
          <Button
            onPress={this.takePicture.bind(this)}
            style={styles.capture}
            title={'Capture'}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'column'},
  containerInner: {flex: 0, flexDirection: 'row', justifyContent: 'center'},
  capture: {
    flex: 0,
    padding: 10,
    alignSelf: 'center',
  },
});
