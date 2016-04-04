define([
    'react',
    'reactDOM',
    'lib/helper',
    'classnames',
    'lodash',
    'load!actions/actions',
    'load!stores/resultsStore',
    'load!components/elements/select',
    'load!components/page/results/tire',
    'load!components/page/results/pagination',
    'load!components/page/results/filterBlock'
], function(
    React,
    ReactDOM ,
    h,
    cn,
    _,
    Act,
    resultsStore,
    SelectField,
    Tire,
    Pagination,
    FilterBlock
) {

    return {
        displayName: 'Results',

        getInitialState: function() {
            return {
                tires: [],
                totalCount: 0,
                page: null,
                filters: []
            };
        },

        componentWillMount: function() {
            this._updateStatus();
        },

        componentDidMount: function() {
            resultsStore.bind('change', this._updateStatus);
        },

        componentWillUnmount: function() {
            resultsStore.unbind('change', this._updateStatus);    
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (this.state.page !== prevState.page) {   //|| this.state.totalCount !== prevState.totalCount
                this._scrollToTop();
            }
        },

        render: function() {
            var tires = [];
            this.state.tires.map(function(tire, i) {
                tires.push((
                    <Tire key={i + tire.part_number} tire={tire} isInMile={this.props.isInMile} isTop={(i < 3 && this.state.page == 1)} />
                ));
            }.bind(this));

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
                            <FilterBlock key={i} by={info.desc} name={info.key} allDesc={info.all} defaultValue={ this.props.fieldValues[info.key] } params={ this.state.filters[info.key].parameters } onChange={this._handleFilterChange} />
                        ));
                    }
                }, this);
            }

            return (
                <div>
                    <a href="#search" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to search</a>
                    
                    <div className={cn('results_wrapper')}>
                        <div className={cn('results_title')}>
                            <p className={cn('results_query')}>
                                <span>Found <strong className={cn('results_count')}>{this.state.totalCount}</strong> tires for:</span>
                                { this.props.queryParams.first ? <span className={cn('results_query_param')}>{this.props.queryParams.first}</span> : null }
                                { this.props.queryParams.second ? <span className={cn('results_query_param')}>{this.props.queryParams.second}</span> : null }
                                { this.props.queryParams.third ? <span className={cn('results_query_param')}>{this.props.queryParams.third}</span> : null }
                            </p>
                        </div>
                        <div id={cn('optional_fields')} className={cn(['box', 'results_filters'])}>
                            <SelectField onChange={this._handleFieldChange} options={this.props.fieldOptions.display}  label="Display:" name="display"  className={cn('filter_field')} emptyDesc={false} defaultValue={this.props.fieldValues.display} />
                            <SelectField onChange={this._handleFieldChange} options={this.props.fieldOptions.order_by} label="Sort by:" name="order_by" className={cn('filter_field')} emptyDesc={false} defaultValue={this.props.fieldValues.order_by} />
                        </div>
                        {
                            tires.length > 0 ? null : <h3 className={cn('message')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> We did not find any tires based on your search criteria. Please try searching again later as inventory changes frequently.</h3>
                        }
                        <div className={cn('filters')} id={cn('filters')}>
                            {filters}
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

        _updateStatus: function() {
            this.setState({
                tires: resultsStore.getTires(),
                totalCount: resultsStore.getTotalCount(),
                page: resultsStore.getPage(),
                filters: resultsStore.getFilters()
            })
        },

        _scrollToTop: function() {
            var results = ReactDOM.findDOMNode(this);
            h.scrollToTop(results);
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

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace('filter_', '');
            Act.Search.updateField('common', fieldName, event.target.value);
            Act.Tire.search({page: 1});
        },

        _handleFilterChange: function(name, values, event) {
            Act.Search.updateField('filters', name, values);
            Act.Tire.search({page: 1});
        },

        _handlePageClick: function(page, event) {
            event.preventDefault();
            Act.Tire.search({page: page});
        }
    }


})