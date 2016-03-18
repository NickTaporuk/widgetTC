define([
    'react',
    'classnames',
    'lodash'
], function(
    React,
    cn,
    _
) {

    return {
        getInitialState: function() {
            return {
                isShown: false,
                checkedValues: [],
                allValues: [],

            }
        },

        getDefaultProps: function() {
            return {
                allDesc: 'All',
                defaultValue: []
            }
        },

        componentWillMount: function() {
            var allValues = [];
            this.props.params.forEach(function(param, i){
                allValues.push(param.value);
            }, this);

            this.setState({
                checkedValues: this.props.defaultValue.length > 0 ? this.props.defaultValue : allValues,
                allValues: allValues
            });
        },
        
        shouldComponentUpdate: function(nextProps, nextState) {
            return this.state.checkedValues.length !== nextState.checkedValues.length || this.state.isShown !== nextState.isShown;
        },

        render: function() {
            var list = [];

            this.props.params.map(function(option, i) {
                list.push((
                    <li key={i}>
                        <label>
                            <input type="checkbox" name={this.props.name} value={option.value} onChange={this._handleFieldChange} checked={ (this.state.checkedValues.indexOf(option.value) !== -1) } /> {option.description + ' (' + option.count + ')'}
                        </label>
                    </li>
                ));
            }.bind(this));


            var allCheckbox = null;
            if (this.props.params.length > 2 && this.props.allDesc) {
                allCheckbox = <li>
                    <label className={cn('filters_all')}>
                        <input type="checkbox" defaultChecked={true} onClick={this._handleAllClick} /> {this.props.allDesc}
                    </label>
                </li>
            }

            return (
                <div className={cn('filters_wrapper')}>
                    <h4 className={cn('filters_title')}>
                        <span>{ 'Filter by ' + this.props.by + ':'}</span>
                        <a href="#brands_filters_list" onClick={this._handleToggleClick} className={cn(['toggle', 'filters_toggle']) + ' ' + cn({'toggle_open': this.state.isShown})}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE145;' }} />{'Toggle ' + this.props.by}
                        </a>
                    </h4>
                    <ul className={cn(['inputs_list', 'filters_list']) + ' ' + cn({'toggle_hidden': !this.state.isShown})}>
                        {allCheckbox}
                        {list}
                    </ul>
                </div>
            );
        },

        _handleToggleClick: function(event) {
            event.preventDefault();
            this.setState({
                isShown: !this.state.isShown
            });
        },

        _handleFieldChange: function(event) {
            var value = event.target.value;
            if (!isNaN(parseInt(value))) {
                value = parseInt(value);
            }

            var checkedValues = _.cloneDeep(this.state.checkedValues);

            if (event.target.checked) {
                checkedValues.push(value);
            } else {
                _.remove(checkedValues, function(el) {
                    return el == value;
                });
            }
            this.setState({
                checkedValues: checkedValues
            });

            this.props.onChange(this.props.name, checkedValues, event);
        },

        _handleAllClick: function(event) {
            var checkedValues = _.cloneDeep(this.state.checkedValues);
            
            if (event.target.checked) {
                checkedValues = this.state.allValues;
            } else {
                checkedValues = [];    
            }
            
            this.setState({
                checkedValues: checkedValues
            });            

            this.props.onChange(this.props.name, checkedValues, event);
        }
    }

});