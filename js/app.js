window.TCWidget = {
    overlayNode: null,
    init: function(params) {
        requirejs.config({
            baseUrl: './js/', 
            paths: {
                lockr: 'bower_components/lockr/lockr',
                classnames: 'lib/classnames'
            }
        });

        requirejs(['config', 'lib/helper', 'lockr', 'classnames'], function(config, h, lockr, cn) {
            if (!params.apikey) {
                throw new Error('Api key is required');
            } else {
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
            if (params.sa) {
              config.setParam('sa', params.sa);
            }
            if (params.scriptPlace) {
              config.setParam('scriptPlace', params.scriptPlace);
            }
            if (params.apiBaseUrl) {
              config.setParam('apiBaseUrl', params.apiBaseUrl); 
            }

            h.loadCss(config.mainCss);
            h.loadCss('https://fonts.googleapis.com/icon?family=Material+Icons');

            requirejs.config({
                baseUrl: './js/', 
                paths: {
                    isMobile: 'bower_components/isMobile/isMobile',
                    lodash: 'bower_components/lodash/lodash',
                    validate: 'bower_components/validate/validate',
                    moment: 'bower_components/moment/moment',
                    dispatcher: 'lib/dispatcher',
                    ajax: 'lib/ajax',
                    react: 'bower_components/react/react',
                    reactDOM: 'bower_components/react/react-dom',
                    microEvent: 'bower_components/microevent/microevent',
                    load: 'loader',
                    stripe: 'https://js.stripe.com/v2/stripe'
                }
            });

            requirejs(['react', 'reactDOM', 'load!components/wrapper', 'load!actions/actions', 'load!components/overlay', 'classnames', 'load!stores/widgetStore', 'actions/api'], 
            function(React, ReactDOM, Wrapper, Act, Overlay, cn, widgetStore, Api) {
                
                var render = function() {
                    if (widgetStore.getIsReady()) {
                        var container = document.getElementById(params.container);

                        if (!self.overlayNode) {
                            // append overlays (popup/message/loading/shadow) to the end of body
                            var body = document.getElementsByTagName('body')[0];
                            self.overlayNode = document.createElement("div");
                            self.overlayNode.id = cn('widget_outer');
                            body.appendChild(self.overlayNode);
                        }

                        ReactDOM.unmountComponentAtNode(container); // needed if init has been called again
                        ReactDOM.unmountComponentAtNode(self.overlayNode); // needed if init has been called again

                        ReactDOM.render(
                            React.createElement(Wrapper),
                            container
                        );

                        ReactDOM.render(
                            React.createElement(Overlay),
                            self.overlayNode
                        );

                        widgetStore.unbind('change', render);
                    }
                };

                widgetStore.bind('change', render);

                if (!config.sessionId) {
                    Api.setSession(function(sessionId) {
                        config.setParam('sessionId', sessionId);
                        Act.init();                        
                    })
                } else {
                    Act.init();
                }
            });
        });
    }
}