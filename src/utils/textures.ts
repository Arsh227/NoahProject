import { TextureLoader } from 'three';

const textureLoader = new TextureLoader();

// NASA Blue Marble texture URL (public domain)
const EARTH_TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_NORMAL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg';
const EARTH_SPECULAR_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg';

export const loadEarthTexture = () => {
  return textureLoader.load(EARTH_TEXTURE_URL);
};

export const loadEarthNormalMap = () => {
  return textureLoader.load(EARTH_NORMAL_URL);
};

export const loadEarthSpecularMap = () => {
  return textureLoader.load(EARTH_SPECULAR_URL);
};

