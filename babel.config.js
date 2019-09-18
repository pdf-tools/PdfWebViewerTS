/*
const presetEnv = require('@babel/preset-env')
const presetTypescript = require('@babel/preset-typescript')
const presetReact = require('@babel/preset-react')
const classProperties = require('@babel/plugin-proposal-class-properties')
const objectRestSpread = require('@babel/plugin-proposal-object-rest-spread')
*/
const packageJson = require('./package.json')

module.exports = function (api) {
  const ENV = api.env()
  console.log('babel env:' + ENV)
  console.log('version:' + packageJson.version)

  api.cache.forever()

  const presets = []
  const plugins = []
  const ignore = [
    "node_modules",
    "src/examples",
  ]

  if (ENV === 'commonjs')  {
    presets.push(
      ["@babel/env", {
        "useBuiltIns": false,
      }]
    )
    ignore.push('src/pdf-web-viewer/global.ts')
    ignore.push('src/pdf-viewer-canvas/global.ts')
  } else if (ENV === 'es')  {
    presets.push(
      ["@babel/env", {
        "useBuiltIns": false,
        "modules": false
      }]
    )
    ignore.push('src/pdf-web-viewer/global.ts')
    ignore.push('src/pdf-viewer-canvas/global.ts')
  } 

  // common
  // presets.push("@babel/preset-react")
  presets.push(["@babel/preset-typescript", {jsxPragma: 'h'}])

  plugins.push(["@babel/plugin-transform-react-jsx", { pragma: "h" }])
  plugins.push("@babel/proposal-class-properties")
  plugins.push("@babel/proposal-object-rest-spread")
  plugins.push(['inline-replace-variables', {"__VERSION__": packageJson.version}])

  return {
    presets,
    plugins,
    ignore,
  };
}
