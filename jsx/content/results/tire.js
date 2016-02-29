define([
    'react',
    'classnames',
    'load!actions/actions',
    'lib/helper'
], function(
    React,
    cn,
    Act,
    h
) {

    return {
        getInitialState: function() {
            return {
                activeTab: 'specs',
                quantity: 4
            }
        },

        componentWillMount: function() {
            this.setState({
                quantity: this.props.tire.selected_quantity
            });
        },

        render: function() {
            var tire = this.props.tire;
            var tab = this.state.activeTab;

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
                <li className={cn({result: true, result_featured: this.props.isTop})}>
                    <div className={cn('result_header')}>
                        <h3 className={cn(['result_title', 'font_color'])}>
                            {tire.model}
                            <span className={cn('result_subtitle')}>
                                <span className={cn('result_type')}>{tire.category}</span><span className={cn('warranty')}>Warranty: <strong className={cn('warranty_value')}>65000</strong> km</span>
                            </span>
                        </h3>
                        {/*<label className={cn('result_compare')}>
                            <input type="checkbox" defaultChecked={false} /> Add to compare
                        </label>*/}
                    </div>
                    <div className={cn('result_body')}>
                        <div className={cn('result_left')}>
                            <img src={tire.brand_logo} alt={tire.brand + ' Tire'} className={cn('result_brand_logo')} />
                            <img src={tire.image} alt="An image of the tire" className={cn('result_tire')} />
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
                                            <strong className={cn('price_value')}>${h.priceFormat(tire.price * this.state.quantity)}</strong>
                                        </h5>
                                    </div>
                                </div>
                                <div className={cn('select_btn_wrapper')}>
                                    <a href="#summary" onClick={this._handleSelectClick} className={cn(['btn', 'brand_btn', 'select_btn'])}>Select Tire <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
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
                                </ul>
                                <div className={cn('tab_cont')} id={cn('specs_result_1')} aria-hidden={!(tab == 'specs')}>
                                    <ul className={cn('result_specs_list')}>
                                        <li>Size: <strong className={cn('result_spec_value')}>{tire.size_short}</strong></li>
                                        <li>Speed Rating: <strong className={cn('result_spec_value')}>{tire.speed_rating}</strong></li>
                                        <li>Load Index: <strong className={cn('result_spec_value')}>{tire.load_index}</strong></li>
                                        <li>Sidewall: <strong className={cn('result_spec_value')}>{tire.side_wall_style}</strong></li>
                                        <li>Part: <strong className={cn('result_spec_value')}>{tire.part_number}</strong></li>
                                    </ul>
                                </div>
                                {features}
                                <div className={cn('tab_cont')} id={cn('reviews_result_1')} aria-hidden={!(tab == 'reviews')}>
                                    <h4 className={cn('result_reviews_heading')}><strong>10</strong> reviews:</h4>

                                    <div className={cn('result_review')}>
                                        <h5 className={cn('result_review_title')}>A great tire!</h5>
                                        <div className={cn('result_rating')} aria-label="Tire rating: 3.5 stars">
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE839;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE83A;' }} />
                                        </div>
                                        <span className={cn('result_review_date')}>November 15, 2015</span>
                                        <div className={cn('result_review_content')}>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dui leo, mollis ac condimentum nec, iaculis non mi. Duis dictum dui a velit aliquet, ac consequat risus accumsan. </p>
                                        </div>
                                    </div>

                                    <div className={cn('result_review')}>
                                        <h5 className={cn('result_review_title')}>A much longer review title for testing layout adjustments</h5>
                                        <div className={cn('result_rating')} aria-label="Tire rating: 4 stars">
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE838;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE839;' }} />
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE83A;' }} />
                                        </div>
                                        <span className={cn('result_review_date')}>November 6, 2015</span>
                                        <div className={cn('result_review_content')}>
                                            <p>Suspendisse congue laoreet nulla ut mattis. Duis at sem rutrum, varius orci at, suscipit lectus. Phasellus ac magna semper, luctus sapien non, tempus sapien. </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            );
        },
        _handleTabClick: function(tab, event) {
            this.setState({
                activeTab: tab
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
        }
    }


});