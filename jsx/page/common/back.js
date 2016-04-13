define([
    'react',
    'classnames'
], function(
    React,
    cn
) {

    return {
        render: function() {
            return <a href="#search" onClick={this._handleClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back</a>
        },

        _handleClick: function(e) {
            e.preventDefault();
            window.history.back();
        }
    }

})