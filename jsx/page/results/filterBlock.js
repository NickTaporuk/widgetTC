define([
    'react',
    'classnames',
    'lodash',
    'load!mixins/visibilityToggle'
], function(
    React,
    cn,
    _,
    visibilityToggle
) {

    return {
        mixins: [visibilityToggle],

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
            if (this.props.params.length > 1 && this.props.allDesc) {
                allCheckbox = <li>
                    <label className={cn('filters_all')}>
                        <input type="checkbox" defaultChecked={true} onClick={this._handleAllClick} /> {this.props.allDesc}
                    </label>
                </li>
            }

            return (
                <div className={cn('filters_wrapper')} onMouseDown={this._handleMouseDown} onMouseUp={this._handleMouseUp}>
                    <h4 className={cn('filters_title')} onMouseDown={this._handleToggleBtnMouseDown}>
                        <span>{ 'Filter by ' + this.props.by + ':'}</span>
                        <a href="javascript:;" className={cn(['toggle', 'filters_toggle'])}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: this.state.isShown ? '&#xE15B;' : '&#xE145;' }} />{'Toggle ' + this.props.by}
                        </a>
                    </h4>
                    <ul className={cn(['inputs_list', 'filters_list']) + ' ' + cn({'toggle_hidden': !this.state.isShown})}>
                        {allCheckbox}
                        {list}
                    </ul>
                </div>
            );
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