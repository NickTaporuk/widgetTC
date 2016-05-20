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
                            <SelectField {...this.props} />
                        </div>
                    </div>
                );
        },

        value: function() {
            return this.refs[this.props.name].value;
        }
    }
});