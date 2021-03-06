define([
    'react',
    'classnames',
    'config',
    'load!actions/act',
    'lib/helper',
    'lodash',
    'load!components/page/summary/offerLine',
    'isMobile',
    'load!components/page/common/back',
    'actions/api',
    'load!stores/appStore',
    'promise'
], function(
    React,
    cn,
    config,
    A,
    h,
    _,
    OfferLine,
    isMobile,
    Back,
    Api,
    appStore,
    Promise
) {

    var tire, quote, dealerConfig, locationConfig;

    return {
        displayName: 'summary',

        statics: {
            prepare: function(props, isUpdate)  {
                var tireParams = h.base64Decode(props.tire_id).split('||');
                var locationId = tireParams[3];

                var searchState = appStore.getPageState('search');
                var vehicleValues = searchState && searchState.activeTab == 'vehicle' ? {
                    year: searchState.fieldValues.vehicle.year,
                    make: searchState.fieldValues.vehicle.make,
                    model: searchState.fieldValues.vehicle.model,
                    trim: searchState.fieldValues.vehicle.trim,
                    car_tire_id: searchState.fieldValues.vehicle.car_tire_id
                } : {};


                var getActiveOptServicesKeys = function(_quote) {
                    var keys = [];
                    if (_quote.optional_services) {
                        Object.keys(_quote.optional_services).map(function (i) {
                            var service = _quote.optional_services[i];
                            if (service.applied) {
                                keys.push(service.key);
                            }
                        });
                    }

                    return keys;
                };


                return Promise.all([
                    Api.loadTire(props.tire_id),
                    Api.loadQuote(
                        props.tire_id,
                        props.quantity,
                        props.optional_services,
                        props.with_discount,
                        props.custom_discount,
                        vehicleValues,
                        (isUpdate ? null : true)
                    ),
                    Api.loadDealerConfig(),
                    Api.loadLocationConfig(locationId)
                ]).then(function(responses) {
                    tire = responses[0];
                    quote = responses[1];
                    dealerConfig = responses[2];
                    locationConfig = responses[3];
                    
                    if (props.optional_services == 'use_default') {
                        props.optional_services = getActiveOptServicesKeys(quote);
                    }
                });
            }
        },

        componentWillMount: function() {
            this._init();
        },

        componentWillUpdate: function(nextProps) {
            if (!_.isEqual(this.props, nextProps)) {
                this._init();
            }
        },

        render: function() {
            var tire = this.state.tire;
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

                    <div className={cn(['max_width', 'summary_wrapper','summary_page'])}>
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
                                                <select defaultValue={this.props.quantity}>
                                                    {quantityItems}
                                                </select>
                                            </label>
                                        </td>
                                        <td>${ h.priceFormat(this.props.quantity * tire.price) }</td>
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
                                    { this.state.quote.discount ? <OfferLine type="discount" offer={this.state.quote.discount} onClick={this._handleDiscountClick} onChange={this._handleDiscountChange} /> : null }
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
                                    { this.state.quote.rebates[0] ? <OfferLine type="rebate" offer={this.state.quote.rebates[0]} /> : null }
                                </tfoot>
                            </table>
                        </div>

                        <p dangerouslySetInnerHTML={{ __html: quote.legal_information.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />

                        {this._getButtons()}
                    </div>
                </div>
            );
        },

        _init: function () {
            this.setState({
                withOrderBtn: !config.sa && dealerConfig.ecommerce && dealerConfig.ecommerce.services && dealerConfig.ecommerce.services.stripe && dealerConfig.ecommerce.services.stripe.publishable_key,
                quote: quote,
                tire: tire,
                callNumber: locationConfig.call_number,
                dealerConfig: dealerConfig
            });
        },

        _getButtons: function() {
            var btns = {};
            if (config.sa) {
                var btns = {
                    email: <a href="#email" onClick={this._handleEmailClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Email Quote</a>,
                    print: <a href="#print" onClick={this._handlePrintClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                };
            } else {
                this.state.dealerConfig.show_quote ? btns.quote = <a href="#quote" onClick={this._handleQuoteClick} className={cn({'brand_btn_light': true, 'btn_small': this.state.dealerConfig.show_appointment })}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE14F;' }} /> Get a Quote</a> : null ;
                this.state.dealerConfig.show_appointment ? btns.appointment = <a href="#appointment" onClick={this._handleAppointmentClick} className={ cn({'brand_btn_light':true, 'btn_small' : this.state.dealerConfig.show_quote }) }><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE192;' }} /> Make an Appointment</a> : null;

                if (this.state.withOrderBtn) {
                    btns.order = <a href="#order" onClick={this._handleOrderClick} className={cn('brand_btn')}>Order Your Tires <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                }

                if (isMobile.any && this.state.callNumber) {
                    btns.clickToCall = <a href={'tel:' + this.state.callNumber} onClick={this._handleCallClick} className={cn('brand_btn_light', 'btn_small')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0B0;' }} /> Call Us</a>
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
            if (!servicesInfo || servicesInfo.length == 0) {
                return null;
            }

            var isOptional = isOptional || false,
                services = [];

            Object.keys(servicesInfo).map(function(i){
                var info = servicesInfo[i];
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

        _getParamsForQuote: function() {
            var discount = this.state.quote.discount;
            return {
                tire_id: this.props.tire_id,
                quantity: this.props.quantity,
                optional_services: this.props.optional_services,
                with_discount: discount && discount.tried_to_apply,
                custom_discount: discount && discount.is_custom ? discount.total_value : null
            }
        },

        _handleCallClick: function() {
            Api.callQuote(this.props.tire_id);
        },

        _handleServiceClick: function(serviceKey, event) {
            event.preventDefault();
            var optServices = _.cloneDeep(this.props.optional_services);
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
            A.route('summary', params);
        },

        _handleQuantityChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.quantity = event.target.value;
            A.route('summary', params);
        },

        _handleDiscountClick: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.with_discount = !params.with_discount;
            A.route('summary', params);
        },

        _handleDiscountChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.custom_discount = event.target.value;
            A.route('summary', params);
        },

        _handleAppointmentClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'appointment'});
        },

        _handleOrderClick: function(event) {
            event.preventDefault();
            A.route('order');
        },

        _handleQuoteClick: function(event) {
            event.preventDefault();
            A.route('get_a_quote');
        },

        _handleEmailClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'email'});
        },

        _handlePrintClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'print'});
        }

    }
});