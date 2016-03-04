define([
    'react',
    'classnames'
], function(
    React,
    cn
) {

    return {
        getDefaultProps: function() {
            return {
                require: false,
                emptyDesc: '- Select -',
                disabled: false,
                value: null,
                defaultValue: null,
                onChange: null,
                withWrapper: true
            }
        },
        render: function() {
            var options = [];
            var disabled = this.props.disabled;

            if (this.props.emptyDesc) {
                options.push(<option key="-1" value="">{ this.props.emptyDesc }</option>);
            } else if (this.props.options.length == 0) {
                options.push(<option key="-1" value="">- Select -</option>);
            }

            if (this.props.options.length == 0) {
                disabled = true;
            }

            this.props.options.map(function(option, i) {
                options.push(<option key={i} value={option.value}>{option.description}</option>);
            }.bind(this));

            var name = this.props.name;

            var req = null;
            if (this.props.require) {
                req = <span className="req">*</span>;
            }

            var select = <select onChange={this._handleChange} value={this.props.value} ref={name} id={cn(name)} name={name} disabled={disabled} defaultValue={this.props.defaultValue}>
                            {options}
                        </select>;

            if (this.props.withWrapper) {
                return (
                    <div className={this.props.className}>
                        <label htmlFor={cn(name)}>{this.props.label + ' '}{req}</label>
                        {select}
                    </div>
                );
            } else {
                return select
            }
        },

        _handleChange: function(event) {
            if (this.props.onChange) {
                this.props.onChange(event);
            }
        }
    }



})