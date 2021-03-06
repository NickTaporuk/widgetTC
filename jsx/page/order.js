define([
    'react',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!components/elements/select',
    'load!components/page/common/mainPrices',
    'validate',
    'moment',
    'load!components/page/common/formField',
    'load!components/page/common/back',
    'config',
    'actions/api',
    'load!stores/appStore',
    'load!stores/customerStore',
    'promise',
    'lodash'
], function(
    React,
    cn,
    A,
    h,
    SelectField,
    MainPrices,
    validate,
    moment,
    Field,
    Back,
    config,
    Api,
    appStore,
    customerStore,
    Promise,
    _
) {
    var vehicleValues,  vehicleOptions, quote, order, dealerConfig;

    return {
        displayName: 'order',

        statics: {
            prepare: function() {
                var summaryState = appStore.getPageState('summary');
                quote = summaryState.quote;

                var searchState = appStore.getPageState('search');

                var customer = customerStore.getCustomerInfo();

                vehicleValues = customer.vehicle.year
                    ? customer.vehicle
                    : (searchState ? searchState.fieldValues.vehicle : {});
                var summaryProps = appStore.getPageProps('summary');
                summaryProps.id = summaryProps.tire_id;
                delete summaryProps.tire_id;

                return Promise.all([
                    Api.loadVehicleOptions(vehicleValues),
                    Api.orderCreate({tires: [summaryProps]}),
                    Api.loadDealerConfig()
                ]).then(function(responses){
                    vehicleOptions = responses[0];
                    order = responses[1];
                    dealerConfig = responses[2];
                });
            }
        },

        getInitialState: function() {
            return {
                disabled: false,
                errors: {},
                values: {},
                intervalDate:{ month:[], years:[] }
            };
        },

        componentWillMount: function() {
            var today           = new Date(),
                todayYear       = today.getFullYear(),
                intervalYearAdd = 10,
                endIntervalYear = todayYear + intervalYearAdd,
                yearInterval    = [todayYear,endIntervalYear],
                monthInterval   = [1,12];

            var yearSelect      = this._initForSelect(yearInterval),
                monthSelect     = this._initForSelect(monthInterval);

            var intervalDate        = _.cloneDeep(this.state.intervalDate);
                intervalDate.month  = monthSelect;
                intervalDate.years  = yearSelect;

            var values = customerStore.getCustomerInfo();
            values.vehicle = vehicleValues;

            this.setState({
                values: values,
                intervalDate: intervalDate,

                options: vehicleOptions,
                quote: quote,
                order: order,
                status: order.status,
                stripeKey: dealerConfig.ecommerce.services.stripe.publishable_key
            });
        },

        componentDidMount: function() {
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

        componentDidUpdate: function(prevProps, prevState) {
            if (Object.keys(this.state.errors).length > 0 && !this.state.disabled && !_.isEqual(this.state.errors, prevState.errors)) {
                this._scrollToError();
            }
        },

        render: function() {
            return (
                <div>
                    <Back />

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

                                <Field type="text" name="name" onChange={this._fieldChange} defaultValue={this.state.values.name} ref="name" label="Your Name" required={true} error={this._getError('name')} disabled={this.state.status == 'incomplete'} />
                                <Field type="email" name="email" onChange={this._fieldChange} defaultValue={this.state.values.email} ref="email" label="Email Address" required={true} error={this._getError('email')} disabled={this.state.status == 'incomplete'} />
                                <Field type="tel" name="phone" onChange={this._fieldChange} defaultValue={this.state.values.phone} ref="phone" label="Phone Number" required={true} error={this._getError('phone')} disabled={this.state.status == 'incomplete'} />
                                <Field type="datetime" ref="datetime" name="datetime" onChange={this._fieldChange} defaultValue={this.state.values.preferred_time} label="Preferred Date and Time" disabled={this.state.status == 'incomplete'} error={this._getError('preferred_time')}
                                       custom={{
                                                isValidDate: this._isValidDate,
                                                inputProps: {'name': "preferred_time", 'readOnly': true},
                                                dateFormat: "YYYY-MM-DD",
                                                timeFormat: "HH:mm"
                                        }}
                                />

                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_year')}>Vehicle Info <span className="req">*</span></label>
                                    <div className={cn(['sixcol', 'field'])}>
                                        <SelectField name="year" options={this.state.options.year} disabled={this.state.status == 'incomplete'} emptyDesc="- Year -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.year} />
                                    </div>
                                    <div className={cn(['sixcol', 'last', 'field'])}>
                                        <SelectField name="make" options={this.state.options.make} disabled={this.state.status == 'incomplete'} emptyDesc="- Make -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.make} />
                                    </div>
                                </div>

                                <div className={cn('control_wrapper')}>
                                    <div className={cn('row')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <SelectField name="model" options={this.state.options.model} disabled={this.state.status == 'incomplete'} emptyDesc="- Model -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.model} />
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <SelectField name="trim" options={this.state.options.trim} disabled={this.state.status == 'incomplete'} emptyDesc="- Trim -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.trim} />
                                        </div>
                                    </div>
                                    {this._getError('vehicle.trim')}
                                </div>

                                <Field type="textarea" name="notes" onChange={this._fieldChange} defaultValue={this.state.values.notes} ref="notes" label="Notes" error={this._getError('notes')} disabled={this.state.status == 'incomplete'} />
                            </fieldset>
                            <div className={cn(['sixcol', 'last', 'col_right', 'order_info'])}>

                                <Field type="text" name="card_number" defaultValue="" ref="number" label="Credit Card Number" required={true} error={this._getError('number')}
                                       custom={{
                                        autoComplete: 'off',
                                        pattern: "\\d*",
                                        maxLength: 16
                                    }}
                                />

                                <Field type="text" name="cvc_number" defaultValue="" ref="cvc" label="VC Number" required={true} error={this._getError('cvc')}
                                       note="(3 digit security code on the back of the card)"
                                       custom={{
                                        autoComplete: 'off',
                                        pattern: "\\d*",
                                        className: cn('sixcol'),
                                        maxLength: 4
                                    }}
                                />

                                <div className={cn(['control_wrapper', 'order_expiration'])}>
                                    <label htmlFor={cn('order_expiration_month')}>Expiration Date (MM/YYYY) <span className="req">*</span></label>

                                <div className={cn(['sixcol', 'field'])}>
                                    <SelectField
                                        options={ this.state.intervalDate.month }
                                        ref="exp_month"
                                        id={cn('order_expiration_month')}
                                        name="exp_month"
                                        withWrapper={false}
                                        required={true}
                                        emptyDesc="- Month -"
                                    />
                                </div>

                                <div className={cn(['sixcol', 'last', 'field'])}>
                                    <SelectField
                                        options={ this.state.intervalDate.years }
                                        ref="exp_year"
                                        id={cn('order_expiration_year')}
                                        name="exp_year"
                                        withWrapper={false}
                                        required={true}
                                        emptyDesc="- Year -"
                                    />
                                </div>

                                    {this._getError('exp_month')}
                                    {this._getError('exp_year')}
                                </div>

                                <MainPrices quote={this.state.quote} order={this.state.order} />

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
        _initForSelect: function(interval){
            var o = [];
            for (var i=interval[0],end = interval[1]; i <= end;i++) {
                if(i < 10)  o.push({"value": '0'+i.toString(),"description":'0'+i.toString()});
                else o.push({"value":i,"description":i});
            }
            return o;
        },

        _fieldChange: function(event) {
            var values = _.cloneDeep(this.state.values);
            values[event.target.name] = event.target.value;
            this.setState({
                values: values
            });
        },

        _isValidDate: function( current ) {
            return current.isAfter( moment().add(1, 'd').subtract(1,'day') );
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

        _checkStripeValues: function(stripeValues) {
            if (!this._isStripeLoaded) {
                A.Popup.show('We are sorry.', 'Some scripts, needed for payment, has not been loaded. Please try again.');
                this.setState({'disabled': false});
                return false;
            }
            if (!window.Stripe || !window.Stripe.setPublishableKey) {
                A.Popup.show('We are sorry.', 'Scripts needed for payment has not been found.');
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
                },
                exp_year: {
                    presence: true,
                    length: {is: 4},
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
                number: this.refs.number.value(),
                cvc: this.refs.cvc.value(),
                exp_month: this.refs.exp_month.value(),
                exp_year: this.refs.exp_year.value()
            };
            if (this._checkStripeValues(stripeValues)) {
                var self = this;
                window.Stripe.setPublishableKey(this.state.stripeKey);
                window.Stripe.card.createToken(stripeValues, function(status, response) {
                    if (response.error) {
                        if (response.error.type === 'card_error') {
                            var errors = {};
                            errors[(response.error.param ? response.error.param : 'number')] = [response.error.message];
                            self.setState({'errors': errors, 'disabled': false});
                        } else {
                            self.setState({'errors': {'global': [response.error.message]}, 'disabled': false});    
                        }
                    } else {
                        var values = {
                            token: response.id,
                            name: self.refs.name.value(),
                            email: self.refs.email.value(),
                            phone: self.refs.phone.value(),
                            preferred_time: self.refs.datetime.value(),
                            notes: self.refs.notes.value(),
                            vehicle: self.state.values.vehicle
                        };

                        var payment = function() {
                            Api.orderPayment(self.state.order.order_id, values.token).then(function(response) {
                                self.setState({
                                    order: response
                                });
                                A.route('confirmation', {notice: response.notice}, false);
                            }).catch(function (errors) {
                                self.setState({
                                    errors: errors,
                                    disabled: false
                                })
                            });
                        };
                        if (self.state.status === 'incomplete') {
                            payment();
                        } else {
                            Api.orderCheckout(self.state.order.order_id, values).then(function (response) {
                                self.setState({
                                    status: response.status
                                });
                                payment();
                            }).catch(function (errors) {
                                self.setState({
                                    errors: errors,
                                    disabled: false
                                })
                            });
                        }
                    }
                });
            } else {
                this.setState({'disabled': false});
            }
        },

        _scrollToError: function() {
            var fields = Object.keys(this.state.errors);
            if (fields.length > 0) {
                var field = fields[0];
                if (field == 'vehicle_info') {
                    field = 'vehicle_year';
                }
                if (this.refs[field]) {
                    h.scrollToTop( this.refs[field].getDOMNode() );
                }
            }
        },

        _vehicleChange: function(event) {
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name;
            var index = fields.indexOf(fieldName);

            var values = _.cloneDeep(this.state.values);
            values.vehicle[fieldName] = event.target.value;

            values.vehicle = {
                year: values.vehicle.year,
                make: index < 1 ? '' : values.vehicle.make,
                model: index < 2 ? '' : values.vehicle.model,
                trim: index < 3 ? '' : values.vehicle.trim
            };

            var self = this;

            Api.loadVehicleOptions(values.vehicle, fieldName).then(function(options) {
                self.setState({
                    options: options,
                    values: values
                })
            });
        }
    }

});