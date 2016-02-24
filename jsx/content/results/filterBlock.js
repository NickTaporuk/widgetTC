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
                isShown: false
            }
        },

        render: function() {

            var list = null;
            var names = Object.keys(this.props.options);
            if (names.length > 0) {
                list = [];

                names.forEach(function(name, i, names) {
                    this.props.options[name].map(function(option, i) {
                        list.push((
                            <li key={(name + i)}>
                                <label>
                                    <input type="checkbox" name={name} value={option.value} onChange={this._handleFieldChange} defaultChecked={ (this.props.values[name].indexOf(option.value) !== -1) } /> {option.description}
                                </label>
                            </li>
                        ));
                    }.bind(this));
                }, this);
            }

            var toggleName =  this.props.by.charAt(0).toUpperCase() + this.props.by.slice(1);
            return (
                <div id={cn('brands_filters_wrapper')} className={cn('brands_types_filters_wrapper')}>
                    <h4 className={cn('brands_types_filters_title')}>
                        <span>{ 'Filter by ' + this.props.by + ':'}</span>
                        <a href="#brands_filters_list" onClick={this._handleToggleClick} className={cn(['toggle', 'brands_types_filters_toggle']) + ' ' + cn({'toggle_open': this.state.isShown})}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE145;' }} />{'Toggle ' + toggleName + 's'}
                        </a>
                    </h4>
                    <ul className={cn(['inputs_list', 'brands_types_filters_list']) + ' ' + cn({'toggle_hidden': !this.state.isShown})} id={cn(this.props.by + 's_filters_list')}>
                        <li>
                            <label className={cn('brands_types_filters_all')}>
                                <input type="checkbox" defaultChecked={true} /> All Brands
                            </label>
                        </li>
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
        _values: {},
        _handleFieldChange: function(event) {
            if (this.props.onChange) {
                var value = event.target.value;
                var name = event.target.name;

                if (!this._values[name]) {
                    this._values[name] = this.props.values[name]
                }

                if (event.target.checked) {
                    this._values[name].push(value);
                } else {
                    _.remove(this._values[name], function(el) {
                        return el == value;
                    });
                }

                this.props.onChange(name, this._values[name], event);
            }
        }
    }

});