define([
    'react',
    'classnames', 
    'config',
    'load!stores/dealerStore'
], function(
    React,
    cn, 
    config,
    dealerStore
) {

    return {
        displayName: 'Top',

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
                return showTCLogo ? <p className={cn('powered_by')}>Powered by <img src={config.imagesFolder + 'tireconnect-logo.png'} alt="TireConnect" /></p> : null;
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
    };

});