#!/usr/bin/env node

const $sh = require('shelljs')

const printUsage = function() {
  console.log('Usage: pdftools <commands>')
  console.log('')
  console.log('  --copy-wasm path     Copy webassemply files')
  console.log('  --copy-js path       Copy bundled js files')
  console.log('  --copy-css path      Copy bundled css files')
  console.log('')
}

if(process.argv.length < 4) {
  printUsage()
  return
}

validateArgs = function() {
  let exPl = {}
  for (let i = 2; i < process.argv.length; i = i + 2) {
    const cmd = process.argv[i]
    if (process.argv.length + 1 <= i) {
      exPl.error += 'missing parameter for ' + cmd + '\n';
    }
    const arg = process.argv[i + 1]
    switch (cmd) {
      case '--copy-wasm':
        exPl.copyWasm = arg
        break
      case '--copy-js':
        exPl.copyJs = arg
        break
      case '--copy-css':
        exPl.copyCss = arg
        break
      default:
        exPl.error += 'unknown command ' + cmd + '\n';
    }
  }
  return exPl
}

const cmdArgs = validateArgs()

if (cmdArgs.error) {
  console.log('ERROR')
  console.log(cmdArgs.error)
  printUsage()
  return
}

const copyDir = function(src, target) {
  if (!$sh.test('-d', target)) $sh.mkdir('-p', target)
  $sh.cp('-r', src, target)
}

if (cmdArgs.copyWasm) copyDir('./node_modules/@pdf-tools/pdf-web-viewer/wasm/*', cmdArgs.copyWasm + '/')
if (cmdArgs.copyJs) copyDir('./node_modules/@pdf-tools/pdf-web-viewer/dist/browser/*.js', cmdArgs.copyJs)
if (cmdArgs.copyCss) copyDir('./node_modules/@pdf-tools/pdf-web-viewer/dist/css/*.css', cmdArgs.copyCss)
