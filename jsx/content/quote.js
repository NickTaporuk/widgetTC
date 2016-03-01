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
                                            <select onChange={this._handleQuantityChange} defaultValue={this.state.quantity}>
                                                {quantityItems}
                                            </select>
                                        </td>
                                        <td>${ h.priceFormat(this.state.quantity * tire.price) }</td>
                                    </tr>
                                    <tr>
                                        <td>{ tire.size_short + ' ' + tire.load_index + tire.speed_rating} </td>
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
                        {this._getDiscountBlock()}

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
                                    <tr>
                                        <td>Total Price:</td>
                                        <td>${h.priceFormat(quote.total.price)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <p dangerouslySetInnerHTML={{ __html: quote.legal_information.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />

                        <div className={cn(['twelvecol', 'bottom_btns'])}>
                            <div className={cn(['sixcol', 'col_left'])}>
                                <a href="#quote" className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE14F;' }} /> Get a Quote</a>
                                <a href="#appointment" onClick={this._handleAppoimtmentClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE192;' }} /> Make an Appointment</a>
                            </div>
                            <div className={cn(['sixcol', 'last', 'col_right'])}>
                                <a href="#order" className={cn('brand_btn')}>Order Your Tires <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                            </div>
                        </div>
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
                            {info.name}
                            <small>{info.description}</small>
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
        _getDiscountBlock: function() {
            var discount = this.state.quote.discount;
            if (!discount) {
                return null;
            }

            return (
                <div className={cn('table_wrapper')}>
                    <table className={cn('table')}>
                        <thead>
                            <tr>
                                <th colSpan="2">Discount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <button onClick={this._handleDiscountClick} className={cn({toggle_cell_btn: true, toggle_remove: discount.applied, toggle_add: !discount.applied})}>
                                        <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: (discount.applied ? '&#xE15C;' : '&#xE147;') }} /><span>{ discount.applied ? 'Remove' : 'Add' }</span>
                                    </button>
                                </td>
                                <td>Discount</td>
                                <td>${h.priceFormat(discount.total_value)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        },

        _updateQuote: function() {
            this.setState({
                quote: customerStore.getQuote(),
                quantity: customerStore.getSelectedQuantity()
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

            Act.Quote.update(this.props.tire.id, this.state.quantity, optServices, this.state.quote.discount.applied);
        },
        _handleQuantityChange: function(event) {
            Act.Quote.update(this.props.tire.id, event.target.value, this._getActiveOptServicesKeys(), this.state.quote.discount.applied);
        },
        _handleDiscountClick: function() {
            Act.Quote.update(this.props.tire.id, this.state.quantity, this._getActiveOptServicesKeys(), !this.state.quote.discount.applied);
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
        _handleAppoimtmentClick: function() {
            Act.Page.show('appointment');
        }

    } 


});