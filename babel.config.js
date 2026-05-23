module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel', // 如果你是 NativeWind v2 / v4，請根據官方文件確認這行的位置
    ],
    plugins: [
      // 確保你的其他插件都在這個 plugins 陣列裡面
      // ⚠️ 絕對不能在某個 plugin 內部又寫一個 plugins: [...]
      'react-native-reanimated/plugin', 
    ],
  };
};