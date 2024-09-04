// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var OriginView = require('core/views/originView');

  const UNDEF_VAL = 'undefined';

  var ApiView = OriginView.extend({
    tagName: 'div',
    className: 'api',
    events: {
      'change #router': 'renderRouteOptions',
      'change #route': 'renderMethodOptions',
      'change #route,#router,#method': 'updateUrl',
      'click button.send': 'onButtonClicked'
    },

    render: async function() {
      OriginView.prototype.render.apply(this, arguments);

      this.apiUrl = `${window.location.origin}/api/`;
      const apiMap = await $.get(this.apiUrl);
      
      this.data = Object.values(apiMap).reduce((mapped, routes) => { 
        let router = routes[0].url.replace(this.apiUrl, '');
        router = router.slice(0, router.indexOf('/'));
        
        const routePrefix = `${window.location.origin}/api/${router}/`;
        
        return Object.assign(mapped, {
          [router]: routes.map(r => {
            return {
              route: r.url.replace(routePrefix, ''),
              accepted_methods: Object.keys(r.accepted_methods).map(m => m.toUpperCase())
            };
          })
        });
      }, {});

      this.renderRouterOptions();
    },

    renderRouterOptions: function() {
      const $router = $('#router');
      $router.empty();
      $router.append(`<option value="${UNDEF_VAL}">Select a router</option`);

      Object.keys(this.data).forEach(k => $router.append(`<option value="${k}">${k}</option`));
    },
    
    renderRouteOptions: async function() {
      const { router } = this.getData();

      if(router === UNDEF_VAL) {
        return;
      }
      const $route = $('#route');
      $route.empty();
      $route.append(`<option value="${UNDEF_VAL}">Select a route</option`);
      $route.show();
      
      const routes = this.data[router];
      routes.forEach(r => $route.append(`<option value="${r.route}">${r.route || '/'}</option`));

      if(routes.length === 1) {
        $route.val(routes[0].route);
        this.renderMethodOptions();
      }
    },
    
    renderMethodOptions: async function() {
      const { router, route } = this.getData();
      
      if(router === UNDEF_VAL || route === UNDEF_VAL) {
        return;
      }
      const data = this.data[router].find(r => r.route === route);
      const $method = $('#method');
      $method.empty();
      $method.append(`<option value="${UNDEF_VAL}">Select HTTP method</option`);
      data.accepted_methods.forEach(m => $method.append(`<option value="${m}">${m}</option`));
      $method.show();

      if(data.accepted_methods.length === 1) $method.val(data.accepted_methods[0]);
    },

    updateUrl: function() {
      const { router, route, method } = this.getData();
      if(route === UNDEF_VAL) $('#method').val(UNDEF_VAL);

      const areValsSet = router !== UNDEF_VAL && route !== UNDEF_VAL && method !== UNDEF_VAL;

      $('#url').val(areValsSet ? `${this.apiUrl}${router}${route ? '/' : ''}${route}` : "");
      $('.body').toggle(method === 'POST' || method === 'PATCH' || method === 'PUT');
      $('.data').hide();
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

    onButtonClicked: async function() {
      let { url, method, body } = this.getData();
      let data, isError;
      try {
        $('.data').removeClass('error');
        if(body) body = JSON.parse(body);
        const res = await $.ajax(url, { method, data: body, dataType: 'json' });
        data = res || 'No response data.';
      } catch(e) {
        data = e.responseJSON || e.toString();
        isError = true
      }
      $('.data')
        .toggleClass('error', !!isError)
        .text(JSON.stringify(data, null, 2))
        .toggle(data);
    }
  }, {
    template: 'api'
  });

  return ApiView;
});
