define([
    'react',
    'classnames',
    'config',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
    'load!components/page/summary/offerLine'
], function(
    React,
    cn,
    config,
    Act,
    h,
    customerStore,
    OfferLine
) {

   
    return {
        componentWillMount: function() {
            this._updateQuote();
        },
        componentDidMount: function() {
            customerStore.bind('change', this._updateQuote);
        },
        componentWillUnmount: function() {
            customerStore.unbind('change', this._updateQuote);    
        },


        render: function() {
            var tire = this.props.tire;
            var quote = this.state.quote;

            var recyclingFee = null;
            if (quote.recycling_fee) {
                recyclingFee = <tr>
                    <td>{quote.recycling_fee.name}</td>
                    <td>${h.priceFormat(quote.recycling_fee.total_value)}</td>
                </tr>;
            }

            var quantityItems = [];
            for(var q = 1; q <= tire.quantity && q <= 8; q++) {
                quantityItems.push(<option key={q} value={q}>{q}</option>);
            }

            return (
                <div>
                    <a href="#results" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to results</a>

                    <div className={cn(['max_width', 'summary_wrapper'])}>
                        <div className={cn('table_wrapper')}>
                            <table className={cn('table')}>
                                <thead>
                                    <tr>
                                        <th>Tires</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{tire.brand + ' ' + tire.model}</td>
                                        <td>${ h.priceFormat(tire.price) }</td>
                                        <td>
                                            <label className={cn(['qty', 'compare_qty'])} onChange={this._handleQuantityChange}>
                                                <select defaultValue={this.state.quantity}>
                                                    {quantityItems}
                                                </select>
                                            </label>
                                        </td>
                                        <td>${ h.priceFormat(this.state.quantity * tire.price) }</td>
                                    </tr>
                                    <tr>
                                        <td>{ tire.size_short + ' ' + tire.load_index + tire.speed_rating}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Part #{ tire.part_number }</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {this._getServicesBlock(quote.services)}
                        {this._getServicesBlock(quote.optional_services, true)}

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
                                    <OfferLine type="discount" offer={this.state.quote.discount} onClick={this._handleDiscountClick} onChange={this._handleDiscountChange} />

                                    { recyclingFee && quote.recycling_fee.is_taxable ? recyclingFee : null }
                                    <tr>
                                        <td>{quote.tax.name}</td>
                                        <td>${h.priceFormat(quote.tax.total_value)}</td>
                                    </tr>
                                    { recyclingFee && quote.recycling_fee.is_taxable ? null : recyclingFee }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td>Total Price:</td>
                                        <td>${h.priceFormat(quote.total.price)}</td>
                                    </tr>
                                    <OfferLine type="rebate" offer={this.state.quote.rebates[0]} />
                                </tfoot>
                            </table>
                        </div>

                        <p dangerouslySetInnerHTML={{ __html: quote.legal_information.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />

                        {this._getButtons()}
                    </div>
                </div>
            );
        },

        _getButtons: function() {
            var btns = {
                'quote': <a href="#quote" onClick={this._handleQuoteClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE14F;' }} /> Get a Quote</a>,
                'appointment': <a href="#appointment" onClick={this._handleAppointmentClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE192;' }} /> Make an Appointment</a>
            }
            if (this.props.withOrderBtn) {
                btns.order = <a href="#order" onClick={this._handleOrderClick} className={cn('brand_btn')}>Order Your Tires <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
            }
            
            return (
                <div className={cn(['twelvecol', 'bottom_btns'])}>
                    <div className={cn(['sixcol', 'col_left'])}>
                        {btns.quote}
                        {this.props.withOrderBtn ? btns.appointment : null}
                    </div>
                    <div className={cn(['sixcol', 'last', 'col_right'])}>
                        {this.props.withOrderBtn ? btns.order : btns.appointment}
                    </div>
                </div>
            );
        },

        _getServicesBlock: function(servicesInfo, isOptional) {
            if (servicesInfo.length == 0) {
                return null;
            }

            var isOptional = isOptional || false,
                services = [];

            servicesInfo.map(function(info, i){
                var toggleCell = null;

                if (isOptional) {
                    toggleCell = <td className={cn('toggle_cell')}>
                        <button onClick={this._handleServiceClick.bind(this, info.key)} className={cn({toggle_cell_btn: true, toggle_remove: info.applied, toggle_add: !info.applied})}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: (info.applied ? '&#xE15C;' : '&#xE147;') }} /><span>{ info.applied ? 'Remove' : 'Add' }</span>
                        </button>
                    </td>
                }

                services.push((
                    <tr key={i} className={ cn({service_added: (isOptional && info.applied)}) }>
                        {toggleCell}
                        <td>
                            {info.name}<br />
                            {info.description ? <small>{info.description}<br /></small> : null}
                            {info.link ? <small><a href={info.link} target="_blank">Learn more</a></small> : null}
                        </td>
                        <td>${h.priceFormat(info.total_price)}</td>
                    </tr>
                ));
            }.bind(this));


            return <div className={cn('table_wrapper')}>
                <table className={cn({table: true, toggle_table: isOptional, optional_services: isOptional})}>
                    <thead>
                        <tr>
                            <th colSpan={isOptional ? 2 : null}>{isOptional ? 'Optional Services' : 'Installation'}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services}
                    </tbody>
                </table>
            </div>
        },
       
        _updateQuote: function() {
            this.setState({
                quote: customerStore.getQuote(),
                quantity: customerStore.getSelectedQuantity(),
                customDiscount: customerStore.getCustomDiscount()
            });
        },
        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('results');
        },
        _handleServiceClick: function(serviceKey, event) {
            event.preventDefault();
            var optServices = this._getActiveOptServicesKeys();
            //add/remove clicked service
            if (optServices.indexOf(serviceKey) === -1) {
                optServices.push(serviceKey);
            } else {
                _.remove(optServices, function(key) {
                  return key == serviceKey;
                });
            }
            var params = this._getParamsForQuote();
            Act.Quote.update(params.tireId, params.quantity, optServices, params.isDiscountApplied, params.customDiscount);
        },
        _getParamsForQuote: function() {
            return {
                tireId: this.props.tire.id,
                quantity: this.state.quantity,
                optServices: this._getActiveOptServicesKeys(),
                isDiscountApplied: this.state.quote.discount && this.state.quote.discount.applied,
                customDiscount: this.state.customDiscount
            }
        },
        _handleQuantityChange: function(event) {
            var params = this._getParamsForQuote();
            Act.Quote.update(params.tireId, event.target.value, params.optServices, params.isDiscountApplied, params.customDiscount);
        },
        _handleDiscountClick: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            Act.Quote.update(params.tireId, params.quantity, params.optServices, !params.isDiscountApplied, params.customDiscount);
        },
        _handleDiscountChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            Act.Quote.update(params.tireId, params.quantity, params.optServices, params.isDiscountApplied, event.target.value);
        },

        _getActiveOptServicesKeys: function() {
            var keys = [];
            this.state.quote.optional_services.map(function(service) {
                if (service.applied) {
                    keys.push(service.key);
                }
            });

            return keys;
        },
        _handleAppointmentClick: function(event) {
            event.preventDefault();
            Act.Quote.appointmentForm()
        },
        _handleOrderClick: function(event) {
            event.preventDefault();
            Act.Order.create();
        },
        _handleQuoteClick: function(event) {
            event.preventDefault();
            Act.Page.show('quote');
        }
    }
});