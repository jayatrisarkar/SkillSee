const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

config.resolver.blockList = [
  /node_modules\/.*\/@clerk\/shared_tmp_.*/,
  /node_modules\/@clerk\/shared_tmp_.*/,
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@lib": path.resolve(__dirname, "lib"),
};

module.exports = config;
