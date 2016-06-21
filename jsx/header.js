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
        displayName: 'header',

        componentWillMount: function() {
            this._updateState();
        },
        componentDidMount: function() {
            pageStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            pageStore.unbind('change', this._updateState);
        },

        render: function() {
            var header;
            switch (this.state.page) {
                case 'confirmation':
                    var props = pageStore.getProps();
                    header = <div>
                                <h2 className={cn('textcenter')}>Thank you!</h2>
                                <p className={cn('textcenter')} dangerouslySetInnerHTML={{ __html: props.notice.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />
                            </div>;
                    break;

                default:
                    var step = this._getStep();
                    header = <div>
                                <ul className="tcwlw_steps_list">
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 1)})}>Find Tires</li>
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 2)})}>Review Summary</li>
                                    <li className={cn({'steps_list_item': true, 'bg_color': true, 'active': (step == 3)})}>Take Action</li>
                                </ul>
                            </div>;
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

        _updateState: function() {
            this.setState({
                page: pageStore.getPage(),
            });
        }
    };

    

});