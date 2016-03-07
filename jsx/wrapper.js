define([
    'react',
    'reactDOM',
    'classnames', 
    'config',
    'load!components/header', 
    'load!components/page',
    'load!stores/dealerStore'
], function(
    React,
    ReactDOM,
    cn, 
    config,
    Header, 
    Page,
    dealerStore
) {

    var Logo = React.createClass({
        componentWillMount: function() {
            this._updateState();
        },
        componentDidMount: function() {
            if (config.sa) dealerStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            if (config.sa) dealerStore.unbind('change', this._updateState);    
        },

        render: function() {
            if (config.sa) {
                return (
                    <div className={cn(['twelvecol', 'instore_header'])}>
                        <div className={cn(['sixcol', 'col_left'])}>
                            <img src={this.state.logo} alt={this.state.companyName} className={cn('instore_logo')} />
                            <a href={config.wlUrl + '/backend.php'} rel="nofollow" target="_blank">Account Login</a>
                        </div>
                        <div className={cn(['sixcol', 'last', 'col_right'])}>
                            <h3 className={cn('instore_title')}>{this.state.companyName}</h3>
                        </div>
                    </div>
                );
            } else {
                var showTCLogo = dealerStore.getShowTCLogo();
                return showTCLogo ? <p className={cn('powered_by')}>Powered by <img src="/img/tireconnect-logo.png" alt="TireConnect" /></p> : null;
            }
        },

        _updateState: function() {
            if (config.sa) {
                this.setState({
                    'companyName': dealerStore.getCompanyName(),
                    'logo': dealerStore.getLogo()
                });
            }
        },
    });



    return {
        componentDidMount: function() {
            this._checkContainerWidth();
            if (window.addEventListener) {
              window.addEventListener('resize', this._checkContainerWidth, false);
            } else {
              window.attachEvent('onresize', this._checkContainerWidth);
            }
        },

        render: function() {
            return (
                <div id={cn('widget')}>
                    <Logo />
                    <div className={cn('wrapper')}>
                        <Header />
                        <Page />
                    </div>
                </div>
            );
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