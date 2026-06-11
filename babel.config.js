module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel', 
    ],
    plugins: [
      // 🌟 新版 Vision Camera 不需要另外寫相機插件，只需要保留 Reanimated 即可！
      'react-native-reanimated/plugin', 
    ],
  };
};