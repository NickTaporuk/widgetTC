define([
    'react',
    'reactDOM',
    'lib/helper',
    'classnames',
    'lodash',
    'load!actions/act',
    'actions/api',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!components/elements/select',
    'load!components/page/results/tire',
    'load!components/page/results/pagination',
    'load!components/page/results/filterBlock',
    'load!components/page/common/back',
    'promise'
], function (
    React,
    ReactDOM ,
    h,
    cn,
    _,
    Act,
    Api,
    searchStore,
    locationsStore,
    SelectField,
    Tire,
    Pagination,
    FilterBlock,
    Back,
    Promise
) {

    return {
        displayName: 'Results',

        getInitialState: function() {
            return {
                ready: false,
                page: 1,
                tires: [],
                totalCount: 0,
                filters: []
            };
        },

        componentWillMount: function() {
            // this._updateState();
        },

        componentDidMount: function() {
            // searchStore.bind('change', this._updateState);

            console.log(this.props);
            var self = this;

            Promise.all([
                Api.searchTires(this.props)
            ]).then(function (responses) {
                var results = responses[0];
                self.setState({
                    ready: true,
                    page: results.page,
                    tires: results.tires,
                    totalCount: results.nb_results,
                    filters: results.filters
                });
            });
        },

        componentWillUnmount: function() {
            // searchStore.unbind('change', this._updateState);
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (this.state.page !== prevState.page) {
                this._scrollToTop();
            }
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            var tires = [];
            var fieldOptions = this._getFieldsOptions();

            var curTime = new Date().getTime();
            this.state.tires.map(function(tire, i) {
                var tKey = i + curTime;
                tires.push((
                    <Tire key={tKey} tire={tire} isInMile={this.props.isInMile} isTop={(i < 3 && this.state.page == 1)} />
                ));
            }.bind(this));

            return (
                <div>
                    <Back />
                    <div className={cn('results_wrapper')}>
                        <div className={cn('results_title')}>
                            <p className={cn('results_query')}>
                                <span>Found <strong className={cn('results_count')}>{this.state.totalCount}</strong> tires for:</span>
                                {/* this.props.queryParams.first ? <span className={cn('results_query_param')}>{this.props.queryParams.first}</span> : null */}
                                {/* this.props.queryParams.second ? <span className={cn('results_query_param')}>{this.props.queryParams.second}</span> : null */}
                                {/* this.props.queryParams.third ? <span className={cn('results_query_param')}>{this.props.queryParams.third}</span> : null */}
                            </p>
                        </div>
                        <div id={cn('optional_fields')} className={cn(['box', 'results_filters'])}>
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.display}  label="Display:" name="display"  className={cn('filter_field')} emptyDesc={false} defaultValue={this.props.fieldValues.display} />
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.order_by} label="Sort by:" name="order_by" className={cn('filter_field')} emptyDesc={false} defaultValue={this.props.fieldValues.order_by} />
                        </div>
                        {
                            tires.length > 0 ? null : <h3 className={cn('message')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> We did not find any tires based on your search criteria. Please try searching again later as inventory changes frequently.</h3>
                        }
                        <div className={cn('filters')} id={cn('filters')}>
                            {this._getFilterBlocks()}
                        </div>
                        <div className={cn('results')}>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.props.itemsOnPage} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
                                {/*<div className={cn('compare_btn_wrapper')}>
                                    <span className={cn(['font_color', 'compare_number'])}>2</span>
                                    <a href="#compare" className={cn(['brand_btn_light', 'btn_small', 'compare_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE915;' }} /> Compare Selected Tires</a>
                                </div>*/}
                            </div>
                            <div className={cn('twelvecol')}>
                                {
                                    (tires.length > 0)
                                    ? 
                                    <ol className={cn('results_list')}>
                                        {tires}                                    
                                    </ol>
                                    : 
                                    null
                                }
                            </div>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.props.itemsOnPage} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        },

        _getSearchParamsInfo: function() {

        },

        _getFilterBlocks: function() {
            if (this.state.tires.length > 0) {
                var filters = null;
                if (Object.keys(this.state.filters).length > 0) {
                    var filtersInfo = [
                        {key: 'run_flat', desc: 'Run-Flat', all: 'All/None'}, 
                        {key: 'light_truck', desc: 'Light Track', all: 'All/None'}, 
                        {key: 'brand', desc: 'Brand', all: 'All Brands'},
                        {key: 'category', desc: 'Category', all: 'All Categories'}
                    ];
                    filters = [];
                    filtersInfo.forEach(function(info, i) {
                        if (this.state.filters[info.key].parameters.length > 1) {
                            filters.push((
                                <FilterBlock key={i} by={info.desc} topDirection={ !this.state.totalCount } name={info.key} allDesc={info.all} defaultValue={ this.props.fieldValues.filters[info.key] } params={ this.state.filters[info.key].parameters } onChange={this._handleFilterChange} />
                            ));
                        }
                    }, this);
                }
            }
            return filters;
        },

        _getFieldsOptions: function() {
            return {
                display: searchStore.getOptions('display'),  
                order_by: searchStore.getOptions('order_by')
            };
        },

        _updateState: function() {
            this.setState({
                page: searchStore.getValue('common', 'page'),
                tires: resultsStore.getTires(),
                totalCount: resultsStore.getTotalCount(),
                filters: resultsStore.getFilters()
            });
        },

        _scrollToTop: function() {
            var results = ReactDOM.findDOMNode(this);
            h.scrollToTop(results);
        },

        _getEntry: function() {
            var params = {
                page: searchStore.getValue('common', 'page'),
                display: searchStore.getValue('common', 'display'),
                order_by: searchStore.getValue('common', 'order_by'),
                filters: {
                    brand: searchStore.getValue('filters', 'brand'),
                    run_flat: searchStore.getValue('filters', 'run_flat'),
                    light_truck: searchStore.getValue('filters', 'light_truck'),
                    category: searchStore.getValue('filters', 'category')
                },
                location_id: locationsStore.getCurrentLocation().id
            };
            var searchParams = searchStore.getSectionValues(searchStore.getActiveSection());
            delete searchParams.base_category;

            return _.merge(params, searchParams);
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace('filter_', '');
            var entry = this._getEntry();
            entry[fieldName] = event.target.value;
            entry.page = 1;
            Act.resultsPage.update(entry);
        },

        _handleFilterChange: function(name, values, event) {
            var entry = this._getEntry();
            entry.filters[name] = values;
            entry.page = 1;
            Act.resultsPage.update(entry);
        },

        _handlePageClick: function(page, event) {
            event.preventDefault();
            var entry = this._getEntry();
            entry.page = page;
            Act.resultsPage.update(entry);
        }
    }


})