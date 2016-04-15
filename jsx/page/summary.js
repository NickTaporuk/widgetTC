define([
    'react',
    'classnames',
    'config',
    'load!actions/actions',
    'load!actions/act',
    'lib/helper',
    'lodash',
    'load!stores/customerStore',
    'load!components/page/summary/offerLine',
    'isMobile',
    'load!components/page/common/back'
], function(
    React,
    cn,
    config,
    Act,
    A,
    h,
    _,
    customerStore,
    OfferLine,
    isMobile,
    Back
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
            if (Object.keys(quote) <= 0 || Object.keys(tire) <= 0) {
                return null;
            }

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
                    <Back />

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
                                        <td><sup dangerouslySetInnerHTML={{ __html: '&#8224;' }} />Total Price:</td>
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

        _loadQuote: function() {
            var params = this._getEntry();
            Act.summaryPage.update(params);
        },

        _getButtons: function() {
            var btns = {};
            if (config.sa) {
                var btns = {
                    email: <a href="#email" onClick={this._handleEmailClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Email Quote</a>,
                    print: <a href="#print" onClick={this._handlePrintClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                };
            } else {
                var btns = {
                    quote: <a href="#quote" onClick={this._handleQuoteClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE14F;' }} /> Get a Quote</a>,
                    appointment: <a href="#appointment" onClick={this._handleAppointmentClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE192;' }} /> Make an Appointment</a>
                };
                if (this.props.withOrderBtn) {
                    btns.order = <a href="#order" onClick={this._handleOrderClick} className={cn('brand_btn')}>Order Your Tires <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                }

                if (isMobile.any && this.props.callNumber) {
                    btns.clickToCall = <a href={'tel:' + this.props.callNumber} className={cn('brand_btn_light', 'btn_small')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0B0;' }} /> Call Us</a>
                }
            }
            
            return (
                <div className={cn(['twelvecol', 'bottom_btns'])}>
                    {btns.clickToCall
                        ? <div>{btns.clickToCall}</div>
                        : null
                    } 
                    <div className={cn(['sixcol', 'col_left'])}>
                        {btns.quote ? btns.quote : null}
                        {btns.order ? btns.appointment : null}

                        {btns.email ? btns.email : null}
                        
                    </div>
                    <div className={cn(['sixcol', 'last', 'col_right'])}>
                        {btns.print ? btns.print : null}

                        {btns.order ? btns.order : btns.appointment}
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
            var state = {
                quote: customerStore.getQuote(),
                quantity: customerStore.getSelectedQuantity()
            };

            this.setState(state);
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

        _getParamsForQuote: function() {
            var discount = this.state.quote.discount;
            return {
                tire_id: this.props.tire.id,
                quantity: this.state.quantity,
                optional_services: this._getActiveOptServicesKeys(),
                with_discount: discount && discount.tried_to_apply,
                custom_discount: discount && discount.is_custom ? discount.total_value : null
            }
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
            params.optional_services = optServices;
            A.summaryPage.update(params);
            // Act.Quote.update(params.tireId, params.quantity, optServices, params.withDiscount, params.customDiscount);
        },

        _handleQuantityChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.quantity = event.target.value;
            A.summaryPage.update(params);
            // Act.Quote.update(params.tireId, event.target.value, params.optServices, params.withDiscount, params.customDiscount);
        },

        _handleDiscountClick: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.with_discount = !params.with_discount;
            A.summaryPage.update(params);
            // Act.Quote.update(params.tireId, params.quantity, params.optServices, !params.withDiscount, params.customDiscount);
        },

        _handleDiscountChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.custom_discount = event.target.value;
            A.summaryPage.update(params);
            //Act.Quote.update(params.tireId, params.quantity, params.optServices, params.withDiscount, event.target.value);
        },

        _handleAppointmentClick: function(event) {
            event.preventDefault();
            A.appointmentPage.update();
            // Act.Quote.appointmentForm();
        },

        _handleOrderClick: function(event) {
            event.preventDefault();
            Act.Order.create();
        },

        _handleQuoteClick: function(event) {
            event.preventDefault();
            A.getAQuotePage.update();
            //Act.Page.show('quote');
        },

        _handleEmailClick: function(event) {
            event.preventDefault();
            A.emailPage.update();
            // Act.Quote.appointmentForm('email');
        },

        _handlePrintClick: function(event) {
            event.preventDefault();
            A.printPage.update();
            // Act.Quote.appointmentForm('print');
        }

    }
});