define([
    'react',
    'classnames',
    'config',
    'load!actions/act',
    'load!components/page/common/back',
    'actions/api',
    'load!stores/appStore'
], function(
    React,
    cn,
    config,
    A,
    Back,
    Api,
    appStore
) {
   
    return {
        displayName: 'get_a_quote',

        componentWillMount: function () {
            var lastState = appStore.getPageState(this);
            if (lastState) {
                this.setState(lastState);
            } else {
                this.setState({
                    follow_up: config.sa ? false : config.defaultQuoteCallBack
                });
            }
        },

        render: function() {
            return (
                <div>
                    <Back />

                    <div className={cn(['quote_wrapper', 'max_width'])}>
                        <div className={cn(['row'])}>
                            <div className={cn(['textcenter', 'sixcol'])}>
                                <a href="#print" onClick={this._handleEmailClick}  className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Email Quote</a>
                            </div>
                            <div className={cn(['textcenter', 'sixcol', 'last'])}>
                                <a href="#print" onClick={this._handlePrintClick}  className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                            </div>
                        </div>


                        <div>
                            <p>
                                <strong>A tire specialist is standing by to call and answer any questions you may have or help you schedule an appointment.</strong>
                            </p>
                            <div className={cn('control_wrapper')}>
                                <label>
                                    <input type="checkbox" ref="follow_up" defaultChecked={this.state.follow_up} onChange={this._handleFollowUpChange} /> Request a callback
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },

        _handleFollowUpChange: function (event) {
            this.setState({
                follow_up: event.target.checked
            });
        },

        _handlePrintClick: function(event) {
            event.preventDefault();
            if ( this.refs.follow_up.checked ) {
                A.route('quote_form', {type: 'print'});
            } else {
                var summaryProps = appStore.getPageProps('summary');
                Api.printQuote(summaryProps).then(function() {
                    history.back();
                });
            }
        },
        
        _handleEmailClick: function(event) {
            event.preventDefault();
            if ( this.refs.follow_up.checked ) {
                A.route('quote_form', {type: 'email'});
            } else {
                A.route('email_form');
            }  
        }
    }


});