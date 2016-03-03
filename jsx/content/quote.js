define([
    'react',
    'classnames',
    'load!actions/actions',
    'lib/helper',
    'load!stores/customerStore',
], function(
    React,
    cn,
    Act,
    h,
    customerStore
) {

   
    return {
        componentWillMount: function() {
            this._updateState();
        },
        componentDidMount: function() {
            customerStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            customerStore.unbind('change', this._updateState);    
        },


        render: function() {
            return (
                <div>
                    <a href="#results" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to summary</a>

                    <div className={cn('quote_wrapper')}>
                        <div className={cn(['sixcol', 'quote_left'])}>
                            <h3>Email Yourself</h3>
                            <p>A tire specialist is standing by to call and answer any questions you may have or help you schedule an appointment.</p>
                            <form action="#quote_submit" onSubmit={this._handleEmailClick} className={cn('appointment_form')}>
                                <fieldset>
                                    <div className={cn('control_wrapper')}>
                                        <label htmlFor={cn('order_email')}>Email Address <span className="req">*</span></label>
                                        <input type="email" id={cn('order_email')} defaultValue={this.state.email} required ref="email" />
                                    </div>
                                    <div className={cn('control_wrapper')}>
                                        <label>
                                            <input type="checkbox" ref="follow_up" /> Please follow up regarding this quote
                                        </label>
                                    </div>
                                    <button type="submit" className={cn('brand_btn')}><i className={cn('material_icons')}>&#xE0BE;</i> Send</button>
                                </fieldset>
                            </form>
                        </div>
                        <div className={cn(['sixcol', 'last', 'quote_right'])}>
                            <h3>Or</h3>
                            <a href="#print" onClick={this._handlePrintClick}  className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                        </div>
                    </div>
                </div>
            );
        },

        _updateState: function() {
            this.setState({
                email: customerStore.getCustomer().email
            })
        },

        _handleBackClick: function(event) {
            event.preventDefault();
            Act.Page.show('summary');
        },

        _handleEmailClick: function(event) {
            event.preventDefault();
            var email = this.refs.email.value;

            if ( this.refs.follow_up.checked ) {
                Act.Quote.appointmentForm('email', { email: email } );
            } else {
                Act.Quote.sendEmail(email);
            }
        },

        _handlePrintClick: function(event) {
            event.preventDefault();
            if ( this.refs.follow_up.checked ) {
                Act.Quote.appointmentForm('print');
            } else {
                Act.Quote.print();
            }
        }
     

    } 


});