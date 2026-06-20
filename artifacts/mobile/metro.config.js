const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

config.resolver.blockList = [
  /node_modules\/.*\/@clerk\/shared_tmp_.*/,
  /node_modules\/@clerk\/shared_tmp_.*/,
  /node_modules\/.*\/react-native-keyboard-controller_tmp_.*/,
  /node_modules\/react-native-keyboard-controller_tmp_.*/,
  /\.pnpm\/.*_tmp_\d+\/.*/,
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@lib/revenuecat": path.resolve(__dirname, "lib/revenuecat"),
};

module.exports = config;
