/*
	Shows the profile of other chittr users
*/

import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  View,
  AsyncStorage,
} from 'react-native';
import {Button, ListItem} from 'react-native-elements';
import FormButton from '../components/FormButton';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class OtherProfile extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userID: '',
      userDetails: {},
      followers: [],
      following: [],
      isFollowing: false,
      auth: {},
    };
  }

  // go to followers page
  goToFollowers = () => {
    this.props.navigation.navigate('Followers');
  };

  // go to following page
  goToFollowing = () => {
    this.props.navigation.navigate('Following');
  };

  // get other user
  getUser = async () => {
    try {
      let response = await AsyncStorage.getItem('auth');
      let authKey = (await JSON.parse(response)) || {};
      let id = JSON.parse(await AsyncStorage.getItem('id'));
      this.setState({
        auth: authKey,
        userID: id,
      });
      this.getData(id);
      this.getFollowers(id);
      this.getFollowing(id);
    } catch (err) {
      console.log(err);
    }
  };

  // get other user's data
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

  // get other user's followers
  getFollowers = id => {
    return fetch(baseUrl + '/user/' + id + '/followers')
      .then(response => response.json())
      .then(responseJson => {
        let result = responseJson.filter(
          obj => obj.user_id == this.state.auth.id,
        );
        console.log(result);
        if (result.length == 1) {
          this.setState({
            isFollowing: true,
          });
        }
        this.setState({
          followers: responseJson,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  // get other user's folliwing
  getFollowing = id => {
    return fetch(baseUrl + '/user/' + id + '/following')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          isLoading: false,
          following: responseJson,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.getUser();
  }

  // follow other user
  follow = () => {
    let id = this.state.userID;
    let key = this.state.auth.token;

    if (this.state.isFollowing == true) {
      // send delete request, unfollow
      return (
        fetch(baseUrl + '/user/' + id + '/follow', {
          method: 'DELETE',
          withCredentials: true,
          headers: {
            'X-Authorization': key,
            'Content-Type': 'application/json',
          },
        })
          // when response is recieved
          .then(response => {
            if (response.status == '200') {
              this.setState({
                isFollowing: false,
              });
            }
            console.log(response.status);
          })
          .catch(error => {
            console.log(error);
          })
      );
    } else {
      // send post request, follow
      return (
        fetch(baseUrl + '/user/' + id + '/follow', {
          method: 'POST',
          withCredentials: true,
          headers: {
            'X-Authorization': key,
            'Content-Type': 'application/json',
          },
        })
          // when response is recieved
          .then(response => {
            if (response.status == '200') {
              this.setState({
                isFollowing: true,
              });
            }
            console.log(response.status);
          })
          .catch(error => {
            console.log(error);
          })
      );
    }
  };

  render() {
    if (this.state.isLoading) {
      // if loading then show loading
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.buttonContainer}>
            <FormButton // follow/following button
              buttonType="outline"
              onPress={() => this.follow()}
              title={this.state.isFollowing == false ? 'Follow' : 'Following'}
            />
          </View>
        </View>
        <View>
          <View style={styles.bodyContent}>
            <Text>
              {this.state.userDetails.given_name}{' '}
              {this.state.userDetails.family_name}
            </Text>
            <Text>{this.state.userDetails.email}</Text>
            <View style={styles.followerContainer}>
              <Button // go to followers button
                title={'Followers ' + this.state.followers.length}
                onPress={() => this.goToFollowers()}
              />
              <Button // go to following button
                title={'Following ' + this.state.following.length}
                onPress={() => this.goToFollowing()}
              />
            </View>
          </View>
        </View>
        <FlatList // list of recent chits
          data={this.state.userDetails.recent_chits}
          renderItem={({item}) => (
            <ListItem
              title={item.chit_content}
              subtitle={new Date(item.timestamp).toUTCString()}
              onPress={() => console.log('check chit')}
            />
          )}
          keyExtractor={chit_id => chit_id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'blue',
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
  },
  buttonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  followerContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    margin: 20,
  },
});
