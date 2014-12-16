var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var jQuery = $;
Backbone.$ = $;

require('./app.js');
//require('./router.js');

$(function(){
  Starter.start();
});