/**
 * My Pet — a cute virtual pet game UI.
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {Provider} from "react-redux"
import { PetScreen } from './src/PetScreen';
import { store } from './src/store/store';

function App(): React.JSX.Element {
  return (
    
    <SafeAreaProvider>
      <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <PetScreen />
      </View>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
