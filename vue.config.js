module.exports = {
  devServer: {
    port: 9001,
    proxy: {
      "^/api": {
        target: "http://localhost:3000"
      }
    }
  }
};
