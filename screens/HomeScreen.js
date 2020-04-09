/*
	Home Screen and Main Page
*/

import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import {Image, Card, Avatar, Divider, Icon} from 'react-native-elements';
import Geocoder from 'react-native-geocoding';

const baseUrl = 'http://10.0.2.2:3333/api/v0.0.5';
const profilePic = require('../images/default.jpg');

export default class HomeScreen extends Component {
  // initiate constructor
  constructor(props) {
    super(props);
    this.state = {
      isLodaing: true,
      photoList: [],
      chitListData: [],
      locationList: [],
      refreshing: false,
    };
  }

  // get chits
  getData = () => {
    return fetch(baseUrl + '/chits')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          chitListData: responseJson,
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  componentDidMount() {
    // enter valid api key
    Geocoder.init('');
    this.getData()
      .then(async () => {
        const list = [];
        const addressList = [];
        for (let chit of this.state.chitListData) {
          try {
            let data = await this.getPhoto(chit.chit_id);
            let img = await this.readFileAsync(data);
            list.push({id: chit.chit_id, image: img});
          } catch (err) {
            console.log(err);
          }
          if (chit.location) {
            let address = await this.getLocation(chit.location);
            addressList.push({id: chit.chit_id, location: address});
          }
        }
        return [list, addressList];
      })
      .then(list => {
        this.setState({
          isLoading: false,
          photoList: list[0],
          locationList: list[1],
          refreshing: false,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  // get data from api
  getApiData = () => {
    this.getData()
      .then(async () => {
        const list = [];
        const addressList = [];
        for (let chit of this.state.chitListData) {
          try {
            let data = await this.getPhoto(chit.chit_id);
            let img = await this.readFileAsync(data);
            list.push({id: chit.chit_id, image: img});
          } catch (err) {
            console.log(err);
          }
          if (chit.location) {
            let address = await this.getLocation(chit.location);
            addressList.push({id: chit.chit_id, location: address});
          }
        }
        return [list, addressList];
      })
      .then(list => {
        this.setState({
          isLoading: false,
          photoList: list[0],
          locationList: list[1],
          refreshing: false,
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  readFileAsync = file => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // get photo for current chit
  getPhoto = async chit_id => {
    let response = await fetch(baseUrl + '/chits/' + chit_id + '/photo');
    if (response.status == '200') {
      return await response.blob();
    } else {
      return null;
    }
  };

  // refresh list of chits
  handleRefresh = () => {
    this.setState(
      {
        isFetching: true,
      },
      function() {
        this.getApiData();
      },
    );
  };

  // display image
  showImage = chit_id => {
    let response = this.state.photoList.find(img => img.id == chit_id);
    if (response) {
      return (
        <Image
          source={{uri: response.image}}
          style={{height: 200, width: 200}}
        />
      );
    }
  };

  // display location
  showLocation = chit_id => {
    let response = this.state.locationList.find(add => add.id == chit_id);
    if (response) {
      return (
        <View>
          <Icon name="location" />
          <Text>{response.location}</Text>
        </View>
      );
    }
  };

  // get location from geocoder
  getLocation = async coords => {
    try {
      let response = await Geocoder.from(coords.latitude, coords.longitude);
      let addressComponent = await response.results[5].formatted_address;
      return addressComponent;
    } catch (err) {
      console.error(err);
    }
  };

  // display time of chit
  showTime = timestamp => {
    let time = new Date(timestamp);
    return time.toUTCString();
  };

  render() {
    if (this.state.isLoading) {
      // if loading then display loading
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else {
      return (
        <View>
          <FlatList // list of chits
            data={this.state.chitListData}
            renderItem={({item}) => (
              <Card // card of the chit
                titleStyle={{textAlign: 'left'}}
                title={
                  <View style={styles.header}>
                    <Avatar // chit profile photo
                      rounded
                      source={profilePic}
                    />
                    <Text>
                      {item.user.given_name} {item.user.family_name}
                    </Text>
                    <Text // chit timestamp
                    >
                      {this.showTime(item.timestamp)}
                    </Text>
                  </View>
                }>
                <View // chit content
                >
                  <Divider style={styles.divider} />
                  <Text style={{marginBottom: 10}}>{item.chit_content}</Text>
                  {this.showImage(item.chit_id)}
                  {item.location && this.showLocation(item.chit_id)}
                </View>
              </Card>
            )}
            keyExtractor={chit_id => chit_id.toString()}
            refreshing={this.state.refreshing}
            onRefresh={this.handleRefresh}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  divider: {
    backgroundColor: 'gray',
    marginBottom: 10,
  },
});
