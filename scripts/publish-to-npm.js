const shell = require('shelljs')

const package_json = require('../build/package.json')

console.log(`
*************************************************
* publish ${package_json.name} ${package_json.version}
*************************************************`)

shell.cd('build')
shell.exec('npm publish')
