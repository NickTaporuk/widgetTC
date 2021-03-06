define([
    'react',
    'reactDOM',
    'lib/helper',
    'classnames',
    'lodash',
    'config',
    'load!actions/act',
    'actions/api',
    'load!components/elements/select',
    'load!components/page/results/tire',
    'load!components/page/results/pagination',
    'load!components/page/results/filterBlock',
    'load!components/page/common/back',
    'load!stores/appStore',
    'promise',
    'load!stores/compareTiresStore'
], function (
    React,
    ReactDOM ,
    h,
    cn,
    _,
    config,
    Act,
    Api,
    SelectField,
    Tire,
    Pagination,
    FilterBlock,
    Back,
    appStore,
    Promise,
    compareTiresStore
) {
    // prepared variables
    var results, tireParameters, location, vehicleOptions;

    return {
        displayName: 'results',

        statics: {
            prepare: function(props) {
                var searchParams = _.cloneDeep(props);
                searchParams.items_per_page = config.itemsPerPage;

                return Promise.all([
                    Api.searchTires(searchParams),
                    Api.loadTireParameters(),
                    Api.loadLocation(props.location_id),
                    (!props.car_tire_id ? null : Api.loadVehicleOptions({
                        model: props.model,
                        year: props.year,
                        make: props.make,
                        trim: props.trim
                    },'car_tire_id'))
                ]).then(function (responses) {
                    results = responses[0];
                    tireParameters = responses[1];
                    location = responses[2];
                    vehicleOptions = responses[3] || null;
                });
            }
        },
        getInitialState: function() {
            return {
                ready: false,
                comparingTires: []
            };
        },
        componentWillMount: function() {
            var compareTires = compareTiresStore.getCompareTires();
            if(compareTires.length > 0) {
                this.setState({
                    comparingTires: compareTires
                });
            }

            this._init();
        },

        componentWillUpdate: function(nextProps) {
            if ( !_.isEqual(this.props, nextProps) ) {
                this._init();
            }
            if (nextProps.page && this.props.page !== nextProps.page) {
                this._scrollToTop();
            }
        },

        componentWillUnmount: function () {
            console.log('componentWillUnmount this.state.comparingTires:',this.state.comparingTires);
            compareTiresStore.addCompareTireIds(this.state.comparingTires);
        },

        render: function() {
            var tires = [];
            var fieldOptions = this.state.fieldOptions;
            var fieldValues = {
                display: this.props.display || 'full',
                order_by: this.props.order_by || 'best_mutch'
            };

            var curTime = new Date().getTime();
            this.state.tires.map(function(tire, i) {
                var tKey = i + curTime;
                tires.push((
                    <Tire key={tKey} onComparingChange={ this._handleOnComparingChange } isTireInComparing={this._isTireInComparing(tire.id)} isComparingActive={ this._isComparingActive(tire.id) } defaultQuantity={this.state.defaultSelectedQuantity} tire={tire} isInMile={this.state.isInMile} isTop={(i < 3 && this.state.page == 1)} />
                ));
            }.bind(this));

            return (
                <div>
                    <Back />
                    <div className={cn('results_wrapper')}>
                        <div className={cn('results_title')}>
                            <p className={cn('results_query')}>
                                <span>Found <strong className={cn('results_count')}>{this.state.totalCount}</strong> tires for:</span>
                                <span className={cn('results_query_param')} dangerouslySetInnerHTML={{ __html: this.state.queryParams }} />
                            </p>
                        </div>
                        <div id={cn('optional_fields')} className={cn(['box', 'results_filters'])}>
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.display}  label="Display:" name="display"  className={cn('filter_field')} emptyDesc={false} defaultValue={fieldValues.display} />
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.order_by} label="Sort by:" name="order_by" className={cn('filter_field')} emptyDesc={false} defaultValue={fieldValues.order_by} />
                        </div>
                        <div className={cn('filters')} id={cn('filters')}>
                            {this._getFilterBlocks()}
                        </div>
                        <div className={cn('results')}>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.state.itemsOnPage} totalItems={this.state.comparingTires.length} onPageClick={this._handlePageClick} />
                                <div className={cn("compare_btn_wrapper")}>
                                    <span className={cn(["font_color", "compare_number"])}>{this.state.comparingTires.length}</span>
                                    <a href="#comparing_tires" onClick={ this._handleToComparingTires } className={cn(["brand_btn_light", "btn_small", "compare_btn"])}><i className={cn("material_icons")}></i> Compare Selected Tires</a>
                                </div>
                            </div>
                            <div className={cn('twelvecol')}>
                                {
                                    (tires.length > 0) ? <ol className={cn('results_list')}>{tires}</ol> : <h3 className={cn('message')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> We did not find any tires based on your search criteria. Please try searching again later as inventory changes frequently.</h3>
                                }
                            </div>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.state.itemsOnPage} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        },

        _init: function () {
            var self = this;

            var tireDescriptions = '';

            if(vehicleOptions !== null){
                var vechicleArr = vehicleOptions.car_tire_id.filter(function(vechicle) {
                    return vechicle.value == self.props.car_tire_id;
                });

                tireDescriptions = vechicleArr[0].description;
            }

            var queryParams = '';
            if (self.props.car_tire_id) {
                queryParams = self.props.year + ' ' + self.props.make + ' ' + self.props.model + ' ' + self.props.trim + ' &nbsp;&nbsp;' + tireDescriptions;
            } else if (self.props.part_number) {
                queryParams = self.props.part_number;
            } else {
                queryParams = self.props.width + '/' + self.props.height + 'R' + self.props.rim;
            }

            if (config.clientType == 3 && results.filters.brand) {
                results.filters.brand.required_brands = ['Bridgestone', 'Firestone', 'Fuzion'];
            }

            var displayOptions = _.cloneDeep(tireParameters.display);
            if (!self.props.car_tire_id) {
                _.remove(displayOptions, function (item) {
                    return item.value == 'oem';
                });
            }

            var state = {
                page: results.page,
                tires: results.tires,
                totalCount: results.nb_results,
                filters: results.filters,

                fieldOptions: {
                    display: displayOptions,
                    order_by: tireParameters.order_by
                },

                isInMile: location.country !== 'Canada',
                itemsOnPage: config.itemsPerPage,

                defaultSelectedQuantity: config.defaultNumbersOfTires,

                queryParams: queryParams
            };

            self.setState(state);
        },
       _isTireInComparing: function(tireId) {
            return this.state.comparingTires.indexOf(tireId) !== -1;
        },

        _isComparingActive: function (tireId) {
            if(this.state.comparingTires.indexOf(tireId) !== -1) {
                return false
            } else {
                return this.state.comparingTires.length >= config.maxTiresToCompare ;
            }
        },

        _getFilterBlocks: function() {
            var filters = null;
            if (Object.keys(this.state.filters).length > 0) {
                var values = this.props.filters || {brand: [], category: [], run_flat: [], light_track: []};
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
                            <FilterBlock key={i} by={info.desc} topDirection={ !this.state.totalCount } name={info.key} allDesc={info.all} defaultValue={ values[info.key] ? _.toArray(values[info.key]) : [] } data={ this.state.filters[info.key] } onChange={this._handleFilterChange} />
                        ));
                    }
                }, this);
            }
            return filters;
        },

        _scrollToTop: function() {
            var results = ReactDOM.findDOMNode(this);
            h.scrollToTop(results);
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace('filter_', '');
            var params = _.cloneDeep(this.props);
            params[fieldName] = event.target.value;
            params.page = 1;
            Act.route('results', params);
        },

        _handleFilterChange: function(name, values) {
            var params = _.cloneDeep(this.props);
            if (!params.filters) {
                params.filters = {};
            }
            params.filters[name] = values;
            params.page = 1;
            Act.route('results', params);
        },

        _handlePageClick: function(page, event) {
            event.preventDefault();
            var params = _.cloneDeep(this.props);
            params.page = page;
            Act.route('results', params);
        },

        _handleOnComparingChange: function(tireId) {
            var comparingTires = _.cloneDeep(this.state.comparingTires);

            if(comparingTires.indexOf(tireId) !== -1) {
                _.remove(comparingTires,function(id){
                    return id == tireId;
                });
            } else { 
                comparingTires.push(tireId);
            }

            this.setState({
                comparingTires: comparingTires
            });
            console.log('comparingTires:',comparingTires);

        },
        _handleToComparingTires: function(event) {
            event.preventDefault();
            Act.route('comparing_tires');
        }
    }
});