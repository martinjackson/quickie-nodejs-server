
var marked = require('marked');

var path = require('path');
var fs = require('fs');
const fsp = fs.promises;

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

// style="background-color: #011627; color:#d6deeb">   // vscode-winteriscoming

module.exports = function (fname, val) {
    const ext = fname.substr(fname.lastIndexOf('.') + 1);
    const pretty =`${'```'}${ext}\n\n${val.toString()}\n\n${'```'}`;
    const code = marked(pretty);

    const page =`<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="/highlightjs/styles/monokai.css">
        </head>
        <body>
          <h2>${fname}</h2>
          <div style="background-color: #011627; color:#d6deeb">
          ${code}
          </div>
        </body>
      </html>
      `
      return page
}
