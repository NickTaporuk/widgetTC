define([
    'react',
    'classnames',
    'load!actions/actions',
    'load!actions/act',
    'load!components/page/common/back'
], function(
    React,
    cn,
    Act,
    A,
    Back
) {
   
    return {
        render: function() {
            return (
                <div>
                    <Back />
                    {/*<a href="#results" onClick={this._handleBackClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back to summary</a>*/}

                    <div className={cn(['quote_wrapper', 'max_width'])}>
                        <div className={cn(['row'])}>
                            <div className={cn(['textcenter', 'sixcol'])}>
                                <a href="#print" onClick={this._handleEmailClick}  className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Email Quote</a>
                            </div>
                            <div className={cn(['textcenter', 'sixcol', 'last'])}>
                                <a href="#print" onClick={this._handlePrintClick}  className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                            </div>
                        </div>


                        <div>
                            <p>
                                <strong>A tire specialist is standing by to call and answer any questions you may have or help you schedule an appointment.</strong>
                            </p>
                            <div className={cn('control_wrapper')}>
                                <label>
                                    <input type="checkbox" ref="follow_up" defaultChecked={this.props.followUp} /> Request a callback
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },


        _handlePrintClick: function(event) {
            event.preventDefault();
            if ( this.refs.follow_up.checked ) {
                A.printPage.update();
            } else {
                Act.Quote.print({follow_up: false});
            }
        },
        
        _handleEmailClick: function(event) {
            event.preventDefault();
            if ( this.refs.follow_up.checked ) {
                A.emailPage.update();
            } else {
                A.emailOnlyPage.update();
            }  
        }
    }


});