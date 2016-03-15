define([
    'react',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
    'load!stores/vehicleStore',
    'load!components/elements/select',
    'validate',
    'moment',
    'components/datetime/DateTime',
    'config'
], function(
    React,
    cn,
    Act,
    h,
    customerStore,
    vehicleStore,
    SelectField,
    validate,
    moment,
    DateTime,
    config
) {

    return {
        getInitialState: function() {
            return {
                disabled: false
            };
        },

        componentWillMount: function() {
            this._updateState();
        },
        componentDidMount: function() {
            customerStore.bind('change', this._updateState);
            vehicleStore.bind('change', this._updateState);

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
            vehicleStore.unbind('change', this._updateState);    
        },

        render: function() {
            var quote = this.props.quote;
            var tire = this.props.tire;
            var order = this.props.order;

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
                                            Supported credit cards
                                            <img src={config.imagesFolder + 'credit-cards.png'} alt="Visa, MasterCard, or American Express" />
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className={cn(['sixcol', 'col_left', 'order_fields'])}>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_your_name')}>Your Name <span className="req">*</span></label>
                                    <input type="text" id={cn('order_your_name')} required ref="name" defaultValue={this.state.values.name} disabled={this.state.status == 'incomplete'} />
                                    {this._getError('name')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_email')}>Email Address <span className="req">*</span></label>
                                    <input type="email" id={cn('order_email')} required ref="email" defaultValue={this.state.values.email} disabled={this.state.status == 'incomplete'} />
                                    {this._getError('email')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_phone')}>Phone Number <span className="req">*</span></label>
                                    <input type="tel" id={cn('order_phone')} required ref="phone" defaultValue={this.state.values.phone} disabled={this.state.status == 'incomplete'} />
                                    {this._getError('phone')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_date_time')}>Preferred Date and Time</label>
                                    <DateTime isValidDate={this._isValidDate} inputProps={ {'name': "preferred_time", 'readOnly': true} } ref="datetime" defaultValue={this.state.values.preferred_time} dateFormat="YYYY-MM-DD" timeFormat="HH:mm"/>
                                    {this._getError('preferred_time')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_year')}>Vehicle Info <span className="req">*</span></label>
                                    <div className={cn(['sixcol', 'field'])}>
                                        <SelectField name="year" options={this.state.options.years} emptyDesc="- Year -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.year} />
                                    </div>
                                    <div className={cn(['sixcol', 'last', 'field'])}>
                                        <SelectField name="make" options={this.state.options.makes} emptyDesc="- Make -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.make} />
                                    </div>
                                </div>

                                <div className={cn('control_wrapper')}>
                                    <div className={cn('row')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <SelectField name="model" options={this.state.options.models} emptyDesc="- Model -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.model} />
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <SelectField name="trim" options={this.state.options.trims} emptyDesc="- Trim -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.trim} />
                                        </div>
                                    </div>
                                    {this._getError('vehicle_info')}
                                </div>
                                
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_notes')}>Notes</label>
                                    <textarea id={cn('order_notes')} defaultValue={this.state.values.notes} ref="notes" disabled={this.state.status == 'incomplete'} />
                                </div>
                            </fieldset>
                            <div className={cn(['sixcol', 'last', 'col_right', 'order_info'])}>
                                
                                {/*<div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_info')}>Vehicle Info</label>
                                    <textarea id={cn('vehicle_info')} defaultValue={this.state.values.vehicle_info ? this.state.values.vehicle_info : this.props.vehicleInfo} ref="vehicle_info" disabled={this.state.status == 'incomplete'} />
                                </div>*/}
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_card_number')}>Credit Card Number <span className="req">*</span></label>
                                    <input type="text" id={cn('order_card_number')} autoComplete="off" pattern="\d*" required ref="card_number" defaultValue="4242424242424242" />
                                    {this._getError('number')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_cvc_number')}>CVC Number <span className="req">*</span><small className={cn('label_note')}>(3 digit security code on the back of the card)</small></label>
                                    <input type="text" id={cn('order_cvc_number')} className={cn('sixcol')} autoComplete="off" maxLength="4" pattern="\d*" required ref="cvc_number" defaultValue="123" />
                                    <div style={{clear: 'both'}} />
                                    {this._getError('cvc')}
                                </div>
                                <div className={cn(['control_wrapper', 'order_expiration'])}>
                                    <label htmlFor={cn('order_expiration_month')}>Expiration Date (MM/YYYY) <span className="req">*</span></label>
                                    <input type="text" id={cn('order_expiration_month')} className={cn('sixcol')} maxLength="2" pattern="\d*" required ref="exp_month" defaultValue="12" />
                                    <input type="text" id={cn('order_expiration_year')} className={cn(['sixcol', 'last'])} maxLength="4" pattern="\d*" required ref="exp_year" defaultValue="2016" />
                                    <div style={{clear: 'both'}} />
                                    {this._getError('exp_month')}
                                    {this._getError('exp_year')}
                                </div>
                                

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
                                            <tr className={cn('light')}>
                                                <td>Total Price:</td>
                                                <td>${h.priceFormat(quote.total.price)}</td>
                                            </tr>
                                            <tr>
                                                <td>What you pay today:</td>
                                                <td>${h.priceFormat(order.deposit_payment)}</td>
                                            </tr>
                                            <tr className={cn('light')}>
                                                <td>Outstanding Balance:</td>
                                                <td>${h.priceFormat(order.outstanding_balance)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <p className={cn('textcenter')}>
                                    <em>* Outstanding balance will be payable after installation.</em>
                                    <img src={config.imagesFolder + 'verify-security.png'} alt="GoDaddy.com verified and secured" className={cn('verified')} />
                                </p>
                                <button disabled={this.state.disabled} type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5CA;' }} /> Place Your Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        },

        _isValidDate: function( current ) {
            return current.isAfter( moment().add(1, 'd').subtract(1,'day') );
        },

        _getVehicleSelector: function(fieldName) {
            var options = [];
            this.state.vehicle[fieldName]


            return (
                <select id={cn('vehicle_' + fieldName)} name={fieldName}>
                    <option value="">- Year -</option>
                </select>
            );
        },

        _isStripeLoaded: false,
        _getError: function(fieldName) {
            if (this.state.errors[fieldName]) {
                return <span className={cn(['message', 'error', 'appointment_fields'])}>
                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> {Array.isArray(this.state.errors[fieldName]) ? this.state.errors[fieldName][0] : this.state.errors[fieldName]}
                </span>;
            } else {
                return null;
            }
        },
        _updateState: function() {
            var order = customerStore.getOrder();
            var values = customerStore.getCustomer();

            this.setState({
                errors: customerStore.getValidationErrors(),
                values: values,
                status: order.status,
                disabled: false,
                options: vehicleStore.getAll(values.vehicle.year, values.vehicle.make, values.vehicle.model, values.vehicle.trim)
            });
        },
        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('summary');
        },

        _checkStripeValues: function(stripeValues) {

            if (!this._isStripeLoaded) {
                Act.Popup.show('alert', {title: 'We are sorry.', content: 'Some scripts, needed for payment, has not been loaded. Please try again.'});
                this.setState({'disabled': false});
                return false;
            }
            if (!window.Stripe || !window.Stripe.setPublishableKey) {
                Act.Popup.show('alert', {title: 'We are sorry.', content: 'Scripts needed for payment has not been found.'});
                this.setState({'disabled': false});
                return false;
            }

            var constraints  = {
                number: {
                    presence: true,
                    length: {is: 16}
                },
                cvc: {
                    presence: true,
                    length: {is: 3},
                    numericality: {onlyInteger: true}
                },
                exp_month: {
                    presence: true,
                    length: {is: 2},
                    numericality: {onlyInteger: true, lessThanOrEqualTo: 12, greaterThan: 0}
                },
                exp_year: {
                    presence: true,
                    length: {is: 4},
                    numericality: {onlyInteger: true}
                }
            };

            var errors = validate(stripeValues, constraints);
            this.setState({errors: (errors || {})});
            return (errors === undefined);
        },

        _handleFormSubmit: function(event) {
            event.preventDefault();
            this.setState({'disabled': true});

            var stripeValues = {
                number: this.refs.card_number.value,
                cvc: this.refs.cvc_number.value,
                exp_month: this.refs.exp_month.value,
                exp_year: this.refs.exp_year.value 
            };

            if (this._checkStripeValues(stripeValues)) {
                var self = this;
                window.Stripe.setPublishableKey(this.props.stripeKey);
                window.Stripe.card.createToken(stripeValues, function(status, response) {
                    if (response.error) {
                        if (response.error.type === 'card_error') {
                            var errors = {};
                            errors[response.error.param] = [response.error.message];
                            self.setState({'errors': errors, 'disabled': false});
                        } else {
                            self.setState({'errors': {'global': [response.error.message]}, 'disabled': false});    
                        }
                    } else {
                        var values = {
                            token: response.id,
                            name: self.refs.name.value,
                            email: self.refs.email.value,
                            phone: self.refs.phone.value,
                            preferred_time: self.refs.datetime.value(),
                            notes: self.refs.notes.value,
                            vehicle_info: self._getVehicleInfo(),
                        };

                        Act.Order.payment(values); 
                    }
                });
            } else {
                this.setState({'disabled': false});
            }
        },

        _getVehicleInfo: function() {
            if (this.state.values.vehicle.trim) {
                return this.state.values.vehicle.year + ' ' + this.state.values.vehicle.make + ' ' + this.state.values.vehicle.model + ' ' + this.state.values.vehicle.trim;
            } else {
                return '';
            }
        },

        _vehicleChange: function(event) {
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name;
            var index = fields.indexOf(fieldName);

            // var value = event.traget.value;
            var values = this.state.values.vehicle;
            values[fieldName] = event.target.value;
            
            var values = {
                year: values.year,
                make: index < 1 ? '' : values.make,
                model: index < 2 ? '' : values.model,
                trim: index < 3 ? '' : values.trim
            };

            Act.Vehicle.change(values, 'customer');
        }
    }

});