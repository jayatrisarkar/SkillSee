const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Block temp directories that @clerk/shared creates during install —
// Metro watches too broadly in a pnpm monorepo and crashes on these paths.
config.resolver = config.resolver || {};
config.resolver.blockList = [
  /node_modules\/.*\/@clerk\/shared_tmp_.*/,
  /node_modules\/@clerk\/shared_tmp_.*/,
];

module.exports = config;
