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
        // getInitialState: function() {
        //     return {
        //         errors: {}
        //     }
        // },

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

                    <div className={cn('summary_wrapper')}>
                        <form action="appointment-confirmation.php" className={cn('appointment_form')} onSubmit={this._handleFormSubmit}>
                            <div className={cn(['sixcol', 'last', 'right', 'col_right', 'appointment_info'])}>
                                <div className={cn('twelvecol')}>
                                    <div className={cn(['fivecol', 'quote_tire'])}>
                                        <img src={tire.brand_logo} alt="Falken Tire" className={cn('result_brand_logo')} />
                                        <img src={tire.image} alt="An image of the tire" className={cn('result_tire')} />
                                    </div>
                                    <p className={cn(['sevencol', 'last'])}>Contact us now to and setup a time to speak with one of our representatives. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mollis turpis a sapien cursus dictum. </p>
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
                                            <tr className="light">
                                                <td>Total Price:</td>
                                                <td>${h.priceFormat(quote.total.price)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <fieldset className={cn(['sixcol', 'col_left', 'appointment_fields'])}>
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
                                    <input type="text" id={cn('order_date_time')} className={cn('datepicker')} ref="time" defaultValue={this.state.values.preferred_time} />
                                    {this._getError('preferred_time')}
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_vehicle_info')}>Vehicle info</label>
                                    <textarea id={cn('order_vehicle_info')} ref="vehicle_info" defaultValue={this.state.values.vehicle_info ? this.state.values.vehicle_info : this.props.vehicleInfo} />
                                </div>
                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('order_notes')}>Notes</label>
                                    <textarea id={cn('order_notes')} ref="notes" defaultValue={this.state.values.notes} />
                                </div>
                                <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Send</button>
                            </fieldset>
                        </form>
                    </div>


                </div>
            );
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
            console.log( customerStore.getValidationErrors() );
            this.setState({
                errors: customerStore.getValidationErrors(),
                values: customerStore.getCustomer()
            });
        },
        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('summary');
        },
        _handleFormSubmit: function(event) {
            event.preventDefault();
            var values = {
                name: this.refs.name.value,
                email: this.refs.email.value,
                phone: this.refs.phone.value,
                preferred_time: this.refs.time.value,
                notes: this.refs.notes.value,
                vehicle_info: this.refs.vehicle_info.value
            };

            Act.Quote.sendAppointment(values);
        }
    }

});