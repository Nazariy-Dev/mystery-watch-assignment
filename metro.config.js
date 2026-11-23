const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');

// `require('three')` resolves to three.cjs, which calls Node's process.emitWarning (missing in React Native)
// and crashes at startup. Pin every import, including R3F's and three/addons', to the ES module build.
const threeModule = path.join(__dirname, 'node_modules/three/build/three.module.js');
config.resolver.resolveRequest = (context, moduleName, platform) =>
  moduleName === 'three'
    ? { type: 'sourceFile', filePath: threeModule }
    : context.resolveRequest(context, moduleName, platform);

module.exports = config;
