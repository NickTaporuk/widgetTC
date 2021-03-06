window.TCWidget = {
    containerNode: null,
    overlayNode: null,
    init: function (params) {
        var self = this;

        requirejs.config({
            baseUrl: './js/',
            waitSeconds: 15,
            paths: {
                lockr: 'bower_components/lockr/lockr',
                classnames: 'lib/classnames',
                isMobile: 'bower_components/isMobile/isMobile',
                lodash: 'bower_components/lodash/lodash',
                validate: 'bower_components/validate/validate',
                moment: 'bower_components/moment/moment',
                dispatcher: 'lib/dispatcher',
                ajax: 'lib/ajax',
                react: 'bower_components/react/react',
                reactDOM: 'bower_components/react/react-dom',
                microEvent: 'bower_components/microevent/microevent',
                promise: 'bower_components/es6-promise-polyfill/promise',
                load: 'loader',
                stripe: 'https://js.stripe.com/v2/stripe'
            }
        });

        // 'lib/cssLoader' need to be loaded here for optimizer
        requirejs(['config', 'lib/cssLoader'], function (config) {
            config.init(params);

            requirejs(
                [
                    'react', 'reactDOM',
                    'load!components/wrapper', 'load!actions/act', 'load!components/overlay',
                    'classnames', 'actions/api', 'ajax', 'colors',
                    'lib/cssLoader!' + config.mainCss
                ],
                function (React, ReactDOM, Wrapper, Act, Overlay, cn, Api, ajax, colors) {

                    if (config.colors) {
                        colors.changeColorScheme(config.colors[0], config.colors[1]);
                    }

                    var render = function () {
                        ajax.clearCache();

                        self.containerNode = document.getElementById(params.container);

                        if (!self.overlayNode) {
                            // append overlays (popup/message/loading/shadow) to the end of body
                            var body = document.getElementsByTagName('body')[0];
                            self.overlayNode = document.createElement("div");
                            self.overlayNode.id = cn('widget_outer');
                            body.appendChild(self.overlayNode);
                        }

                        self.destroy();

                        ReactDOM.render(
                            React.createElement(Wrapper),
                            self.containerNode
                        );

                        ReactDOM.render(
                            React.createElement(Overlay),
                            self.overlayNode
                        );
                    };

                    render();

                    if (!config.sessionId) {
                        Api.setSession().then(function (sessionId) {
                            config.setParam('sessionId', sessionId);
                            Act.init();
                        });
                    } else {
                        Act.init();
                    }
                });
        });
    },
    destroy: function() {
        if (this.containerNode) {
            var ReactDOM = requirejs('reactDOM');
            ReactDOM.unmountComponentAtNode(this.containerNode); // needed if init has been called again
            ReactDOM.unmountComponentAtNode(this.overlayNode); // needed if init has been called again
        }
    }
};