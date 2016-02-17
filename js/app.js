window.TCWidget = {
  init: function(params) {

    requirejs.config({
      baseUrl: './js/', 
      paths: {
        'isMobile': 'bower_components/isMobile/isMobile',
        'lockr': 'bower_components/lockr/lockr',
        'classnames': 'lib/classnames',
        'dispatcher': 'lib/dispatcher',
        'react': 'bower_components/react/react',
        'reactDOM': 'bower_components/react/react-dom',
        'microEvent': 'bower_components/microevent/microevent',
        'load': 'loader'
      }
    });

    requirejs(['react', 'reactDOM', 'lib/helper', 'load!components/wrapper'], function(React, ReactDOM, h, Wrapper) {

      h.loadCss( 'css/style.css' );
      h.loadCss( 'https://fonts.googleapis.com/icon?family=Material+Icons' );

      var container = document.getElementById(params.container);

      ReactDOM.render(
        React.createElement(Wrapper),
        container
      );

    });

  }  

  // overlayNode: null,
  // init: function(params) {

  //   requirejs.config({
  //     baseUrl: './', 
  //     paths: {
  //       'isMobile': 'bower_components/isMobile/isMobile',
  //       'lockr': 'bower_components/lockr/lockr',
  //       'classnames': 'lib/classnames'
  //     }
  //   });

  //   requirejs(['config', 'lib/helper', 'lib/ajax', 'lockr', 'classnames'], function(config, h, ajax, lockr, classNames) {
  //       //check required params
  //       if (!params.apikey) {
  //         throw new Error('Api key is required');
  //       } else {
  //         // lockr.flush();
  //         lockr.prefix = config.prefix + params.apikey;
  //         classNames.prefix = config.prefix;
  //       }
  //       if (!params.container) {
  //         throw new Error('Container is required');
  //       }

  //       //add passed params to config
  //       config.setParams({
  //         apikey: params.apikey,
  //         container: params.container
  //       });
  //       if (params.sa) {
  //         config.setParam('sa', params.sa);
  //       }
  //       if (params.scriptPlace) {
  //         config.setParam('scriptPlace', params.scriptPlace);
  //       }
  //       if (params.apiBaseUrl) {
  //         config.setParam('apiBaseUrl', params.apiBaseUrl); 
  //       }

  //       //load widget styles
  //       h.loadCss( 'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,700' );
  //       h.loadCss( config.mainCss );

  //       //requiredjs config
  //       requirejs.config({
  //         baseUrl: './', 
  //         paths: {
  //           //bower_components
  //           'moment': 'bower_components/moment/moment',
  //           'react': 'bower_components/react/react',
  //           'reactDom': 'bower_components/react/react-dom',
  //           'microevent': 'bower_components/microevent/microevent',
  //           'validate': 'bower_components/validate/validate',
  //           'lodash': 'bower_components/lodash/lodash',
  //           // vendor
  //           'stripe': 'https://js.stripe.com/v2/stripe',
  //           // own scripts
  //           'comp': 'components/loader'
  //         }
  //       });
        
  //       var render = function() {
  //         requirejs(['react', 'reactDom', 'comp!Widget', 'actions/actions'], function(React, ReactDOM, Widget, Act) {
  //           var container = document.getElementById(config.container);
  //           container.style.minHeight = '315px';
            
  //           var props = {};

  //           if (!self.overlayNode) {
  //             // append overlays (popup/message/loading/shadow) to the end of body
  //             var body = document.getElementsByTagName('body')[0];
  //             self.overlayNode = document.createElement("div");
  //             self.overlayNode.style.position = 'absolute';
  //             self.overlayNode.style.top = 0;
  //             self.overlayNode.style.width = '100%';
  //             self.overlayNode.style.zIndex = 999999;
  //             self.overlayNode.style.overflow = 'visible';
  //             body.appendChild(self.overlayNode);
  //           }

  //           ReactDOM.unmountComponentAtNode(container); // needed if init has been called again
  //           ReactDOM.unmountComponentAtNode(self.overlayNode); // needed if init has been called again
  //           // container.innerHTML = '';
  //           // self.overlayNode.innerHTML = '';

  //           // append search part of widget
  //           props.part = 'search';
  //           ReactDOM.render(
  //             React.createElement(Widget, props),
  //             container
  //           );

  //           props.part = 'overlay';
  //           ReactDOM.render(
  //             React.createElement(Widget, props),
  //             self.overlayNode
  //           );

  //           if (isMobile.any) {
  //             window.removeEventListener('resize', Act.Settings.adjastBaseFontSize);
  //             window.addEventListener('resize', Act.Settings.adjastBaseFontSize);
  //             Act.Settings.adjastBaseFontSize();
  //           }
  //         });
  //       }

  //       if (!config.sessionId) {
  //         ajax.make({
  //           url: 'session',
  //           method: 'post',
  //           data: {is_returned: config.isReturnedUser},
  //           success: function(response) {
  //             config.setParam('sessionId', response.data.session_id); // set sesstion id before start render
  //             render();
  //           }
  //         });
  //       } else {
  //         render();
  //       }
  //   });
  // }
}