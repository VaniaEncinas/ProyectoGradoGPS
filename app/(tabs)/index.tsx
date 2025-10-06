import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT} // OpenStreetMap
        style={styles.map}
        initialRegion={{
          latitude: -17.3895, // Ejemplo: Cochabamba
          longitude: -66.1568,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: -17.3895, longitude: -66.1568 }}
          title="Pulsera GPS"
          description="Ubicación inicial"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
