function skipRootAbsoluteCssUrls(rules) {
  rules.forEach((rule) => {
    if (rule.oneOf) {
      skipRootAbsoluteCssUrls(rule.oneOf);
    }
    if (Array.isArray(rule.use)) {
      rule.use.forEach((useEntry) => {
        const loaderPath = typeof useEntry === "string" ? useEntry : useEntry.loader;
        if (loaderPath && loaderPath.includes("css-loader") && !loaderPath.includes("postcss-loader")) {
          useEntry.options = {
            ...useEntry.options,
            url: {
              filter: (url) => !url.startsWith("/"),
            },
          };
        }
      });
    }
  });
}

module.exports = {
  style: {
    postcss: {
      mode: "extends",
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      skipRootAbsoluteCssUrls(webpackConfig.module.rules);
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: "all",
  },
};
