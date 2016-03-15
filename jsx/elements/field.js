/*
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
                type: 'text',
                error: null,
                require: false,
                defaultValue: null,
                value: null,
                onChange: null,
                label: '',
                name: ''

                emptyDesc: '- Select -',
                disabled: false,
                withWrapper: true
            }
        },
        render: function() {
            
            var name = this.props.name;
            var id = cn('field_' + this.props.name);
            var type = this.props.type;
            var requireMark = this.props.required ? <span className="req">*</span> : null;


            var label = <label htmlFor={id}>
                {this.props.label} 
                {requireMark}
            </label>;

            switch (this.props.type) {
                case 'select',
                    break;

                case 'datetime':

                    break;

                case 'textarea':
                    break;

                default:
                    <div className={cn('control_wrapper')}>
                        {label}
                        <input type={type} id={id} required={this.props.required} ref={name} defaultValue={this.props.defaultValue} value={this.props.value} />
                        {this.props.error}
                    </div>

                    break;
            }



        },

        _handleChange: function(event) {
            if (this.props.onChange) {
                this.props.onChange(event);
            }
        },

        value: function() {
            return this.refs[this.props.name].value;
        }
    }



})
*/