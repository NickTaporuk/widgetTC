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
            return (
                <div>
                    <h2 className={cn('textcenter')}>
                        Find <strong className={cn('font_color')}>your tires</strong> in <strong className={cn('font_color')}>3 easy steps</strong>
                    </h2>
                    <ul className="tcwlw_steps_list">
                        <li className={cn({'steps_list_item': true, 'active': (this.state.step == 1)})}>Find Tires</li>
                        <li className={cn({'steps_list_item': true, 'active': (this.state.step == 2)})}>Review Summary</li>
                        <li className={cn({'steps_list_item': true, 'active': (this.state.step == 3)})}>Take Action</li>
                    </ul>
                </div>
            );
        },

        _updateStatus: function() {
            var step;
            switch (pageStore.getPageName()) {
                case 'search':
                    step = 1;
                    break;
                case 'results':
                    step = 2;
                    break;
                default:
                    step = 3;
                    break;

            }
            this.setState({step: step});
        }
    };

    

});