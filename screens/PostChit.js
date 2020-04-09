/*
	Allows the user to create and post chits
*/

import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  Image,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {Button, Icon, Overlay, ListItem} from 'react-native-elements';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {NavigationEvents} from 'react-navigation';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class PostChit extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      showDraft: false,
      draft: null,
      chitId: '',
      auth: {},
      image: null,
      location: null,
      coords: null,
      locationPermission: false,
      text: '',
      numChar: 141,
    };
  }

  handleDraft = msg => {
    let temp = this.state.draft.filter(item => item.msg != msg);
    this.setState({
      showDraft: false,
      draft: temp,
      text: msg,
    });
  };

  // handle the location of user
  handleLocation = () => {
    if (!this.state.locationPermission) {
      this.state.locationPermission = requestLocationPermission();
    }
    Geolocation.getCurrentPosition(
      position => {
        let coords = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };

        this.setState({coords});

        Geocoder.from(position.coords.latitude, position.coords.longitude)
          .then(json => {
            let addressComponent = json.results[5].formatted_address;
            this.setState({
              location: addressComponent,
            });
            console.log(addressComponent);
          })
          .catch(err => console.log(err));
      },
      error => {
        Alert.alert(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  };

  receivedImage = image => {
    this.setState({image});
  };

  handleImage = () => {
    this.props.navigation.navigate('Photo', {
      receivedImage: this.receivedImage,
    });
  };

  uploadPhoto = async () => {
    await this.getChitId(this.state.auth.id);
    let chitId = this.state.chitId;
    let token = this.state.auth.token;
    await this.postPhoto(token, chitId);
  };

  postPhoto = (token, id) => {
    // send post request
    return (
      fetch(baseUrl + '/chits/' + id + '/photo', {
        method: 'POST',
        withCredentials: true,
        headers: {
          'X-Authorization': token,
          'Content-Type': 'image/jpeg',
        },
        body: this.state.image,
      })
        // when response is recieved
        .then(response => {
          console.log('Photo added');
          this.setState({
            image: null,
          });
        })
        .catch(error => {
          console.log(error);
        })
    );
  };
  postChit = token => {
    //send post request
    if (this.state.coords == null) {
      return (
        fetch(baseUrl + '/chits', {
          method: 'POST',
          withCredentials: true,
          headers: {
            'X-Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: Date.parse(new Date()),
            chit_content: this.state.text,
          }),
        })
          // when response is recieved
          .then(response => {
            if (response.status == '201') {
              if (this.state.image != null) {
                this.uploadPhoto();
              }
              Alert.alert('Chit posted');
              // reset state
              this.setState({
                text: '',
                numChar: 141,
                coords: null,
                location: null,
              });
            } else {
              Alert.alert('Chit post failed');
            }
          })
      );
    } else {
      // send post request
      return (
        fetch(baseUrl + '/chits', {
          method: 'POST',
          withCredentials: true,
          headers: {
            'X-Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: Date.parse(new Date()),
            chit_content: this.state.text,
            location: this.state.coords,
          }),
        })
          // when response recieved
          .then(response => {
            if (response.status == '201') {
              if (this.state.image != null) {
                this.uploadPhoto();
              }
              Alert.alert('Chit posted');
              this.setState({
                text: '',
                numChar: 141,
                coords: null,
                location: null,
              });
            } else {
              Alert.alert('Chit post failed');
            }
          })
      );
    }
  };

  // get current user
  getUser = async () => {
    try {
      let response = await AsyncStorage.getItem('auth');
      let authKey = (await JSON.parse(response)) || {};
      this.setState({
        auth: authKey,
      });
      console.log(this.state.auth);
    } catch (err) {
      console.log(err);
    }
    try {
      let resp = await AsyncStorage.getItem('draft');
      let draft = (await JSON.parse(resp)) || [];
      let result = await draft.filter(item => item.id == this.state.auth.id);
      this.setState({
        draft: result,
      });
      console.log(this.state.draft);
    } catch (err) {
      console.log(err);
    }
  };

  // get chit id
  getChitId = id => {
    return fetch(baseUrl + '/user/' + id)
      .then(response => response.json())
      .then(responseJson => {
        let id = responseJson.recent_chits[0].chit_id;
        this.setState({
          chitId: id,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  resetInOverlay = () => {
    this.setState({
      isVisible: false,
      draft: null,
      image: null,
      location: null,
      coords: null,
      locationPermission: false,
      text: '',
      numChar: 141,
    });
    this.props.navigation.navigate('Home');
  };

  // Geocoder is initiate here
  componentDidMount() {
    this.getUser();
    Geocoder.init('AIzaSyDCbAbkl8akmZnC5p2rehOXQAkdn863tpw');
  }

  render() {
    return (
      <View>
        <NavigationEvents onDidFocus={() => this.getUser()} />
        <View style={{flexDirection: 'row', marginLeft: 20, marginTop: 20}}>
          <Icon
            name="close"
            type="evilicon"
            size={40}
            onPress={() => this.setState({isVisible: true})}
          />
        </View>
        <Overlay
          isVisible={this.state.showDraft}
          onBackdropPress={() => this.setState({showDraft: false})}>
          <View>
            <FlatList
              keyExtractor={index => index.toString()}
              data={this.state.draft}
              renderItem={({item}) => (
                <ListItem
                  title={item.msg}
                  onPress={() => {
                    this.handleDraft(item.msg);
                  }}
                />
              )}
            />
          </View>
        </Overlay>
        <Overlay
          width="auto"
          height="auto"
          isVisible={this.state.isVisible}
          onBackdropPress={() => this.setState({isVisible: false})}>
          <View style={{margin: 50}}>
            <Text>Save draft</Text>
            <View>
              <Button
                title="Delete"
                onPress={async () => {
                  try {
                    let tempList = [];
                    if (this.state.draft != null) {
                      tempList = this.state.draft;
                    }
                    let draft = await JSON.stringify(tempList);
                    await AsyncStorage.setItem('draft', draft);
                  } catch (err) {
                    console.log(err);
                  }
                  this.resetInOverlay();
                }}
              />
              <Button
                title="Save"
                onPress={async () => {
                  try {
                    let tempList = [];
                    if (this.state.draft != null) {
                      tempList = this.state.draft;
                    }
                    let resp = await tempList.push({
                      id: this.state.auth.id,
                      msg: this.state.text,
                    });
                    let draft = await JSON.stringify(tempList);
                    await AsyncStorage.setItem('draft', draft);
                  } catch (err) {
                    console.log(err);
                  }
                  this.resetInOverlay();
                }}
              />
            </View>
          </View>
        </Overlay>
        <TextInput
          style={styles.textbox}
          multiline={true}
          numberOfLines={5}
          maxLength={141}
          placeholder={'Type chit here'}
          onChangeText={text =>
            this.setState({text, numChar: 141 - text.length})
          }
          value={this.state.text}
        />
        <View style={styles.buttonContainer}>
          {this.state.draft != null && (
            <Button
              title="draft"
              onPress={() => this.setState({showDraft: true})}
            />
          )}
          <Icon
            name="image"
            type="evilicon"
            size={55}
            onPress={this.handleImage}
          />
          <Icon
            name="location"
            type="evilicon"
            size={55}
            onPress={this.handleLocation}
          />
          <Text style={styles.counter}>{this.state.numChar}</Text>
          <Button
            title="Chit"
            onPress={() => {
              this.postChit(this.state.auth.token);
            }}
          />
        </View>
        {this.state.location != null && (
          <View style={styles.addOn}>
            <Text> Location: {this.state.location}</Text>
            <Icon
              name="close-o"
              type="evilicon"
              size={25}
              onPress={() => {
                this.setState({
                  location: null,
                });
              }}
            />
          </View>
        )}
        {this.state.image != null && (
          <View style={styles.addOn}>
            <Image
              source={this.state.image}
              style={{width: 200, height: 200}}
            />
            <Icon
              name="close-o"
              type="evilicon"
              size={30}
              onPress={() => {
                this.setState({
                  image: null,
                });
              }}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textbox: {
    fontSize: 25,
    marginLeft: 20,
  },
  counter: {
    fontSize: 25,
    marginRight: 20,
  },
  buttonContainer: {
    margin: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addOn: {
    flexDirection: 'row',
    padding: 15,
  },
});
async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app requires access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can access location');
      return true;
    } else {
      console.log('Location permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
  }
}
