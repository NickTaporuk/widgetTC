define([
    'react',
    'config',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'moment',
    'load!stores/stockStore'
], function(
    React,
    config,
    cn,
    Act,
    h,
    moment,
    stockStore
) {

    return {
        getInitialState: function() {
            return {
                activeTab: 'specs',
                quantity: 4,
                showRebate: false,
                fullStock: [],
                stock: [],
                stockFor: null
            }
        },

        componentWillMount: function() {
            this.setState({
                quantity: this.props.tire.selected_quantity
            });
        },
        componentDidMount: function() {
            stockStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            stockStore.unbind('change', this._updateStatus);    
        },

        render: function() {
            var tire = this.props.tire;
            var tab = this.state.activeTab;
            var warranty = this.props.isInMile ? tire.mileage_rating : tire.kilometer_rating;

            var features = null;
            if (tire.description) {
                var items = [];
                tire.description.map(function(desc, i){
                    items.push(<li key={i}>{desc}</li>);
                });
                features = <div className={cn('tab_cont')} id={cn('features_result_1')} aria-hidden={!(tab == 'features')}><ul>{items}</ul></div>;
            }

            var quantityItems = [];
            for(var q = 1; q <= tire.quantity && q <= 8; q++) {
                quantityItems.push(<option key={q} value={q}>{q}</option>);
            }

            return (
                <li className={cn({result: true, result_featured: this.props.isTop, border_color: this.props.isTop})}>
                    <div className={cn('result_header')}>
                        <h3 className={cn(['result_title', 'font_color'])}>
                            {tire.model}
                            <span className={cn('result_subtitle')}>
                                <span className={cn('result_type')}>{tire.category}</span><span className={cn('warranty')}>Warranty: <strong className={cn('warranty_value')}>{warranty ? warranty : 'NA'}</strong> {this.props.isInMile ? 'mi' : 'km'}</span>
                            </span>
                        </h3>
                        {/*<label className={cn('result_compare')}>
                            <input type="checkbox" defaultChecked={false} /> Add to compare
                        </label>*/}
                    </div>
                    <div className={cn('result_body')}>
                        <div className={cn('result_left')}>
                            <img src={tire.brand_logo} alt={tire.brand + ' Tire'} className={cn('result_brand_logo')} />
                            <div className={cn('result_tire_wrapper')}>
                                <img src={tire.image} alt="An image of the tire" className={cn('result_tire')} />
                                {/*<a href="#tire_modal" className={cn(['modal_open', 'tire_enlarge', 'font_color'])}>
                                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE147;'}} /><span className={cn('hidden')}>Enlarge</span>
                                </a>*/}
                            </div>
                            {this._getRebateBlock()}
                            {this._getOemBlock()}
                            {this._getRatingBlock(3, true)}
                        </div>
                        <div className={cn('result_right')}>
                            <div className={cn('result_select_actions')}>
                                <div className={cn('result_price_wrapper')}>
                                    <div className={cn('result_price')}>
                                        <label className={cn('qty')}>
                                            <span className={cn('qty_label')}>Qty:</span>
                                            <select name={cn('qty_result_1')} onChange={this._handleQuantityChange} defaultValue={tire.selected_quantity} ref="quantity">
                                                {quantityItems}
                                            </select>
                                        </label>
                                        <h5 className={cn('price')}>
                                            <strong className={cn('price_value')}>{tire.price ? '$' + h.priceFormat(tire.price * this.state.quantity) : null}</strong>
                                        </h5>
                                    </div>
                                </div>
                                <div className={cn('select_btn_wrapper')}>
                                    { tire.price
                                        ? <a href="#summary" onClick={this._handleSelectClick} className={cn(['btn', 'brand_btn', 'select_btn'])}>Select Tire <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                                        : <a href="#summary" onClick={this._handleGetQuoteClick} className={cn(['btn', 'brand_btn', 'select_btn'])}>Get a quote</a>
                                    }
                                </div>
                            </div>
                            <div className={cn(['tabs', 'result_tabs'])}>
                                <ul>
                                    <li className={cn('tab')}><a href="#specs_result_1" onClick={this._handleTabClick.bind(this, 'specs')} className={cn('font_color')} aria-selected={(tab == 'specs')}>Specs</a></li>
                                    {
                                        features
                                        ? <li className={cn('tab')}><a href="#features_result_1" onClick={this._handleTabClick.bind(this, 'features')} className={cn('font_color')} aria-selected={(tab == 'features')}>Features</a></li>
                                        : null
                                    }
                                    <li className={cn('tab')}><a href="#reviews_result_1" onClick={this._handleTabClick.bind(this, 'reviews')} className={cn('font_color')}  aria-selected={(tab == 'reviews')}>Reviews</a></li>
                                    {
                                        config.sa
                                        ? <li className={cn(['tab', 'stock_tab'])} role="presentation">
                                            <a href="#stock" onClick={this._handleTabClick.bind(this, 'stock')} aria-selected={(tab == 'stock')}>Stock</a>
                                        </li>
                                        : null
                                    }
                                </ul>
                                <div className={cn('tab_cont')} aria-hidden={!(tab == 'specs')}>
                                    <ul className={cn('result_specs_list')}>
                                        <li>Size: <strong className={cn('result_spec_value')}>{tire.size_short}</strong></li>
                                        <li>Speed Rating: <strong className={cn('result_spec_value')}>{tire.speed_rating}</strong></li>
                                        <li>Load Index: <strong className={cn('result_spec_value')}>{tire.load_index}</strong></li>
                                        <li>Sidewall: <strong className={cn('result_spec_value')}>{tire.side_wall_style}</strong></li>
                                        <li>Part: <strong className={cn('result_spec_value')}>{tire.part_number}</strong></li>
                                    </ul>
                                </div>
                                {features}
                                <div className={cn('tab_cont')} aria-hidden={!(tab == 'reviews')}>
                                    <h4 className={cn('result_reviews_heading')}><strong>10</strong> reviews:</h4>

                                    <div className={cn('result_review')}>
                                        <h5 className={cn('result_review_title')}>A great tire!</h5>
                                        {this._getRatingBlock()}
                                        <span className={cn('result_review_date')}>November 15, 2015</span>
                                        <div className={cn('result_review_content')}>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dui leo, mollis ac condimentum nec, iaculis non mi. Duis dictum dui a velit aliquet, ac consequat risus accumsan. </p>
                                        </div>
                                    </div>

                                    <div className={cn('result_review')}>
                                        <h5 className={cn('result_review_title')}>A much longer review title for testing layout adjustments</h5>
                                        {this._getRatingBlock()}
                                        <span className={cn('result_review_date')}>November 6, 2015</span>
                                        <div className={cn('result_review_content')}>
                                            <p>Suspendisse congue laoreet nulla ut mattis. Duis at sem rutrum, varius orci at, suscipit lectus. Phasellus ac magna semper, luctus sapien non, tempus sapien. </p>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('tab_cont')} aria-hidden={!(tab == 'stock')}>
                                    {this._getStockInfo()}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            );
        },

        _updateStatus: function() {
            if (this.state.fullStock.length == 0) {
                this.setState({
                    'fullStock': stockStore.getFullStock(this.props.tire.id)
                });
            }
            if (this.state.stockFor) {
                this.setState({
                    'stock': stockStore.getBranches(this.state.stockFor.tire_id)
                });
            }
        },

        _getStockInfo: function() {
            event.preventDefault();

            var info = [];
            if (!this.state.stock.length) {
                var info = [];
                this.state.fullStock.map(function(supplierInfo, i) {
                    info.push( 
                        <li key={i}>
                            <a href={'#' + i} onClick={this._handleStockClick}>{supplierInfo.supplier.nice_name + ': ' + supplierInfo.quantity}</a>
                        </li> 
                    );
                }.bind(this));

                return <div>
                    <h5 className={cn('result_reviews_heading')}>Item: {this.props.tire.part_number}</h5>
                    <ul>{info}</ul>
                </div>
            } else if (this.state.stock.length > 0) {
                this.state.stock.map(function(branch, i) {
                    info.push(<li key={i}>{branch.branch + ': ' + branch.quantity}</li>);
                });

                return <div>
                    <h5 className={cn('result_reviews_heading')}>{this.state.stockFor.supplier.nice_name}</h5>
                    <ul>{info}</ul>
                    <a href="#stock_back" onClick={this._hangleStockBackClick}>Back</a>
                </div>;
            }
        },

        _hangleStockBackClick: function() {
            event.preventDefault();
            this.setState({
                stock: []
            });
        },

        _getRatingBlock: function(rating, withLink) {
            var rating = this.props.tire.external_info.rating;
            if (!rating) {
                return null;
            }
            var fullStars = parseInt(rating);
            var halfStars = rating - fullStars > 0 ? 1 : 0;
            var emptyStars = 5 - fullStars - halfStars;

            var stars = [];
            for (var i = 1; i <= 5; i++) {
                var star;
                if ( i <= fullStars ) {
                    star = '&#xE838;';
                } else if ( halfStars ) {
                    star = '&#xE839;';
                    halfStars = 0;
                } else {
                    star = '&#xE83A;';
                }
                stars.push(<i key={i} className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: star }} />);
            }

            var withLink = withLink || false;
            return (
                <div className={cn('result_rating')} aria-label="Tire rating: 3.5 stars">
                    {stars}
                    {withLink ? <a href="#reviews_result_1" className={cn('result_rating_link')}>10 Reviews</a> : null}
                </div>
            );
        },

        _getRebateBlock: function() {
            var tire = this.props.tire,
                block;

            var offer = null;

            var rebates = tire.rebates;
            if (rebates && rebates[0] && rebates[0].valid_range) {
                offer = rebates[0];
            } else if (tire.discount) {
                offer = tire.discount;
                if (offer[0] !== undefined) { // needed as there are bug in response (if no discont we receive array. But it must be null)
                    offer = null;
                }
            }

            if (offer) {
                var link;
                if (offer.coupon_link && offer.coupon_line) {
                    link = <a target="_blank" rel="nofollow" href={offer.coupon_link}>{offer.coupon_line}</a>          
                }
                var range;
                if (offer.valid_range.is_ongoing) {
                    range = 'Valid from ' + moment(offer.valid_range.start_date).format('MMM. DD') + ' to ' + moment(offer.valid_range.end_date).format('MMM. DD, YYYY');
                }

                block = (
                    <span className={cn(['result_rebate', 'tooltip'])}>
                        <a href="#show_rebate" onClick={this._showRebate} className={cn({toggle: true, toggle_open: this.state.showRebate})}>{offer.name} <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE887;'}} /></a>

                        <span className={cn(['tooltip_content', 'toggle_content']) + ' ' + cn({toggle_hidden: !this.state.showRebate})} id={cn('result_2_rebate')}>
                            <p>
                                {offer.description} {range ? <br /> : null}
                                {range} {link ? <br /> : null}
                                {link}
                            </p>
                        </span>
                    </span>
                );
            }

            return block;
        },

        _showRebate: function(event) {
            event.preventDefault();
            this.setState({
                showRebate: !this.state.showRebate
            });
        },

        _getOemBlock: function() {
            var tire = this.props.tire,
                block;

            if (tire.is_oem) {
                block = (
                    <span className={cn('result_original_equip')}>
                        Original Equipment Tire
                    </span>
                );
            }

            return block;
        },

        _handleTabClick: function(tab, event) {
            this.setState({
                activeTab: tab
            });
            if (tab == 'stock' && this.state.fullStock.length <= 0) {
                Act.Tire.loadFullStock(this.props.tire.id);
            }
        },
        _handleStockClick: function(event) {
            event.preventDefault();
            var index = event.target.href.replace(/^[^#]+#/, '');
            var supplier = this.state.fullStock[index];
            
            Act.Tire.loadStock(supplier.tire_id);

            this.setState({
                stockFor: supplier
            });
        },
        _handleQuantityChange: function() {
            this.setState({
                quantity: parseInt(this.refs.quantity.value)
            });
        },
        _handleSelectClick: function(event) {
            event.preventDefault();
            Act.Quote.update(this.props.tire.id, this.state.quantity);
        },
        _handleGetQuoteClick: function(event) {
            event.preventDefault();
            Act.Quote.requestForm(this.props.tire.id, this.state.quantity);
        }
    }


});