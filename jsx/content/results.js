define([
    'react',
    'classnames',
    'load!actions/actions',
    'load!stores/resultsStore',
    'load!components/elements/select',
    'load!components/content/results/tire'
], function(
    React,
    cn,
    Act,
    resultsStore,
    SelectField,
    Tire
) {

    return {

        getInitialState: function() {
            return {
                'isBrandsShown': false
            };
        },
        // componentWillMount: function() {
        //     this._updateStatus();
        // },
        // componentDidMount: function() {
        //     searchStore.bind('change', this._updateStatus);
        // },
        // componentWillUnmount: function() {
        //     searchStore.unbind('change', this._updateStatus);    
        // },
        render: function() {
            // console.log(this.props);

            var brandList = [];
            this.props.fieldOptions.brands.map(function(brand, i) {
                brandList.push((
                    <li key={i}>
                        <label>
                            <input type="checkbox" value={brand.value} checked={true} /> {brand.description}
                        </label>
                    </li>
                ));
            });

            var tires = [];
            this.props.tires.map(function(tire, i) {
                tires.push((
                    <Tire key={i} tire={tire} isTop={(i < 3)} />
                ));
            });

            return (
                <div>
                    <a href="#search" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to search</a>
                    
                    <div className={cn('results_wrapper')}>
                        <div className={cn('results_title')}>
                            <p className={cn('results_query')}>
                                <span>Found <strong className={cn('results_count')}>{this.props.totalCount}</strong> tires for:</span>
                                { this.props.queryParams.first ? <span className={cn('results_query_param')}>{this.props.queryParams.first}</span> : null }
                                { this.props.queryParams.second ? <span className={cn('results_query_param')}>{this.props.queryParams.second}</span> : null }
                                { this.props.queryParams.third ? <span className={cn('results_query_param')}>{this.props.queryParams.third}</span> : null }
                            </p>
                        </div>
                        <div id={cn('optional_fields')} className={cn(['box', 'results_filters'])}>
                            <SelectField options={this.props.fieldOptions.display} label="Display:" name="filter_display" className={cn('filter_field')} emptyDesc={false} />
                            <SelectField options={this.props.fieldOptions.order_by} label="Sort by:" name="filter_order_by" className={cn('filter_field')} emptyDesc={false} />
                            <SelectField options={[]} label="Filter:" name="filter_results_filter" className={cn('filter_field')} emptyDesc={false} />
                        </div>
                        <div id={cn('brands_filters')} className={cn('brands_filters')}>
                            <h4 className={cn('brands_filters_title')}>
                                <span>Brands:</span>
                                <a href="#brands_filters_list" onClick={this._handleToggleBrandsClick} className={cn(['toggle', 'brands_filters_toggle']) + ' ' + cn({'toggle_open': this.state.isBrandsShown})}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE145;' }} />Toggle Brands</a>
                            </h4>
                            <ul className={cn(['inputs_list', 'brands_filters_list']) + ' ' + cn({'toggle_hidden': !this.state.isBrandsShown})} id={cn('brands_filters_list')}>
                                <li>
                                    <label className={cn('brands_filters_all')}>
                                        <input type="checkbox" /> All Brands
                                    </label>
                                </li>
                                {brandList}
                            </ul>
                        </div>
                        <div className={cn('results')}>
                            <div className={cn('twelvecol')}>
                                <div className={cn('compare_btn_wrapper')}>
                                    <span className={cn(['font_color', 'compare_number'])}>2</span>
                                    <a href="#compare" className={cn(['brand_btn_light', 'btn_small', 'compare_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE915;' }} /> Compare Selected Tires</a>
                                </div>
                            </div>
                            <div className={cn('twelvecol')}>
                                <ol className={cn('results_list')}>
                                    {tires}                                    
                                </ol>
                            </div>

                            <div className={cn('twelvecol')}>



                            </div>
                        </div>
                    </div>
                </div>
            );
        },

        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('search');
        },
        _handleToggleBrandsClick: function(event) {
            event.preventDefault();
            this.setState({
                isBrandsShown: !this.state.isBrandsShown
            });
        },
        _handleFilterChange: function(event) {
            var fieldName = event.target.name.replace('filter_', '');
            Act.Search.updateField('common', fieldName, event.target.value);
        }
    }


})