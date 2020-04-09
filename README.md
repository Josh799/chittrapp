## Set-up
1. Make sure the correct Chittr server version is running locally on your machine:
    - From within terminal, navigate to your server directory and run: `npm install`
    - Update the `./config/config.js` file to point at your mudfoot database
    - Run `npm start` and then navigate to http://localhost:3333/api/v0.0.5/ to see the 'server up' message
    - Finally, run `npm test` in the same directory to check if the API sends back the correct results

2. Clone the project from GitHub, navigate to the project's directory from within terminal and run `npm install`.

3. Open the project's `android` folder in Android Studio. In Android Studio open the AVD manager and boot an emulator.

4. From within the projects directory, run `react-native run-android`. The application will run in the emulator.

## Introduction
This is a React-Native mobile application using the Chittr API. Users can sign up, login, post/draft chits, search and follow other users and edit their own profile.

## Notable libraries used

- React Native Async Storage
- React Native Camera
- React Native Geolocation
- React Navigation
- React Navigation Tabs
- React Navigation Stack
