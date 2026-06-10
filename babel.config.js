module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // react-native-worklets/plugin must be listed last. Required by Reanimated 4.
  plugins: ['react-native-worklets/plugin'],
};
