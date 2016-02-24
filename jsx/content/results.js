define([
    'react',
    'classnames',
    'lodash',
    'load!actions/actions',
    'load!stores/resultsStore',
    'load!components/elements/select',
    'load!components/content/results/tire',
    'load!components/content/results/pagination',
    'load!components/content/results/filterBlock'
], function(
    React,
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
        getInitialState: function() {
            return {
                tires: [],
                totalCount: 0,
                page: null
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

        render: function() {
            console.log('results render');

            var tires = [];
            this.state.tires.map(function(tire, i) {
                tires.push((
                    <Tire key={i + tire.part_number} tire={tire} isTop={(i < 3 && this.state.page == 1)} />
                ));
            }.bind(this));

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
                            <SelectField onChange={this._handleFieldChange} options={this.props.fieldOptions.order_by} label="Sort by:" name="order_by" className={cn('filter_field')} emptyDesc={false} defaultValue={this.props.fieldValues.display} />
                        </div>
                        <div className={cn('brands_types_filters')} id={cn('brands_types_filters')}>
                            <FilterBlock key={1} by="type" options={ {run_flat: this.props.fieldOptions.run_flat, light_truck: this.props.fieldOptions.light_truck} } values={ {run_flat: this.props.fieldValues.run_flat, light_truck: this.props.fieldValues.light_truck} } onChange={this._handleFilterChange} />
                            <FilterBlock key={2} by="brand" options={ {brand: this.props.fieldOptions.brand} } values={ {brand: this.props.fieldValues.brand} } onChange={this._handleFilterChange} />
                        </div>
                        <div className={cn('results')}>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={6} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
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
                                <Pagination activePage={this.state.page} itemsOnPage={6} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
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
                page: resultsStore.getPage()
            })
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
            Act.Search.make();
        },
        _handleFilterChange: function(name, values, event) {
            Act.Search.updateField('common', name, values);
            Act.Search.make();
        },
        _handlePageClick: function(page, event) {
            event.preventDefault();
            Act.Results.updatePage({page: page});
        }
    }


})