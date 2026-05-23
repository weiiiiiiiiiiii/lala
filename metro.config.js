// const { getDefaultConfig } = require("expo/metro-config");

// module.exports = (() => {
//   const config = getDefaultConfig(__dirname);

//   const { transformer, resolver } = config;

//   config.transformer = {
//     ...transformer,
//     babelTransformerPath: require.resolve("react-native-svg-transformer"),
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: true,
//       },
//     }),
//   };
  
//   config.resolver = {
//     ...resolver,
//     assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
//     sourceExts: [...resolver.sourceExts, "svg"],
//   };

//   return config;
// })();

const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // 1. ✨ 強制限制核心數為 1，這是 Windows 防止 Metro 記憶體溢出的特效藥
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

  return config;
})();