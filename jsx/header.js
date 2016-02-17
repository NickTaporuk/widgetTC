define([
    'react',
    'classnames',
    'dispatcher'
], function(
    React,
    cn,
    dispatcher
) {

    return {
        render: function() {
            return (
                <div>
                    <h2 className={cn('textcenter')} onClick={this._handleClick}>
                        Find <strong className={cn('font_color')}>your tires</strong> in <strong className={cn('font_color')}>3 easy steps</strong>
                    </h2>
                    <ul className="tcwlw_steps_list">
                        <li className={cn({'steps_list_item': true, 'active': true})}>Find Tires</li>
                        <li className={cn({'steps_list_item': true, 'active': false})}>Review Summary</li>
                        <li className={cn({'steps_list_item': true, 'active': false})}>Take Action</li>
                    </ul>
                </div>
            );
        },

        _handleClick: function() {
            dispatcher.dispatch({
                actionType: 'page-update',
                name: 'results'
            });
            // alert('df');
        }
    };

    

});