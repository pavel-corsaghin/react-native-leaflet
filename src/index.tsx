import { NativeModules } from 'react-native';

type LeafletType = {
  multiply(a: number, b: number): Promise<number>;
};

const { Leaflet } = NativeModules;

export default Leaflet as LeafletType;
