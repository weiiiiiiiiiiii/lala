const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.maxWorkers = 1;

  // 2. 修正 SVG 轉換器設定
  config.transformer = {
    ...transformer,
    // ⚠️ 刪除自訂的 getTransformOptions，直接使用 Expo 預設的優化配置
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  
  // 3. 設定資源解析器
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  // 範例：在你的 metro.config.js 裡找到 assetExts 並加上 'GIF'
  config.resolver.assetExts.push('GIF');

  return config;
})();