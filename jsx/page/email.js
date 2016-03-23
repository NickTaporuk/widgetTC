define([
    'react',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
    'load!components/page/common/mainPrices'
], function(
    React,
    cn,
    Act,
    h,
    customerStore,
    MainPrices
) {

    return {
        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            customerStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            customerStore.unbind('change', this._updateState);
        },

        render: function() {
            var tire = this.props.tire;

            return (
                <div>
                    {this._getBackLink()}

                    <div className={cn('summary_wrapper')}>
                        <form action="" className={cn('appointment_form')} onSubmit={this._handleFormSubmit}>
                            <fieldset className={cn(['sixcol', 'last', 'right', 'col_right', 'appointment_fields'])}>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_email')}>Email Address <span className="req">*</span></label>
                                    <input type="email" id={cn('order_email')} required ref="email" defaultValue={this.state.values.email} />
                                    {this._getError('email')}
                                </div>
                                {this._getBtn()}
                            </fieldset>
                            <div className={cn(['sixcol', 'col_left', 'appointment_info'])}>
                                <MainPrices quote={this.props.quote} />
                            </div>
                        </form>
                    </div>
                </div>
            );
        },

        _getBackLink: function() {
            return <a href="#summary" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back</a>
        },

        _getBtn: function() {
            return <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Send email</button>
        },

        _getError: function(fieldName) {
            if (this.state.errors[fieldName]) {
                return <span className={cn(['message', 'error', 'appointment_fields'])}>
                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> {this.state.errors[fieldName][0]}
                </span>;
            } else {
                return null;
            }
        },

        _updateState: function() {
            this.setState({
                errors: customerStore.getValidationErrors(),
                values: customerStore.getCustomer()
            });
        },

        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('quote');
        },

        _handleFormSubmit: function(event) {
            event.preventDefault();
            Act.Quote.email({ email: this.refs.email.value });
        }
    }

});