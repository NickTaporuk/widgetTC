define([
    'react',
    'config',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!components/elements/select',
    'load!components/page/common/mainPrices',
    'load!components/page/common/formField',
    'load!components/page/common/back',
    'actions/api',
    'moment',
    'load!stores/appStore',
    'load!stores/customerStore',
    'promise',
    'lib/history',
    'lodash'
], function(
    React,
    config,
    cn,
    A,
    h,
    SelectField,
    MainPrices,
    Field,
    Back,
    Api,
    moment,
    appStore,
    customerStore,
    Promise,
    history,
    _
) {

    var vehicleValues, vehicleOptions, tire, quote;

    var types = {
        email: {
            submit: {action: 'emailQuote', text: 'Send email'},
            back:   {to: config.sa ? 'summary' : 'quote', text: 'Back'}
        },
        print: {
            submit: {action: 'printQuote', text: 'Print quote'},
            back:   {to: config.sa ? 'summary' : 'quote', text: 'Back'}
        },
        request: {
            submit: {action: 'requestQuote', text: 'Request quote'},
            back:   {to: 'results', text: 'Back to results'}
        },
        appointment: {
            submit: {action: 'sendAppointment', text: 'Send'},
            back:   {to: 'summary', text: 'Back to summary'}
        }
    };

    return {
        displayName: 'quote_form',

        statics: {
            prepare: function(props) {
                var searchState = appStore.getPageState('search');
                var customer = customerStore.getCustomerInfo();

                vehicleValues = customer.vehicle.year || !searchState
                    ? customer.vehicle
                    : {
                    year: searchState.fieldValues.vehicle.year,
                    make: searchState.fieldValues.vehicle.make,
                    model: searchState.fieldValues.vehicle.model,
                    trim: searchState.fieldValues.vehicle.trim
                };

                var promises = [
                    Api.loadVehicleOptions(vehicleValues)
                ];

                if (props.type == 'request') {
                    promises.push(Api.loadTire(props.tire_id));
                } else {
                    var summaryState = appStore.getPageState('summary');
                    tire = summaryState.tire;
                    quote = summaryState.quote;
                }

                return Promise.all(promises).then(function (responses) {
                    vehicleOptions = responses[0];
                    if (responses[1]) {
                        tire = responses[1];
                    }
                });
            }
        },

        getInitialState: function () {
            return {
                values: {},
                errors: {}
            }
        },

        componentWillMount: function() {
            var values = customerStore.getCustomerInfo();
            values.vehicle = vehicleValues;
            this.setState({
                values: values,
                options: vehicleOptions,
                tire: tire,
                quote: quote
            });
        },
        
        componentDidUpdate: function(prevProps, prevState) {
            if (Object.keys(this.state.errors).length > 0 && !_.isEqual(this.state.errors, prevState.errors)) {
                this._scrollToError();
            }
        },

        render: function() {
            var tire = this.state.tire;
            return (
                <div>
                    <Back />

                    <div className={cn('summary_wrapper')}>
                        <form action="appointment-confirmation.php" className={cn('appointment_form')} onSubmit={this._handleFormSubmit}>
                            
                            <fieldset className={cn(['sixcol', 'col_left', 'appointment_fields'])}>
                                <Field type="text" name="name" onChange={this._fieldChange} defaultValue={this.state.values.name} ref="name" label={ config.sa ? 'Customer Name' : 'Your Name' } required={ !config.sa || this.props.type == 'request' } error={this._getError('name')} />
                                <Field type="email" name="email" onChange={this._fieldChange} defaultValue={this.state.values.email} ref="email" label="Email Address" required={ !config.sa || this.props.type === 'email' || this.props.type == 'request'} error={this._getError('email')} />
                                <Field type="tel" name="phone" onChange={this._fieldChange} defaultValue={this.state.values.phone} ref="phone" label="Phone Number" required={ !config.sa || this.props.type == 'request' } error={this._getError('phone')} />

                                { this.props.type === 'appointment'
                                    ?   <Field type="select" name="way_to_contact" onChange={this._fieldChange} defaultValue={this.state.values.way_to_contact} ref="way_to_contact" label="Best way to contact"
                                            custom={{
                                                options: [{value: 'phone', description: 'Phone'}, {value: 'email', description: 'Email'}]
                                            }}
                                        />
                                    :   null
                                }
                                { this.props.type === 'appointment'
                                    ?   <Field type="datetime" ref="datetime" name="datetime" onChange={this._fieldChange} defaultValue={this.state.values.preferred_time} label="Preferred Date and Time" error={this._getError('preferred_time')}
                                               custom={{
                                                        isValidDate: this._isValidDate,
                                                        inputProps: {'name': "preferred_time", 'readOnly': true},
                                                        dateFormat: "YYYY-MM-DD",
                                                        timeFormat: "HH:mm" 
                                               }}
                                        />
                                    :   null
                                }
                                <Field type="textarea" name="notes" onChange={this._fieldChange} defaultValue={this.state.values.notes} ref="notes" label="Notes" error={this._getError('notes')} />
                            </fieldset>

                            <div className={cn(['sixcol', 'last', 'right', 'col_right', 'appointment_info'])}>

                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_year')}>Vehicle Info</label>
                                    <div className={cn(['sixcol', 'field'])}>
                                        <SelectField name="year" options={this.state.options.year} emptyDesc="- Year -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.year} />
                                    </div>
                                    <div className={cn(['sixcol', 'last', 'field'])}>
                                        <SelectField name="make" options={this.state.options.make} emptyDesc="- Make -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.make} />
                                    </div>
                                </div>

                                <div className={cn('control_wrapper')}>
                                    <div className={cn('row')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <SelectField name="model" options={this.state.options.model} emptyDesc="- Model -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.model} />
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <SelectField name="trim" options={this.state.options.trim} emptyDesc="- Trim -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.trim} />
                                        </div>
                                    </div>
                                    {this._getError('vehicle_info')}
                                </div>

                                {this.props.type !== 'request'
                                    ?   this.state.quote ? <MainPrices quote={this.state.quote} /> : null
                                    :   <div className={cn('twelvecol')}>
                                            <div className={cn(['fivecol', 'quote_tire'])}>
                                                <img src={tire.brand_logo} alt="Falken Tire" className={cn('result_brand_logo')} />
                                                <img src={tire.image} alt="An image of the tire" className={cn('result_tire')} />
                                            </div>
                                            <h5 className={cn(['sevencol', 'last', 'order_info_vehicle'])}>
                                                <span className={cn('order_info_vehicle_item')}>{tire.size_short + ' ' + tire.load_index + tire.speed_rating}</span>
                                                <span className={cn('order_info_vehicle_item')}>{tire.category}</span>
                                                <span className={cn('order_info_vehicle_item')}>Part: {tire.part_number}</span>
                                                <span className={cn('order_info_vehicle_item')}>Sidewall: {tire.side_wall_style}</span>
                                            </h5>
                                        </div>
                                }
                                {this._getBtn()}
                            </div>
                        </form>
                    </div>


                </div>
            );
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

        _getBtn: function() {
            var text = types[this.props.type].submit.text;
            return <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> {text}</button>
        },

        _getError: function(fieldName) {
            if (this.state.errors[fieldName]) {
                return <span className={cn(['message', 'error', 'appointment_fields'])}>
                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> {Array.isArray(this.state.errors[fieldName]) ? this.state.errors[fieldName][0] : this.state.errors[fieldName]}
                </span>;
            } else {
                return null;
            }
        },

        _updateVehicleOptions: function(newOptions, newValues) {
            var options = _.cloneDeep(this.state.options);
            var values = _.cloneDeep(this.state.values);
            values.vehicle = _.assign(values.vehicle, newValues);
            this.setState({
                options: _.assign(options, newOptions),
                values: values
            });
        },

        _scrollToError: function(errors) {
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

        _handleFormSubmit: function(event) {
            var self = this;
            event.preventDefault();
            var values = {
                name: this.refs.name.value(),
                email: this.refs.email.value(),
                phone: this.refs.phone.value(),
                notes: this.refs.notes.value(),
                vehicle: this.state.values.vehicle
            };
            if (this.refs.datetime) {
                values.preferred_time = this.refs.datetime.value();
            }
            if (this.refs.way_to_contact) {
                values.way_to_contact = this.refs.way_to_contact.value();
            }
            if (['email', 'print'].indexOf(this.props.type) !== -1 && !config.sa) {
                values.follow_up = true;
            }

            var props;
            if (this.props.type == 'request') {
                props = _.cloneDeep(this.props);
                delete props.type;
            } else {
                props = appStore.getPageProps('summary');
            }
            values = _.merge(props, values);

            Api[types[this.props.type].submit.action](values).then(function(data) {
                if (self.props.type !== 'print') {
                    A.popup.show(data.title, data.content);
                }
                history.back();
            }).catch(function(errors) {
                self.setState({
                    errors: errors
                });
            });
        },

        _vehicleChange: function(event) {
            var self = this;
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name;
            var index = fields.indexOf(fieldName);

            var values = this.state.values.vehicle;
            values[fieldName] = event.target.value;
            
            var values = {
                year: values.year,
                make: index < 1 ? '' : values.make,
                model: index < 2 ? '' : values.model,
                trim: index < 3 ? '' : values.trim
            };

            Api.loadVehicleOptions(values).then(function(options) {
                self._updateVehicleOptions(options, values);
            });
        }
    }
});