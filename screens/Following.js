/*
	Shows list of following
*/

import React, {Component} from 'react';
import {StyleSheet, View, FlatList, AsyncStorage} from 'react-native';
import {ListItem} from 'react-native-elements';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';
const profilePic = require('../images/default.jpg');

export default class Following extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      followingList: [],
    };
  }

  // go to other profile page
  moreDetails = id => {
    this.storeId(id);
    this.props.navigation.push('OtherProfile');
  };

  // id of other profile
  storeId = async id => {
    try {
      await AsyncStorage.setItem('id', JSON.stringify(id));
    } catch (error) {
      console.log(error.message);
    }
  };

  // get current user's following
  getFollowing = async () => {
    let id = JSON.parse(await AsyncStorage.getItem('id'));
    return fetch(baseUrl + '/user/' + id + '/following')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          followingList: responseJson,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.getFollowing();
  }

  render() {
    return (
      <View style={styles.viewStyle}>
        <FlatList // list of following
          data={this.state.followingList}
          renderItem={({item}) => (
            <ListItem // individual following
              leftAvatar={{source: {profilePic}}}
              title={`${item.given_name} ${item.family_name}`}
              subtitle={item.email}
              onPress={() => this.moreDetails(item.user_id)}
            />
          )}
          enableEmptySections={true}
          keyExtractor={index => String(index)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewStyle: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
});
