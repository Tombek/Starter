var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');

Fainr.Router = Backbone.Router.extend({
  routes: {
    '': 'home'
  }
});