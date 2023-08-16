import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type Props = {};

const LoadingIndicator: React.FC<Props> = () => {
  return (
    <View style={styles.activityOverlayStyle}>
      <View>
        <ActivityIndicator size="large" color={'#00B0B9'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activityOverlayStyle: {
    ...StyleSheet.absoluteFillObject,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 5,
  },
});

export default LoadingIndicator;
