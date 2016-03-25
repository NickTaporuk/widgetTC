define([
    'react',
    'config',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
    'load!stores/vehicleStore',
    'load!components/elements/select',
    'load!components/page/common/mainPrices',
    'load!components/page/common/formField',
    'moment'
], function(
    React,
    config,
    cn,
    Act,
    h,
    customerStore,
    vehicleStore,
    SelectField,
    MainPrices,
    Field,
    moment
) {

    var types = {
        email: {
            submit: {action: Act.Quote.email, text: 'Send email'},
            back:   {to: config.sa ? 'summary' : 'quote', text: 'Back'}
        },
        print: {
            submit: {action: Act.Quote.print, text: 'Print quote'},
            back:   {to: config.sa ? 'summary' : 'quote', text: 'Back'}
        },
        request: {
            submit: {action: Act.Quote.request, text: 'Request quote'},
            back:   {to: 'results', text: 'Back to results'}
        },
        appointment: {
            submit: {action: Act.Quote.sendAppointment, text: 'Send'},
            back:   {to: 'summary', text: 'Back to summary'}
        }
    };

    return {
        componentWillMount: function() {
            this._updateState(true);
        },
        componentDidMount: function() {
            customerStore.bind('change', this._updateState);
            vehicleStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            customerStore.unbind('change', this._updateState);
            vehicleStore.unbind('change', this._updateState);
        },

        render: function() {
            var tire = this.props.tire;

            return (
                <div>
                    {this._getBackLink()}

                    <div className={cn('summary_wrapper')}>
                        <form action="appointment-confirmation.php" className={cn('appointment_form')} onSubmit={this._handleFormSubmit}>
                            
                            <fieldset className={cn(['sixcol', 'col_left', 'appointment_fields'])}>
                                <Field type="text" name="name" defaultValue={this.state.values.name} ref="name" label="Your Name" required={!config.sa} error={this._getError('name')} />
                                <Field type="email" name="email" defaultValue={this.state.values.email} ref="email" label="Email Address" required={!config.sa || this.props.type === 'email'} error={this._getError('email')} />
                                <Field type="tel" name="phone" defaultValue={this.state.values.phone} ref="phone" label="Phone Number" required={!config.sa} error={this._getError('phone')} />

                                { this.props.type === 'appointment'
                                    ?   <Field type="select" name="way_to_contact" defaultValue={this.state.values.way_to_contact} ref="way_to_contact" label="Best way to contact" 
                                            custom={{
                                                options: [{value: 'phone', description: 'Phone'}, {value: 'email', description: 'Email'}]
                                            }}
                                        />
                                    :   null
                                }
                                { this.props.type === 'appointment'
                                    ?   <Field type="datetime" ref="datetime" name="datetime" defaultValue={this.state.values.preferred_time} label="Preferred Date and Time" error={this._getError('preferred_time')} 
                                               custom={{
                                                        isValidDate: this._isValidDate,
                                                        inputProps: {'name': "preferred_time", 'readOnly': true},
                                                        dateFormat: "YYYY-MM-DD",
                                                        timeFormat: "HH:mm" 
                                                }}
                                        />
                                    :   null
                                }
                                <Field type="textarea" name="notes" defaultValue={this.state.values.notes} ref="notes" label="Notes" error={this._getError('notes')} />
                            </fieldset>

                            <div className={cn(['sixcol', 'last', 'right', 'col_right', 'appointment_info'])}>

                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_year')}>Vehicle Info {config.sa ? null : <span className="req">*</span>}</label>
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

                                {this.props.type !== 'request'
                                    ?   <MainPrices quote={this.props.quote} />
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

        _isValidDate: function( current ) {
            return current.isAfter( moment().add(1, 'd').subtract(1,'day') );
        },

        _getBackLink: function() {
            var text =  types[this.props.type].back.text;
            return <a href="#summary" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />{text}</a>
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

        _updateState: function(isInit) {
            var values = customerStore.getCustomer();

            this.setState({
                errors: isInit ? {} : customerStore.getValidationErrors(),
                values: values,
                options: vehicleStore.getAll(values.vehicle.year, values.vehicle.make, values.vehicle.model, values.vehicle.trim)
            });
        },

        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show(types[this.props.type].back.to);
        },

        _handleFormSubmit: function(event) {
            event.preventDefault();
            var values = {
                name: this.refs.name.value(),
                email: this.refs.email.value(),
                phone: this.refs.phone.value(),
                notes: this.refs.notes.value(),
                vehicle_info: this._getVehicleInfo()
            };
            if (this.refs.datetime) {
                values.preferred_time = this.refs.datetime.value();
            }
            if (this.refs.way_to_contact) {
                values.way_to_contact = this.refs.way_to_contact.value();
            }

            types[this.props.type].submit.action(values);
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