import path from "path";

export default pluginOptions => ({
  webpack: config => {
    // config.resolve.alias = {
    //   src: path.join(__dirname, "src"),
    // };
    config.resolve.modules.push(path.resolve("./"));
    return config;
  },
});
