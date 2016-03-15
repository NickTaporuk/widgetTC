define([
    'react',
    'classnames',
    'load!stores/pageStore'
], function(
    React,
    cn,
    pageStore
) {

    return {
        displayName: 'Header',

        componentWillMount: function() {
            this._updateStatus();
        },
        componentDidMount: function() {
            pageStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            pageStore.unbind('change', this._updateStatus);    
        },

        render: function() {
            var header;
            switch (pageStore.getPageName()) {
                case 'confirmation':
                    var props = this.state.props;
                    header = <div>
                                <h2 className={cn('textcenter')}>Thank you!</h2>
                                <p className={cn('textcenter')} dangerouslySetInnerHTML={{ __html: props.notice.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />
                            </div>
                    break;

                default:
                    var step = this._getStep();
                    header = <div>
                                {/*<h2 className={cn('textcenter')}>
                                    Find <strong className={cn('font_color')}>your tires</strong> in <strong className={cn('font_color')}>3 easy steps</strong>
                                </h2>*/}
                                <ul className="tcwlw_steps_list">
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 1)})}>Find Tires</li>
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 2)})}>Review Summary</li>
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 3)})}>Take Action</li>
                                </ul>
                            </div>
                    break;
            }

            return header;
        },

        _getStep: function() {
            var step;
            switch (this.state.page) {
                case 'search':
                case 'results':
                    step = 1;
                    break;
                case 'summary':
                    step = 2;
                    break;
                default:
                    step = 3;
                    break;
            }

            return step;
        },

        _updateStatus: function() {
            this.setState({
                page: pageStore.getPageName(),
                props: pageStore.getProps()
            });
        }
    };

    

});