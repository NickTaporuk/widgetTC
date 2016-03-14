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
                checkedValues: []
            }
        },
        getDefaultProps: function() {
            return {
                allDesc: 'All'
            }
        },

        componentWillMount: function() {
            this.setState({
                checkedValues: _.cloneDeep(this.props.values)
            });
        },
        shouldComponentUpdate: function(nextProps, nextState) {
            var should = this.props.values.length !== nextProps.values.length || this.state.isShown !== nextState.isShown;
            if (!should) {
                var names = Object.keys(this.props.values);
                var namesCount = names.length;
                for (var i = 0; i < namesCount; i++) {
                    var name = names[i];
                    if (this.state.checkedValues[name].length !== nextState.checkedValues[name].length) {
                        should = true;
                        break;
                    }
                }
            }
            return should;
        },

        render: function() {
            // console.log('filter render start');

            var list = null;
            var names = Object.keys(this.props.options);
            if (names.length > 0) {
                list = [];

                names.forEach(function(name, i, names) {
                    this.props.options[name].map(function(option, i) {
                        list.push((
                            <li key={(name + i)}>
                                <label>
                                    <input type="checkbox" name={name} value={option.value} onChange={this._handleFieldChange} checked={ (this.state.checkedValues[name].indexOf(option.value) !== -1) } /> {option.description}
                                </label>
                            </li>
                        ));
                    }.bind(this));
                }, this);
            }

            var toggleName =  this.props.by; //.charAt(0).toUpperCase() + this.props.by.slice(1);

            var allCheckbox = null;
            if (this.props.allDesc) {
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
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE145;' }} />{'Toggle ' + toggleName}
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
            if (this.props.onChange) {
                var value = event.target.value;
                if (!isNaN(parseInt(value))) {
                    value = parseInt(value);
                }
                var name = event.target.name;

                var checkedValues = _.cloneDeep(this.state.checkedValues);
                if (event.target.checked) {
                    checkedValues[name].push(value);
                } else {
                    _.remove(checkedValues[name], function(el) {
                        return el == value;
                    });
                }
                this.setState({
                    checkedValues: checkedValues
                });

                this.props.onChange(name, checkedValues[name], event);
            }
        },
        _handleAllClick: function(event) {
            var checkedValues = _.cloneDeep(this.state.checkedValues);
            Object.keys(this.props.values).forEach(function(name, i) {
                if (event.target.checked) {
                    checkedValues[name] = this.props.values[name];
                } else {
                    checkedValues[name] = [];    
                }
                this.props.onChange(name, checkedValues[name], event);
            }, this);
            
            this.setState({
                checkedValues: checkedValues
            });            
        }
    }

});