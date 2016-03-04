define([
    'load!components/popup/locations',
    // 'load!components/popup/message',
    'react',
    'load!stores/popupStore',
    'load!actions/actions',
    'classnames'
], function(
    Locations,
    // Message,
    React,
    popupStore,
    Act,
    cn
) {

    return {
        getInitialState: function() {
            return {
                name: null,
                props: {},
                isHidden: true
            }
        },

        componentDidMount: function() {
            popupStore.bind('change', this._changeState);
        },

        componentWillUnmount: function() {
            popupStore.unbind('change', this._changeState);
        },

        render: function() {
            var content = null,
                title = '';
            switch (this.state.name) {
                case 'locations':
                    title = 'Please select a preferred location:';
                    content = <Locations />;
                    break;
                case 'alert':
                    var title = this.state.props.title;
                    content = this.state.props.content ? <p dangerouslySetInnerHTML={ {__html: this.state.props.content} } /> : null;
                    break;

                default:
                    title = null;
                    content = null;
                    break;
            }
            if (content) {
                content = <div className={cn('modal_content_inner')}>{content}</div>              
            }

            return (
                <div id={cn(this.state.name + '_modal')} className={cn('modal')} aria-hidden={this.state.isHidden} role="dialog">
                    <div className={cn('row')}>
                        <div id={cn('modal_content')} className={cn('modal_content')}>
                            <div className={cn('modal_content_top')}>
                                <h4>{title}</h4>
                                <button onClick={this._handleCloseClick} className={cn(['brand_btn_light', 'btn_small', 'modal_close'])} title="Close this modal" aria-label="Close this modal"><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C9;' }} /> Close</button>
                            </div>
                            {content}
                        </div>
                    </div>
                </div>
            );
        },

        _changeState: function() {
            this.setState({
                name: popupStore.getPopupName(),
                props: popupStore.getProps(),
                isHidden: popupStore.isHidden()
            });
        },
        _handleCloseClick: function() {
            Act.Popup.close();
        }
    };

});