// config-overrides.js
const { override, useBabelRc } = require('customize-cra');
if(process.env.REACT_APP_MODE === 'prd') {
  module.exports = override(useBabelRc());
}