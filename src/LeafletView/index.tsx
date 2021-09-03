import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import {
  MapMarker,
  WebviewLeafletMessage,
  MapMessage,
  WebViewLeafletEvents,
  MapLayer,
  MapShape,
  OwnPositionMarker,
  OWN_POSTION_MARKER_ID,
} from './types';
import { LatLng } from 'react-leaflet';
import { NativeSyntheticEvent, Platform, StyleSheet, View } from 'react-native';
import {
  WebViewError,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import LoadingIndicator from '../LoadingIndicator';

const LEAFLET_HTML_SOURCE = Platform.select({
  ios: require('../../../android/app/src/main/assets/leaflet.html'),
  android: { uri: 'file:///android_asset/leaflet.html' },
});

const DEFAULT_MAP_LAYERS = [
  {
    attribution:
      '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    baseLayerIsChecked: true,
    baseLayerName: 'OpenStreetMap.Mapnik',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
];

const DEFAULT_ZOOM = 15;

export type LeafletViewProps = {
  renderLoading?: () => React.ReactElement;
  onError?: (syntheticEvent: NativeSyntheticEvent<WebViewError>) => void;
  onLoadEnd?: () => void;
  onLoadStart?: () => void;
  onMessageReceived?: (message: WebviewLeafletMessage) => void;
  mapLayers?: MapLayer[];
  mapMarkers?: MapMarker[];
  mapShapes?: MapShape[];
  mapCenterPosition?: LatLng;
  ownPositionMarker?: OwnPositionMarker;
  zoom?: number;
};

const LeafletView: React.FC<LeafletViewProps> = ({
  renderLoading,
  onError,
  onLoadEnd,
  onLoadStart,
  onMessageReceived,
  mapLayers,
  mapMarkers,
  mapShapes,
  mapCenterPosition,
  ownPositionMarker,
  zoom,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [initialized, setInitialized] = useState(false);

  //Handle mapLayers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapLayers });
  }, [initialized, mapLayers]);

  //Handle mapMarkers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapMarkers });
  }, [initialized, mapMarkers]);

  //Handle mapShapes update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapShapes });
  }, [initialized, mapShapes]);

  //Handle ownPositionMarker update
  useEffect(() => {
    if (!initialized || !ownPositionMarker) {
      return;
    }
    sendMessage({ ownPositionMarker });
  }, [initialized, ownPositionMarker]);

  //Handle mapCenterPosition update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapCenterPosition });
  }, [initialized, mapCenterPosition]);

  //Handle zoom update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ zoom });
  }, [initialized, zoom]);

  const sendMessage = (payload: MapMessage) => {
    console.log(`sending: ${JSON.stringify(payload)}`);

    webViewRef.current?.injectJavaScript(
      `window.postMessage(${JSON.stringify(payload)}, '*');`
    );
  };

  const sendInitialMessage = () => {
    let startupMessage: MapMessage = {};

    if (mapLayers) {
      startupMessage.mapLayers = mapLayers;
    }
    if (mapMarkers) {
      startupMessage.mapMarkers = mapMarkers;
    }
    if (mapCenterPosition) {
      startupMessage.mapCenterPosition = mapCenterPosition;
    }
    if (mapShapes) {
      startupMessage.mapShapes = mapShapes;
    }
    if (ownPositionMarker) {
      startupMessage.ownPositionMarker = {
        ...ownPositionMarker,
        id: OWN_POSTION_MARKER_ID,
      };
    }
    startupMessage.zoom = zoom;

    sendMessage(startupMessage);
    setInitialized(true);
    console.log('sending startup message');
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event?.nativeEvent?.data;
    if (!data) {
      return;
    }

    const message: WebviewLeafletMessage = JSON.parse(data);
    console.log(`received: ${JSON.stringify(message)}`);

    if (message.msg === WebViewLeafletEvents.MAP_READY) {
      sendInitialMessage();
    }
    if (message.event === WebViewLeafletEvents.ON_MOVE_END) {
      console.log(
        `moved to: ${JSON.stringify(message.payload?.mapCenterPosition)}`
      );
    }

    onMessageReceived && onMessageReceived(message);
  };

  return (
    <View style={styles.container}>
      <WebView
        containerStyle={styles.webview}
        ref={webViewRef}
        javaScriptEnabled={true}
        onLoadEnd={onLoadStart}
        onLoadStart={onLoadEnd}
        onMessage={handleMessage}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={onError}
        originWhitelist={['*']}
        renderLoading={renderLoading}
        source={LEAFLET_HTML_SOURCE}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
      />
    </View>
  );
};

LeafletView.defaultProps = {
  renderLoading: () => <LoadingIndicator />,
  mapLayers: DEFAULT_MAP_LAYERS,
  zoom: DEFAULT_ZOOM,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  webview: {
    flex: 1,
  },
});

export default LeafletView;
