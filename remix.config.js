/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    v2_routeConvention: true,
  },
  server: "@remix-run/vercel",
  serverBuildPath: "api/index.js",
};
