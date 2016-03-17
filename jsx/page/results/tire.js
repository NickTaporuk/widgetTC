define([
    'react',
    'config',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'moment',
    'load!stores/stockStore',
    'load!stores/reviewsStore'
], function(
    React,
    config,
    cn,
    Act,
    h,
    moment,
    stockStore,
    reviewsStore
) {

    return {
        getInitialState: function() {
            return {
                activeTab: 'specs',
                showRebate: false,

                fullStock: [],
                stock: [],
                stockFor: null,

                reviews: []
            }
        },

        componentWillMount: function() {
            this.setState({
                selQuantity: this.props.tire.selected_quantity,
                quantity: this.props.tire.quantity,
                price: this.props.tire.price,
                supplier: this.props.tire.supplier
            });
            this._updateState();
        },
        componentDidMount: function() {
            stockStore.bind('change', this._updateState);
            reviewsStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            stockStore.unbind('change', this._updateState);    
            reviewsStore.unbind('change', this._updateState);    
        },

        render: function() {
            var tire = this.props.tire;
            var tab = this.state.activeTab;
            var warranty = this.props.isInMile ? tire.mileage_rating : tire.kilometer_rating;

            var features = null;
            if (tire.description) {
                var items = [];
                tire.description.map(function(desc, i){
                    if (typeof desc === 'object') {
                        items.push(<h5 key={i+'h'}>{desc.feature}</h5>);
                        items.push(<p key={i+'d'}>{desc.benefit}</p>);
                    } else {
                        items.push(<li key={i}>{desc}</li>);
                    }
                });
                features = <div className={cn('tab_cont')} id={cn('features_result_1')} aria-hidden={!(tab == 'features')}><ul>{items}</ul></div>;
            }

            var quantityItems = [];
            for(var q = 1; q <= this.state.quantity && q <= 8; q++) {
                quantityItems.push(<option key={q} value={q}>{q}</option>);
            }

            return (
                <li className={cn({result: true, result_featured: this.props.isTop, border_color: this.props.isTop})}>
                    <div className={cn('result_header')}>
                        <h3 className={cn(['result_title', 'font_color'])}>
                            {tire.model}
                            <span className={cn('result_subtitle')}>
                                <span className={cn('result_type')}>{tire.category}</span>
                                <span className={cn('warranty')}>Warranty: <strong className={cn('warranty_value')}>{warranty ? warranty : 'NA'}</strong> {warranty ? (this.props.isInMile ? 'mi' : 'km') : null}</span>
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
                                {
                                    this.props.tire.external_info.marketing.images.length > 0
                                    ?   <a href="#tire_img" onClick={this._handleEnlargeClick} className={cn(['modal_open', 'tire_enlarge', 'font_color'])}>
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE147;'}} /><span className={cn('hidden')}>Enlarge</span>
                                        </a>
                                    :   null
                                }
                            </div>
                            {this._getRebateBlock()}
                            {this._getOemBlock()}
                            {this._getRatingBlock()}
                        </div>
                        <div className={cn('result_right')}>
                            { this.props.tire.external_info.marketing.statement
                                ?   <div className={cn('result_intro')}>
                                        <p>{this.props.tire.external_info.marketing.statement}</p>
                                    </div>
                                :   null
                            }
                            <div className={cn('result_select_actions')}>
                                <div className={cn('result_price_wrapper')}>
                                    <div className={cn('result_price')}>
                                        <label className={cn('qty')}>
                                            <span className={cn('qty_label')}>Qty:</span>
                                            <select name={cn('qty_result_1')} onChange={this._handleQuantityChange} value={this.state.selQuantity} ref="quantity">
                                                {quantityItems}
                                            </select>
                                        </label>
                                        <h5 className={cn('price')}>
                                            <strong className={cn('price_value')}>{this.state.price ? '$' + h.priceFormat(this.state.price * this.state.selQuantity) : null}</strong>
                                        </h5>
                                    </div>
                                </div>
                                <div className={cn('select_btn_wrapper')}>
                                    { this.state.price
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
                                    {   
                                        this.props.tire.external_info.rating.total_reviews
                                        ? <li className={cn('tab')}><a href="#reviews_result_1" onClick={this._handleTabClick.bind(this, 'reviews')} className={cn('font_color')}  aria-selected={(tab == 'reviews')}>Reviews</a></li>
                                        : null
                                    }
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
                                    <h4 className={cn('result_reviews_heading')}><strong>{this.props.tire.external_info.rating.total_reviews}</strong> reviews:</h4>
                                    {this._getReviewsBlock()}
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

        _updateState: function() {
            var state = this.state;
            if (this.state.fullStock.length == 0) {
                state.fullStock = stockStore.getFullStock(this.props.tire.id);
            }
            if (this.state.stockFor) {
                state.stock = stockStore.getBranches(this.state.stockFor.tire_id);
            }
            if (this.state.activeTab == 'reviews') {
                state.reviews = reviewsStore.getReviews(this.props.tire.id);
                state.totalReviews = reviewsStore.getTotalReviews(this.props.tire.id);
            }

            this.setState(state);
        },

        _getReviewsBlock: function() {
            var items = [];

            this.state.reviews.map(function(review, i) {
                items.push((
                    <div key={i} className={cn('result_review')}>
                        <h5 className={cn('result_review_title')}>{review.title}</h5>
                        {this._getStars(review.rating)}
                        <span className={cn('result_review_date')}>{moment(review.submitted_at).format('MMMM DD, YYYY')}</span>
                        <div className={cn('result_review_content')}>
                            <p dangerouslySetInnerHTML={{ __html: review.text }} />
                        </div>
                    </div>
                ));
            }.bind(this));

            if (this.state.reviews.length < this.state.totalReviews) {
                items.push(<a key="more" onClick={this._handleMoreReviews} href="#more">Show more reviews</a>);
            }
            return items;
        },

        _getStockInfo: function() {
            var info = [];
            if (!this.state.stock.length) {
                var info = [];
                this.state.fullStock.map(function(supplierInfo, i) {
                    info.push( 
                        <li key={i}>
                            <a href={'#'+ i} onClick={this._handleStockClick}>{supplierInfo.supplier.nice_name + ': ' + supplierInfo.quantity}</a>
                            <a href={'#'+ i} className={cn(['btn_small', 'brand_btn'])} disabled={ supplierInfo.supplier.name == this.state.supplier } dangerouslySetInnerHTML={{ __html: supplierInfo.supplier.name == this.state.supplier ? 'Selected &#x2714;' : 'Select' }} onClick={this._handleSupplierViewClick} />
                        </li> 
                    );
                }.bind(this));

                return <div>
                    <h5 className={cn('result_reviews_heading')}>Item: {this.props.tire.part_number}</h5>
                    <ul className={cn('stock_suppliers')}>{info}</ul>
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

        _hangleStockBackClick: function(event) {
            event.preventDefault();
            this.setState({
                stock: []
            });
        },

        _getRatingBlock: function(rating, totalRevuew) {
            var info = this.props.tire.external_info;
            var rating = info.rating.average_rating;
            if (!rating) {
                return null;
            }

            var stars = this._getStars(rating);

            var totalReviews = null
            if (info.rating.total_reviews) {
                totalReviews = info.rating.total_reviews;
            }

            return this._getStars(rating, totalReviews);
        },

        _getStars: function(rating, totalReviews) {
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

            var rewiewsLink = null
            if (totalReviews) {
                rewiewsLink = <a href="#reviews" onClick={this._handleTabClick.bind(this, 'reviews')} className={cn('result_rating_link')}>{totalReviews + ' Reviews'}</a>
            }

            return (
                <div className={cn('result_rating')} aria-label="Tire rating:  stars">
                    {stars}
                    {rewiewsLink}
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
                if (offer[0] !== undefined) { // needed as there are bug in response (if no discount we receive array. But it must be null)
                    offer = null;
                }
            }

            if (offer) {
                var link;
                if (offer.coupon_link && offer.coupon_line) {
                    link = <a target="_blank" rel="nofollow" href={offer.coupon_link}>{offer.coupon_line}</a>          
                }

                var range;
                if (!offer.valid_range.is_ongoing) {
                    range = 'Valid from ' + moment(offer.valid_range.start_date).format('MMM. DD') + ' to ' + moment(offer.valid_range.end_date).format('MMM. DD, YYYY') + '*';
                }

                var legalLine;
                if (offer.legal_link) {
                    legalLine = <span>{ offer.valid_range.is_ongoing ? '' : '*' }<a target="_blank" rel="nofollow" href={offer.legal_link} style={{color: offer.color }} dangerouslySetInnerHTML={ {__html: offer.legal_line} } /></span>;
                }
                
                block = (
                    <span className={cn(['result_rebate', 'tooltip'])}>
                        <a href="#show_rebate" onClick={this._showRebate} className={cn({toggle: true, toggle_open: this.state.showRebate})}>{offer.name} <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE887;'}} /></a>

                        <span className={cn(['tooltip_content', 'toggle_content']) + ' ' + cn({toggle_hidden: !this.state.showRebate})} id={cn('result_2_rebate')}>
                            <p>
                                {offer.description} {range ? <br /> : null}
                                {range} <br />
                                {link} {link ? <br /> : null}
                                {legalLine}
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
            event.preventDefault();

            this.setState({
                activeTab: tab
            });
            if (tab == 'stock' && this.state.fullStock.length <= 0) {
                Act.Tire.loadFullStock(this.props.tire.id);
            }
            if (tab == 'reviews' && this.state.reviews.length <= 0) {
                Act.Tire.loadRewiews(this.props.tire.id);   
            }
        },
        _handleMoreReviews: function(event) {
            event.preventDefault();
            Act.Tire.loadRewiews(this.props.tire.id, this.state.reviews.length);
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
        _handleSupplierViewClick: function(event) {
            event.preventDefault();
            var index = event.target.href.replace(/^[^#]+#/, '');
            var supplier = this.state.fullStock[index];

            this.setState({
                price:  supplier.price,
                quantity: supplier.quantity,
                selQuantity: supplier.quantity < this.state.selQuantity ? parseInt(supplier.quantity) : this.state.selQuantity,
                supplierIndex: index,
                supplier: supplier.supplier.name
            });
        },
        _handleQuantityChange: function() {
            this.setState({
                selQuantity: parseInt(this.refs.quantity.value)
            });
        },
        _handleSelectClick: function(event) {
            event.preventDefault();
            var supplier = this.state.supplierIndex ? this.state.fullStock[this.state.supplierIndex] : null;
            Act.Tire.select(this.props.tire, this.state.selQuantity, supplier);
        },
        _handleGetQuoteClick: function(event) {
            event.preventDefault();
            Act.Quote.requestForm(this.props.tire.id, this.state.selQuantity);
        },
        _handleEnlargeClick: function(event) {
            event.preventDefault();
            Act.Tire.enlargeImage(this.props.tire.external_info.marketing.images[0], this.props.tire.model);
        }
    }


});