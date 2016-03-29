define([
    'react',
    'classnames',
    'load!stores/stockStore',
    'load!actions/actions',
    'load!stores/reviewsStore'
], function (
    React,
    cn,
    stockStore,
    Act,
    reviewsStore
) {

    return {
        displayName: 'Stock',

        getInitialState: function() {
            return {
                suppliers: [],
                branches: [],
                branchesFor: null,
                curSupplier: null
            }
        },

        componentWillMount: function() {
            this.setState({
                curSupplier: this.props.tire.supplier
            })
        },
 
        componentDidMount: function() {
            stockStore.bind('change', this._updateState);
            this._load(this.props.load);
        },

        componentWillUnmount: function() {
            stockStore.unbind('change', this._updateState);    
        },

        componentWillReceiveProps: function(nextProps) {
            this._load(nextProps.load);
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return nextState.suppliers.length !== this.state.suppliers.length || nextState.branches.length !== this.state.branches.length || nextState.curSupplier !== this.state.curSupplier;
        },

        render: function() {
            var info = [];
            this.state.suppliers.map(function(supplierInfo, i) {
                info.push( 
                    <li key={i}>
                        <a href={'#'+ i} onClick={this._handleStockClick}>{supplierInfo.supplier.nice_name + ': ' + supplierInfo.quantity}</a>
                        <a href={'#'+ i} className={cn(['btn_small', 'brand_btn'])} disabled={ supplierInfo.supplier.name == this.state.curSupplier } dangerouslySetInnerHTML={{ __html: supplierInfo.supplier.name == this.state.curSupplier ? 'Selected &#x2714;' : 'Select' }} onClick={this._handleViewClick} />
                    </li> 
                );
            }.bind(this));

            var suppliers = <td>
                <h5 className={cn('result_reviews_heading')}>Item: {this.props.tire.part_number}</h5>
                <ul className={cn('stock_suppliers')}>{info}</ul>
            </td>;

            var branches = null;
            if (this.state.branches.length > 0) {
                var info = [];
                this.state.branches.map(function(branch, i) {
                    info.push(<li key={i}>{branch.branch + ': ' + branch.quantity}</li>);
                });

                branches = <td className={cn('result_branches')}>
                    <h5 className={cn('result_reviews_heading')}>{this.state.branchesFor.supplier.nice_name}</h5>
                    <ul>{info}</ul>
                    <a href="#stock_back" onClick={this._hangleBackClick}>Back</a>
                </td>;
            }
            return <table className={cn({result_stock_info: true, with_branches: (this.state.branches.length > 0)})}><tr>{suppliers}{branches}</tr></table>;
        },

        _load: function(need) {
            if (need && this.state.suppliers.length == 0) {
                Act.Tire.loadFullStock(this.props.tire.id);
            }
        },

         _updateState: function() {
            var state = {};
            if (this.state.suppliers.length == 0) {
                state.suppliers = stockStore.getFullStock(this.props.tire.id);
            }

            if (this.state.branchesFor) {
                state.branches = stockStore.getBranches(this.state.branchesFor.tire_id);
            }

            this.setState(state);
        },

        _hangleBackClick: function(event) {
            event.preventDefault();
            this.setState({
                branches: []
            });
        },

        _handleStockClick: function(event) {
            event.preventDefault();
            var index = event.target.href.replace(/^[^#]+#/, '');
            var supplier = this.state.suppliers[index];
            
            Act.Tire.loadStock(supplier.tire_id);

            this.setState({
                branches: [],
                branchesFor: supplier
            });
        },

        _handleViewClick: function(event) {
            event.preventDefault();
            var index = event.target.href.replace(/^[^#]+#/, '');
            var supplier = this.state.suppliers[index];

            this.setState({
                curSupplier: supplier.supplier.name
            });

            if (this.props.onSupplierChange && typeof this.props.onSupplierChange == 'function') {
                this.props.onSupplierChange(supplier, event);
            }
        }
    }

});