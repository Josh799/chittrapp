/* 
  Shows users profile page
  Requires login
*/
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  AsyncStorage,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import {ListItem, Avatar} from 'react-native-elements';
import FormButton from '../components/FormButton';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class Profile extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      isLodaing: true,
      photo: null,
      userDetails: {},
      auth: {},
    };
  }

  // remove user key
  removeUser = async () => {
    try {
      await AsyncStorage.removeItem('auth');
      console.log('key removed');
      this.setState({
        photo: null,
        userDetails: {},
        auth: {},
      });
    } catch (exception) {
      console.log(exception);
    }
  };

  // get current user
  getUser = async () => {
    let response = await AsyncStorage.getItem('auth');
    let authKey = (await JSON.parse(response)) || {};
    this.setState({
      auth: authKey,
    });
    this.getData(this.state.auth.id);
    this.getPhoto(this.state.auth.id);
  };

  // get current user's data
  getData = id => {
    return fetch(baseUrl + '/user/' + id)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          userDetails: responseJson,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  // get current user's profile photo
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

  componentDidMount() {
    this.getUser();
  }

  // when profile photo is pressed
  imagePressed = () => {
    this.props.navigation.navigate('EditPhoto');
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <NavigationEvents onDidFocus={() => this.getUser()} />
          <View style={styles.header}>
            <View style={styles.buttonContainer}>
              <FormButton
                buttonType="outline"
                onPress={() => this.props.navigation.navigate('EditProfile')}
                title="Edit"
              />
              <FormButton
                buttonType="outline"
                onPress={this.Logout}
                title="Logout"
              />
            </View>
          </View>
          <Avatar
            style={styles.avatar}
            source={{uri: this.state.photo}}
            onPress={() => this.imagePressed()}
          />
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text>
                {this.state.userDetails.given_name}{' '}
                {this.state.userDetails.family_name}
              </Text>
              <Text>{this.state.userDetails.email}</Text>
            </View>
          </View>
          <FlatList
            style={{marginTop: 80}}
            data={this.state.userDetails.recent_chits}
            renderItem={({item}) => (
              <ListItem
                title={item.chit_content}
                subtitle={new Date(item.timestamp).toUTCString()}
                bottomDivider
                chevron
                onPress={() => console.log('check chit')}
              />
            )}
            keyExtractor={chit_id => chit_id.toString()}
          />
        </View>
      );
    }
  }
  Logout = () => {
    // send post request
    return (
      fetch(baseUrl + '/logout', {
        method: 'POST',
        withCredentials: true,
        headers: {
          'X-Authorization': this.state.auth.token,
          'Content-Type': 'application/json',
        },
      })
        // when response recieved
        .then(response => {
          this.removeUser();
          this.props.navigation.navigate('Home');
        })
        .catch(function(error) {
          console.log(error);
        })
    );
  };
}

const styles = StyleSheet.create({
  header: {
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    position: 'absolute',
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
