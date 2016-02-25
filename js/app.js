window.TCWidget = {
    overlayNode: null,
    init: function(params) {
        requirejs.config({
          baseUrl: './js/', 
          paths: {
            'lockr': 'bower_components/lockr/lockr',
            'classnames': 'lib/classnames'
          }
        });

        requirejs(['config', 'lib/helper', 'lockr', 'classnames'], function(config, h, lockr, cn) {
            if (!params.apikey) {
                throw new Error('Api key is required');
            } else {
                // lockr.flush();
                lockr.prefix = config.prefix + params.apikey;
                cn.prefix = config.prefix;
            }
            if (!params.container) {
                throw new Error('Container is required');
            }

            //add passed params to config
            config.setParams({
                apikey: params.apikey,
                container: params.container
            });


            h.loadCss( 'css/style.css' );
            h.loadCss( 'https://fonts.googleapis.com/icon?family=Material+Icons' );

            requirejs.config({
                baseUrl: './js/', 
                paths: {
                  'isMobile': 'bower_components/isMobile/isMobile',
                  'lodash': 'bower_components/lodash/lodash',
                  'dispatcher': 'lib/dispatcher',
                  'ajax': 'lib/ajax',
                  'react': 'bower_components/react/react',
                  'reactDOM': 'bower_components/react/react-dom',
                  'microEvent': 'bower_components/microevent/microevent',
                  'load': 'loader',
                }
            });

//'load!components/overlay', Overlay
            requirejs(['react', 'reactDOM', 'load!components/wrapper',  'load!actions/actions'], function(React, ReactDOM, Wrapper, Act) {
                var container = document.getElementById(params.container);

                ReactDOM.render(
                    React.createElement(Wrapper),
                    container
                );

                if (!self.overlayNode) {
                  // append overlays (popup/message/loading/shadow) to the end of body
                  var body = document.getElementsByTagName('body')[0];
                  self.overlayNode = document.createElement("div");
                  self.overlayNode.style.position = 'absolute';
                  self.overlayNode.style.top = 0;
                  self.overlayNode.style.width = '100%';
                  self.overlayNode.style.zIndex = 999999;
                  self.overlayNode.style.overflow = 'visible';
                  body.appendChild(self.overlayNode);
                }

                // ReactDOM.render(
                //   React.createElement(Overlay, props),
                //   self.overlayNode
                // );

                Act.init();
            });
        });
    }
}