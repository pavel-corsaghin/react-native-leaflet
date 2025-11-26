# react-native-leaflet

A LeafletView component using WebView and Leaflet map for React Native applications

Notes: This project is replacement for https://github.com/reggie3/react-native-webview-leaflet, which no longer maintain by author and work only with expo.

[![npm](https://img.shields.io/npm/v/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)
[![npm](https://img.shields.io/npm/dm/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)
[![npm](https://img.shields.io/npm/dt/react-native-leaflet-view.svg)](https://www.npmjs.com/package/react-native-leaflet-view)

<img src="images/android.png" height="600">       <img src="images/ios.png" height="600">

## Installation

Install using npm or yarn like this:

```sh
npm install --save react-native-leaflet-view
```

or

```sh
yarn add react-native-leaflet-view
```

## react-native configuration 
This package is required for proper file handling and WebView functionality in React Native:
- [react-native-webview](https://github.com/react-native-webview/react-native-webview). You can install it using yarn or npm:

```sh
npm install --save react-native-webview
```

or

```sh
yarn add react-native-webview
```

## Expo configuration

For Expo projects, you'll need to add additional dependencies:

```sh
npx expo install react-native-webview expo-asset expo-file-system
```

These packages are required for proper file handling and WebView functionality in Expo:
- [react-native-webview docs](https://docs.expo.dev/versions/latest/sdk/webview/)
- [expo-asset docs](https://docs.expo.dev/versions/latest/sdk/asset/)
- [expo-file-system docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)

You need to do this in the root of your project: Copy the required HTML file from the package with this one-liner

```sh
cp node_modules/react-native-leaflet-view/android/src/main/assets/leaflet.html assets
```

## Usage with react-native-cli

```js
import React from 'react';
import { LeafletView } from 'react-native-leaflet-view';

const DEFAULT_LOCATION = {
  latitude: -23.5489,
  longitude: -46.6388
}
const App: React.FC = () => {

  return (
    <LeafletView
      mapCenterPosition={{
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }}
    />
  );
}

export default App;
```

## Usage with Expo

```js

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { Asset } from "expo-asset";
import { File } from 'expo-file-system';
import { LatLng, LeafletView } from 'react-native-leaflet-view';

const DEFAULT_LOCATION = {
  latitude: -23.5489,
  longitude: -46.6388
}
const App: React.FC = () => {
  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;

    const loadHtml = async () => {
      try {
        const path = require("./assets/leaflet.html");
        const asset = Asset.fromModule(path);
        await asset.downloadAsync();
        const htmlContent = await new File(asset.localUri!).text();

        if (isMounted) {
          setWebViewContent(htmlContent);
        }
      } catch (error) {
        Alert.alert('Error loading HTML', JSON.stringify(error));
        console.error('Error loading HTML:', error);
      }
    };

    loadHtml();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />
  }
  return (
    <LeafletView
      source={{ html: webViewContent }}
      mapCenterPosition={{
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }}
    />
  );
}

export default App;

```

## Props

| property            | required | type                            | purpose                                                                                                                                    |
| ------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| loadingIndicator    | optional | React.ReactElement              | custom component displayed while the map is loading                                                                                        |
| onError             | optional | function                        | Will receive an error event                                                                                                                |
| onLoadEnd           | optional | function                        | Called when map stops loading                                                                                                              |
| onLoadStart         | optional | function                        | Called when the map starts to load                                                                                                         |
| onMessageReceived   | required | function                        | This function receives messages in the form of a WebviewLeafletMessage object from the map                                                 |
| mapLayers           | optional | MapLayer array                  | An array of map layers                                                                                                                     |
| mapMarkers          | optional | MapMarker array                 | An array of map markers                                                                                                                    |
| mapShapes           | optional | MapShape[]                      | An array of map shapes                                                                                                                     |
| mapCenterPosition   | optional | {lat: [Lat], lng: [Lng]} object | The center position of the map. This coordinate will not be accurate if the map has been moved manually. However, calling the map's setMapCenterPosition function will cause the map to revert to this location |
| ownPositionMarker   | optional | Marker                          | A special marker that has an ID of OWN_POSTION_MARKER_ID                                                                                   |
| zoom                | optional | number                          | Desired zoom value of the map                                                                                                              |
| doDebug             | optional | boolean                         | A flag for debug message logging                                                                                                           |
| source              | optional | WebView["source"]               | Loads static html or a uri (with optional headers) in the WebView.                                                                         |
| zoomControl         | optional | boolean                         | Controls the visibility of the zoom controls on the map.                                                                                   |
| attributionControl  | optional | boolean                         | Controls the visibility of the attribution control on the map.                                                                             |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
