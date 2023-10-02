import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const API_KEY = 'sFF5YM3snSYSbQWSvEghK1jFVKoRcfxX';
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });

      // Animate map to user's current location
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1500);
    })();
  }, []);
  
  const onShowPress = async () => {
    const apiUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${address}`;
    
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        const { lat, lng } = data.results[0].locations[0].latLng;
        const newCoordinates = { latitude: lat, longitude: lng };
        
        // Update state
        setCoordinates(newCoordinates);

        // Animate the map to new region
        mapRef.current.animateToRegion({
          ...newCoordinates,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1500); // 1500 milliseconds
      } else {
        console.error("Received non-OK HTTP status code:", response.status);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        placeholder="Enter address"
        onChangeText={setAddress}
        value={address}
      />
      <Button title="Show" onPress={onShowPress} />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 60.1699,
          longitude: 24.9384,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={coordinates}
          title={address}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '70%',
  },
});
