/*
	Allows user to search for other users
*/

import React, {Component} from 'react';
import {StyleSheet, View, FlatList, AsyncStorage} from 'react-native';
import {SearchBar, ListItem} from 'react-native-elements';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userListData: [],
      search: '',
    };
  }

  updateSearch = text => {
    this.setState({search: text});
    if (text == '') {
      this.setState({
        userListData: [],
      });
    } else {
      return fetch(baseUrl + '/search_user?q=' + text)
        .then(response => response.json())
        .then(responseJson => {
          this.setState({
            userListData: responseJson,
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  storeId = async id => {
    try {
      await AsyncStorage.setItem('id', JSON.stringify(id));
    } catch (error) {
      console.log(error.message);
    }
  };

  moreDetails = id => {
    this.storeId(id);
    this.props.navigation.navigate('OtherProfile');
  };

  render() {
    return (
      <View style={styles.viewStyle}>
        <SearchBar
          placeholder="Type here..."
          onChangeText={this.updateSearch}
          value={this.state.search}
        />
        <FlatList
          data={this.state.userListData}
          renderItem={({item}) => (
            <ListItem
              leftIcon={{name: 'person'}}
              title={`${item.given_name} ${item.family_name}`}
              subtitle={item.email}
              bottomDivider
              chevron
              onPress={() => this.moreDetails(item.user_id)}
            />
          )}
          enableEmptySections={true}
          style={{marginTop: 10}}
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
    backgroundColor: 'lightgrey',
  },
  textStyle: {
    padding: 10,
    fontSize: 25,
  },
});
