// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Backbone = require('backbone');
  var OriginView = require('core/views/originView');

  var ApiView = OriginView.extend({
    tagName: 'div',
    className: 'api',
    events: {
      'change #router': 'onRouterChange',
      'change #route': 'onRouteChange',
      'change #route,#router,#method': 'updateUrl',
      'click button.send': 'onButtonClicked'
    },

    render: async function() {
      OriginView.prototype.render.apply(this, arguments);

      this.apiUrl = `${window.location.origin}/api/`;
      const apiMap = await $.get(this.apiUrl);
      const $router = $('#router');

      $router.append(`<option value="">Select a router</option`);
      
      this.data = Object.entries(apiMap).reduce((mapped, [key, routes]) => {
        
        let router = routes[0].url.replace(this.apiUrl, '');
        router = router.slice(0, router.indexOf('/'));
        
        const routePrefix = `${window.location.origin}/api/${router}/`;
        $router.append(`<option value="${router}">${router}</option`);
        
        return Object.assign(mapped, {
          [router]: routes.map(r => {
            const route = r.url.replace(routePrefix, '');
            return Object.assign(r, { route });
          })
        });
      }, {});
    },

    updateUrl: function() {
      const { router, route, method } = this.getData();
      $('#url').val(router && route && method ? `${this.apiUrl}${router}/${route}` : '');
      $('.body').toggle(method === 'post' || method === 'patch' || method === 'put');
    },

    getData: function() {
      return {
        router: $('#router').val(),
        route: $('#route').val(),
        method: $('#method').val(),
        url: $('#url').val(),
        body: $('#body').val()
      };
    },
    
    onRouterChange: async function() {
      const { router } = this.getData();

      if(!router) {
        return;
      }
      const $route = $('#route');
      $route.empty();
      $route.append(`<option value="">Select a route</option`);
      $route.show();
      
      this.data[router].forEach(r => $route.append(`<option value="${r.route}">${r.route}</option`));
    },
    
    onRouteChange: async function() {
      const { router, route } = this.getData();
      
      if(!router || !route) {
        return;
      }
      const data = this.data[router].find(r => r.route === route);
      const $method = $('#method');
      $method.empty();
      $method.append(`<option value="">Select HTTP method</option`);
      const methods = Object.keys(data.accepted_methods);
      methods.forEach(m => {
        m = m.toUpperCase();
        $method.append(`<option value="${m}" ${methods.length === 1 ? 'selected="true"' : ''}>${m}</option`);
      });
      $method.show();
    },

    onButtonClicked: async function() {
      let { url, method, body } = this.getData();
      let data, isError;
      try {
        $('.data').removeClass('error');
        if(body) body = JSON.parse(body);
        const res = await $.ajax(url, { method, body });
        data = res;
      } catch(e) {
        data = e.responseJSON || e;
        isError = true
      }
      $('.data')
        .toggleClass('error', isError)
        .html(JSON.stringify(data, null, 2))
        .show();
    }
  }, {
    template: 'api'
  });

  return ApiView;
});
