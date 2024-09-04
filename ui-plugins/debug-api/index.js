// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  const Origin = require('core/origin');
  const ApiView = require('./views/apiView');

  Origin.on('debug:ready', () => {
    Origin.trigger(`debug:addView`, { 
      name: 'api', 
      icon: 'database', 
      title: 'API', 
      view: ApiView
    })
  })
});
