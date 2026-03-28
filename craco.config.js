module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Добавляем поддержку дополнительных расширений файлов
      webpackConfig.resolve.extensions = [
        ...webpackConfig.resolve.extensions,
        '.ts',
        '.tsx',
      ];
      return webpackConfig;
    },
  },
};