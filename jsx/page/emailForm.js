define([
    'react',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!components/page/common/mainPrices',
    'load!components/page/common/back',
    'actions/api',
    'load!stores/appStore',
    'load!stores/customerStore',
    'promise',
    'lib/history'
], function(
    React,
    cn,
    A,
    h,
    MainPrices,
    Back,
    Api,
    appStore,
    customerStore,
    Promise,
    history
) {

    var quote;

    return {
        displayName: 'email_form',

        statics: {
            prepare: function() {
                var summaryProps = appStore.getPageProps('summary');

                return Promise.all([
                    Api.loadQuote(summaryProps.tire_id, summaryProps.quantity, summaryProps.optional_services, summaryProps.with_discount, summaryProps.custom_discount)
                ]).then(function (responses) {
                    quote = responses[0]
                });
            }
        },

        componentWillMount: function() {
            this.setState({
                values: customerStore.getCustomerInfo(),
                quote: quote
            });
        },

        render: function() {

            return (
                <div>
                    <Back />

                    <div className={cn('summary_wrapper')}>
                        <form action="" className={cn('appointment_form')} onSubmit={this._handleFormSubmit}>
                            <div className={cn(['sixcol', 'col_left', 'appointment_info'])}>
                                <MainPrices quote={this.state.quote} />
                            </div>
                            <fieldset className={cn(['sixcol', 'last', 'right', 'col_right', 'appointment_fields'])}>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_email')}>Email Address <span className="req">*</span></label>
                                    <input type="email" id={cn('order_email')} required ref="email" defaultValue={ this.state.values.email }/>
                                    {this._getError('email')}
                                </div>
                                { this._getBtn() }
                            </fieldset>
                        </form>
                    </div>
                </div>
            );
        },

        _getBtn: function() {
            return <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Send email</button>
        },

        _getError: function(fieldName) {
            if (this.state.errors && this.state.errors[fieldName]) {
                return <span className={cn(['message', 'error', 'appointment_fields'])}>
                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> {this.state.errors[fieldName][0]}
                </span>;
            } else {
                return null;
            }
        },

        _handleFormSubmit: function(event) {
            event.preventDefault();

            var self = this;

            var summaryProps = appStore.getPageProps('summary');
            summaryProps.email = this.refs.email.value;
            summaryProps.follow_up = false;

            Api.emailQuote(summaryProps).then(function(response) {
                A.popup.show(response.title, response.data);
                history.back();
            }).catch(function(errors) {
                self.setState({
                    errors: errors
                });
            });
        }
    }

});