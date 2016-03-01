define([
    'react',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
], function(
    React,
    cn,
    Act,
    h,
    customerStore
) {

    return {
        componentWillMount: function() {
            this._updateState();
        },
        componentDidMount: function() {
            customerStore.bind('change', this._updateState);

            var self = this;
            // load stripe here
            if (typeof window.Stripe == 'undefined') {
                requirejs(['stripe'], function() {
                    self._isStripeLoaded = true;
                });
            } else {
                self._isStripeLoaded = true;
            }
        },
        componentWillUnmount: function() {
            customerStore.unbind('change', this._updateState);    
        },

        render: function() {
            var quote = this.props.quote;
            var tire = this.props.tire;

            var recyclingFee = null;
            if (quote.recycling_fee) {
                recyclingFee = <tr>
                    <td>{quote.recycling_fee.name}</td>
                    <td>${h.priceFormat(quote.recycling_fee.total_value)}</td>
                </tr>;
            }

            return (
                <div>
                    <a href="#summary" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to your summary</a>

                    <div className={cn('order_wrapper')}>
                        <form action="confirmation.php" className={cn('order_form')} onSubmit={this._handleFormSubmit}>
                            <fieldset className={cn('order_options')}>
                                <div className={cn('order_option')}>
                                    <div className={cn('order_option_inner')}>
                                        <input style={ {display: 'none'} } type="radio" name="order_options" id={cn('order_option_cc')} value="credit-card" defaultChecked={true} />
                                        <label htmlFor={cn('order_option_cc')}>
                                            Pay with credit card 
                                            <img src="/img/credit-cards.png" alt="Visa, MasterCard, or American Express" />
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className={cn(['sixcol', 'col_left', 'order_fields'])}>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_your_name')}>Your Name <span className="req">*</span></label>
                                    <input type="text" id={cn('order_your_name')} required ref="name" defaultValue={this.state.values.name} />
                                    {this._getError('name')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_email')}>Email Address <span className="req">*</span></label>
                                    <input type="email" id={cn('order_email')} required ref="email" defaultValue={this.state.values.email} />
                                    {this._getError('email')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_phone')}>Phone Number <span className="req">*</span></label>
                                    <input type="tel" id={cn('order_phone')} required ref="phone" defaultValue={this.state.values.phone} />
                                    {this._getError('phone')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_date_time')}>Preferred Date and Time</label>
                                    <input type="text" id={cn('order_date_time')} className={cn('datepicker')} ref="preferred_time" defaultValue={this.state.values.preferred_time} />
                                    {this._getError('preferred_time')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_card_number')}>Credit Card Number <span className="req">*</span></label>
                                    <input type="text" id={cn('order_card_number')} autoComplete="off" pattern="\d*" required ref="card_number" />
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_cvc_number')}>CVC Number <span className="req">*</span><small className={cn('label_note')}>(3 digit security code on the back of the card)</small></label>
                                    <input type="text" id={cn('order_cvc_number')} className={cn('sixcol')} autoComplete="off" maxLength="4" pattern="\d*" required ref="cvc_number" />
                                </div>
                                <div className={cn(['control_wrapper', 'order_expiration'])}>
                                    <label htmlFor={cn('order_expiration_month')}>Expiration Date (MM/YYYY) <span className="req">*</span></label>
                                    <input type="text" id={cn('order_expiration_month')} className={cn('sixcol')} maxLength="2" pattern="\d*" required ref="exp_month" />
                                    <input type="text" id={cn('order_expiration_year')} className={cn(['sixcol', 'last'])} maxLength="4" pattern="\d*" required ref="exp_year" />
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_info')}>Vehicle Info</label>
                                    <textarea id={cn('vehicle_info')} defaultValue={this.state.values.vehicle_info ? this.state.values.vehicle_info : this.props.vehicleInfo} />
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_notes')}>Notes</label>
                                    <textarea id={cn('order_notes')} defaultValue={this.state.values.notes} />
                                </div>
                            </fieldset>
                            <div className={cn(['sixcol', 'last', 'col_right', 'order_info'])}>
                                <div className={cn('table_wrapper')}>
                                    <table className={cn('table')}>
                                        <thead>
                                            <tr>
                                                <th>Total</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Sub-total</td>
                                                <td>${h.priceFormat(quote.total.sub_total)}</td>
                                            </tr>
                                            { recyclingFee && quote.recycling_fee.is_taxable ? recyclingFee : null }
                                            <tr>
                                                <td>{quote.tax.name}</td>
                                                <td>${h.priceFormat(quote.tax.total_value)}</td>
                                            </tr>
                                            { recyclingFee && quote.recycling_fee.is_taxable ? null : recyclingFee }
                                        </tbody>
                                        <tfoot>
                                            <tr className="light">
                                                <td>Total Price:</td>
                                                <td>${h.priceFormat(quote.total.price)}</td>
                                            </tr>
                                            <tr>
                                                <td>What you pay today:</td>
                                                <td>$51.44</td>
                                            </tr>
                                            <tr className="light">
                                                <td>Outstanding Balance:</td>
                                                <td>$977.31</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <p className={cn('textcenter')}>
                                    <em>* Outstanding balance will be payable after installation.</em>
                                    <img src="/img/verify-security.png" alt="GoDaddy.com verified and secured" className={cn('verified')} />
                                </p>
                                <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5CA;' }} /> Place Your Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        },

        _isStripeLoaded: false,
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

            //TODO: process stripe
            if (!this._isStripeLoaded) {
                Act.Popup.show('alert', {title: 'We are sorry.', content: 'Some scripts, needed for payment, has not been loaded. Please try again.'});
                // this.setState({'disabled': false});
                return;
            }
            if (!window.Stripe || !window.Stripe.setPublishableKey) {
                Act.Popup.show('alert', {title: 'We are sorry.', content: 'Scripts needed for payment has not been found.'});
                // this.setState({'disabled': false});
                return;
            }

            var self = this;
            window.Stripe.setPublishableKey(settings.dealer.ecommerce.services.stripe.publishable_key);
            window.Stripe.card.createToken(this.state.values, function(status, response){
                if (response.error) {
                    // self.setState({'errors': {'global': response.error.message}, 'disabled': false});
                } else {
                    // Act.Order.payment(response.id); 
                }
            });


            var values = {
                name: this.refs.name.value,
                email: this.refs.email.value,
                phone: this.refs.phone.value,
                preferred_time: this.refs.time.value,
                notes: this.refs.notes.value,
                vehicle_info: this.refs.vehicle_info.value
            };

            Act.Order.payment(values);
        }
    }

});