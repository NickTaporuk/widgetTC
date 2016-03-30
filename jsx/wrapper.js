define([
    'react',
    'reactDOM',
    'classnames', 
    'config',
    'load!components/top',
    'load!components/header', 
    'load!components/page',
    'load!components/preloader',
    'load!stores/widgetStore'
], function(
    React,
    ReactDOM,
    cn, 
    config,
    Top,
    Header, 
    Page,
    Preloader,
    widgetStore
) {

    return {
        displayName: 'Wrapper',

        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            this._checkContainerWidth();
            if (window.addEventListener) {
              window.addEventListener('resize', this._checkContainerWidth, false);
            } else {
              window.attachEvent('onresize', this._checkContainerWidth);
            }

            widgetStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            widgetStore.unbind('change', this._updateState);
        },

        render: function() {
            if (!this.state.ready) {
                return <Preloader />
            } else {
                return (
                    <div id={cn('widget')}>
                        <Top />
                        <div className={cn('wrapper')}>
                            <Header />
                            <Page />
                        </div>
                    </div>
                );
            }
        },

        _updateState: function() {
            this.setState({
                ready: widgetStore.getIsReady()
            });
        },

        _checkContainerWidth: function() {
            var el = ReactDOM.findDOMNode(this)
            var tireconnect = el.parentElement,
                tireconnectWidth = tireconnect.offsetWidth;

            if (tireconnectWidth >= 1024) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m l');
            } else if (tireconnectWidth < 1024 && tireconnectWidth >= 768) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m');
            } else if (tireconnectWidth < 768 && tireconnectWidth >= 600) {
                tireconnect.setAttribute('data-tcwlw-w', 't s');
            } else {
                tireconnect.setAttribute('data-tcwlw-w', 't');
            }
        }
    };

});