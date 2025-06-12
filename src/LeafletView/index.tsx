import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WebView, WebViewProps } from 'react-native-webview';
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
import { NativeSyntheticEvent, Platform, StyleSheet } from 'react-native';
import {
  WebViewError,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import LoadingIndicator from '../LoadingIndicator';

const LEAFLET_HTML_SOURCE = Platform.select({
  ios: require('../../android/src/main/assets/leaflet.html'),
  android: { uri: 'file:///android_asset/leaflet.html' },
});

const DEFAULT_MAP_LAYERS = [
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
  doDebug?: boolean;
  androidHardwareAccelerationDisabled?: boolean;
  webviewStyle?: WebViewProps;
  injectedJavaScript?: string;
  source?: WebViewProps['source'];
  zoomControl?: boolean;
  attributionControl?: boolean;
};

const LeafletView: React.FC<LeafletViewProps> = ({
  renderLoading = () => <LoadingIndicator />,
  onError,
  onLoadEnd,
  onLoadStart,
  onMessageReceived,
  mapLayers = DEFAULT_MAP_LAYERS,
  mapMarkers,
  mapShapes,
  mapCenterPosition,
  ownPositionMarker,
  zoom = DEFAULT_ZOOM,
  doDebug = __DEV__,
  androidHardwareAccelerationDisabled,
  webviewStyle,
  injectedJavaScript,
  source,
  zoomControl = true,
  attributionControl = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [initialized, setInitialized] = useState(false);
  const ownPositionMarkerRef = useRef<boolean>(false);

  const logMessage = useCallback(
    (message: string) => {
      if (doDebug) {
        console.log(message);
      }
    },
    [doDebug]
  );

  const sendMessage = useCallback(
    (payload: MapMessage) => {
      logMessage(`sending: ${JSON.stringify(payload)}`);

      webViewRef.current?.injectJavaScript(
        `window.postMessage(${JSON.stringify(payload)}, '*');`
      );
    },
    [logMessage]
  );

  const sendInitialMessage = useCallback(() => {
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

    if (!zoomControl) {
      const hideZoomControlsJS = `
        document.querySelectorAll('.leaflet-bar a').forEach(element => {
          element.style.display = 'none';
        });
      `;
      webViewRef.current?.injectJavaScript(hideZoomControlsJS);
    }

    if (!attributionControl) {
      const hideAttributionControlsJS = `
        document.querySelectorAll('.leaflet-control-attribution').forEach(element => {
          element.style.display = 'none';
        });
      `;
      webViewRef.current?.injectJavaScript(hideAttributionControlsJS);
    }

    sendMessage(startupMessage);
    setInitialized(true);
    logMessage('sending initial message');
  }, [
    logMessage,
    mapCenterPosition,
    mapLayers,
    mapMarkers,
    mapShapes,
    ownPositionMarker,
    sendMessage,
    zoom,
    attributionControl,
    zoomControl,
  ]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = event?.nativeEvent?.data;
      if (!data) {
        return;
      }

      const message: WebviewLeafletMessage = JSON.parse(data);
      logMessage(`received: ${JSON.stringify(message)}`);

      if (message.msg === WebViewLeafletEvents.MAP_READY) {
        sendInitialMessage();
      }
      if (message.event === WebViewLeafletEvents.ON_MOVE_END) {
        logMessage(
          `moved to: ${JSON.stringify(message.payload?.mapCenterPosition)}`
        );
      }

      onMessageReceived && onMessageReceived(message);
    },
    [logMessage, onMessageReceived, sendInitialMessage]
  );

  //Handle mapLayers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapLayers });
  }, [initialized, mapLayers, sendMessage]);

  //Handle mapMarkers update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapMarkers });
  }, [initialized, mapMarkers, sendMessage]);

  //Handle mapShapes update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapShapes });
  }, [initialized, mapShapes, sendMessage]);

  //Handle ownPositionMarker update
  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (ownPositionMarker) {
      ownPositionMarkerRef.current = true;
      sendMessage({
        ownPositionMarker: { ...ownPositionMarker, id: OWN_POSTION_MARKER_ID },
      });
    } else if (ownPositionMarkerRef.current) {
      ownPositionMarkerRef.current = false;
      sendMessage({
        ownPositionMarker: {
          id: OWN_POSTION_MARKER_ID,
          position: {
            lat: 0,
            lng: 0,
          },
          title: '',
          size: [0, 0],
          icon: '',
        },
      });
    }
  }, [initialized, ownPositionMarker, sendMessage, ownPositionMarkerRef]);

  //Handle mapCenterPosition update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ mapCenterPosition });
  }, [initialized, mapCenterPosition, sendMessage]);

  //Handle zoom update
  useEffect(() => {
    if (!initialized) {
      return;
    }
    sendMessage({ zoom });
  }, [initialized, zoom, sendMessage]);

  return (
    <WebView
      containerStyle={styles.container}
      ref={webViewRef}
      javaScriptEnabled={true}
      onLoadEnd={onLoadEnd}
      onLoadStart={onLoadStart}
      onMessage={handleMessage}
      domStorageEnabled={true}
      startInLoadingState={true}
      onError={onError}
      originWhitelist={['*']}
      renderLoading={renderLoading}
      source={source || LEAFLET_HTML_SOURCE}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      allowFileAccessFromFileURLs={true}
      androidHardwareAccelerationDisabled={androidHardwareAccelerationDisabled}
      style={webviewStyle}
      injectedJavaScript={injectedJavaScript}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
});

export default LeafletView;
