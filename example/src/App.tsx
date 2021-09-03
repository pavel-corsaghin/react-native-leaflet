import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import { LatLng, LeafletView } from 'react-native-leaflet';

const DEFAULT_COORDINATE: LatLng = {
  lat: 37.78825,
  lng: -122.4324,
};

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <LeafletView
        mapMarkers={[
          {
            position: DEFAULT_COORDINATE,
            icon: '📍',
            size: [32, 32],
          },
        ]}
        mapCenterPosition={DEFAULT_COORDINATE}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
