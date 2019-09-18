const $sh = require('shelljs')
const fs = require('fs')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const localResolve = require('rollup-plugin-local-resolve')
const buildDir = './build'
/*
*/

const srcDir = {
  root: './src',
  scss: './src/styles/',
  webassembly: './static/pdfwebviewer',
}

const distDir = {
  root: './build',
  src: './build/src',
  bin: './build/bin',
  scss: './build/scss',
  webassembly: './build/wasm',
}


console.log('start production build')

// if exists, delete old dist directory
if ($sh.test('-d', distDir.root)) {
  console.log('delete previous build directory')
  $sh.rm('-rf', distDir.root)
}

// typescript compile
const tscRes = $sh.exec(`tsc --pretty --noEmitOnError --stripInternal --extendedDiagnostics`) // --stripInternal --emitDeclarationOnly
if (tscRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}
console.log('typescript compile ok')

// console.log('patch version')
// $sh.exec('npm version patch')

process.env.BABEL_ENV = 'commonjs'
const cjsRes = $sh.exec('babel ./src --out-dir build/dist/cjs --extensions \".ts,.tsx\"')
if (cjsRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}

process.env.BABEL_ENV = 'es'
const esRes = $sh.exec('babel ./src --out-dir build/dist/es --extensions \".ts,.tsx\"')
if (esRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}

// process.env.BABEL_ENV = 'es'
const umdRes = $sh.exec('rollup -c')
if (umdRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}

console.log('build css')
const sassRes = $sh.exec('node-sass-chokidar src/styles/themes -o build/dist/css --output-style compressed')
if (sassRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}
const postCssRes = $sh.exec('postcss build/dist/css/*.css --use autoprefixer -d build/dist/css')
if (postCssRes.code !== 0) {
  console.log('BUILD FAILED!')
  return
}

console.log('copy files')
$sh.mkdir('./build/bin')
$sh.mkdir('-p', './build/wasm')
$sh.cp('-r', srcDir.scss, distDir.scss)
$sh.cp('LICENSE', distDir.root)
$sh.cp('README.md', distDir.root)
$sh.cp('bin/cli.js', `${distDir.bin}/cli.js`)


console.log('create package.json')
const packageJson = {}
const packageConfig = require('../package.json')

packageJson.name = packageConfig.name
packageJson.version = packageConfig.version
packageJson.description = packageConfig.description
packageJson.repository = packageConfig.repository
packageJson.keywords = packageConfig.keywords
packageJson.author = packageConfig.author
packageJson.license = packageConfig.license
packageJson.dependencies = packageConfig.dependencies
packageJson.dependencies.shelljs = packageConfig.devDependencies.shelljs
packageJson.bin = packageConfig.bin
packageJson.main = './dist/cjs/index.js',
packageJson.module = './dist/es/index.js',
packageJson.typings = './src/index.d.ts',

fs.writeFileSync(`${distDir.root}/package.json`, JSON.stringify(packageJson, null, 2));  
