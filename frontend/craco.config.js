module.exports = {
  jest: {
    configure: (jestConfig) => {
      jestConfig.transform = {
        "^.+\\.(js|jsx|mjs)$": "babel-jest",
      };
      jestConfig.transformIgnorePatterns = [
        "/node_modules/(?!axios|lodash-es|react-router-dom|redux-thunk|@reduxjs/toolkit|@testing-library/react)/",
      ];
      jestConfig.moduleNameMapper = {
        "\\.(css|less|sass|scss)$": "identity-obj-proxy",
      };
      return jestConfig;
    },
  },
};
