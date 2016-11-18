import './main.html';

var Prism = require('prismjs');

Template.devlogMain.onRendered(function() {
  Prism.highlightAll();
})
