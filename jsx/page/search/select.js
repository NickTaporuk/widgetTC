define([
    'react',
    'classnames',
    'load!components/elements/select'
], function(
    React,
    cn,
    SelectField
) {

    return {
        getDefaultProps: function() {
            return {
                required: false,
                emptyDesc: '- Select -',
                disabled: false,
                value: null,
                defaultValue: null,
                onChange: null,
                withWrapper: false
            }
        },
        render: function() {
            var req = null;
            if (this.props.required) {
                req = <span className="req">*</span>;
            }
                return (
                    <div className={this.props.className}>
                        <label htmlFor={cn(name)}>{this.props.label + ' '}{req}</label>
                        <div>
                            <span className={cn('number_widget')}>{this.props.number}</span>
                            <SelectField
                                options={this.props.options}
                                value={this.props.value}
                                onChange={this.props.onChange}
                                name={this.props.name}
                                label={this.props.label}
                                required={true}
                                withWrapper={false}
                            />
                        </div>
                    </div>
                );
        },

        value: function() {
            return this.refs[this.props.name].value;
        }
    }
});