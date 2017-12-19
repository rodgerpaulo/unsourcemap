#!/usr/bin/env node

var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var sourceMap = require('source-map');

var parser = new ArgumentParser({
  addHelp: true,
  description: 'Deobfuscate JavaScript code using a source map',
});

parser.addArgument(['src-js'], {help: 'Path to javascript file to recover', nargs: 1});
parser.addArgument(['src-map'], {help: 'Path to source-map to recover from', nargs: 1});
parser.addArgument(['out-dir'], {help: 'Path to directory where sources will be dumped', nargs: 1});
var args = parser.parseArgs();

var code = fs.readFileSync(args['src-js'][0], 'utf8');
var mapData = fs.readFileSync(args['src-map'][0], 'utf8');

var map = new sourceMap.SourceMapConsumer(mapData);

var outDir = args['out-dir'][0];
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, 0o755);
}

function createFolderPath(dest, url) {
  const aux = url.split('/');
  let folderGuide = dest;
  const authLength = (aux.length - 1);
  let folder;

  for (let i = 0; i < authLength; i++) {
      folder = aux[i];
      if (folder != "") {
          folderGuide += "/" + folder;
          if (!fs.existsSync(folderGuide)) {
              fs.mkdirSync(folderGuide, 0o755);
          }
      }
  }
}

function sanitizeSourceName(url) {
  return url.replace(/webpack:\/\/[^a-zA-Z0-9\-_.:]/g, '');
}

for (var i = 0; i < map.sources.length; i++) {
  var sUrl = map.sources[i];
  console.log("Writing", sUrl);
  
  const urlSanitazier =  sanitizeSourceName(sUrl);
  const fileFullPath = outDir + urlSanitazier;

  createFolderPath(outDir, urlSanitazier)

  const contents = map.sourceContentFor(sUrl);
  fs.writeFileSync(fileFullPath, contents, 'utf8', 0o644);
}
