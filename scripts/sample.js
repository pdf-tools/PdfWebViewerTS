const $sh = require('shelljs')

const buildDir = './build'
const srcDir = {
  root: './src',
}

const distDir = {
  sampleRoot: './build/sample',
  dist: './build/dist',
}

console.log('start build static sample app')

if ($sh.test('-d', distDir.sampleRoot)) {
  $sh.rm('-rf', distDir.sampleRoot)
}

if (!$sh.test('-d', buildDir)) {
  $sh.mkdir(buildDir)
}

$sh.mkdir(distDir.sampleRoot)
$sh.mkdir(`${distDir.sampleRoot}/pdfwebviewer`)

process.env.BABEL_ENV = 'es'
const esRes = $sh.exec('babel ./src --out-dir build/dist/es --extensions \".ts,.tsx\"')
if (esRes.code !== 0) {
  console.log('BUILD FAILED!')
  return 1
}

// process.env.BABEL_ENV = 'es'
const umdRes = $sh.exec('rollup -c')
if (umdRes.code !== 0) {
  console.log('BUILD FAILED!')
  return 1
}

console.log('build css')
const sassRes = $sh.exec('node-sass-chokidar src/styles/themes -o build/ --output-style compressed')
if (sassRes.code !== 0) {
  console.log('BUILD FAILED!')
  return 1
}
const postCssRes = $sh.exec('postcss build/*.css --use autoprefixer -d build/sample')
if (postCssRes.code !== 0) {
  console.log('BUILD FAILED!')
  return 1
}

console.log('copy files')
$sh.cp('-r', `./src/index.html`, `${distDir.sampleRoot}/index.html`)
$sh.cp('-r', `./build/dist/browser/pdf-web-viewer.js`, `${distDir.sampleRoot}/pdf-web-viewer.js`)
