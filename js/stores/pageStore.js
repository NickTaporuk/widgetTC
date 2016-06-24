define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {

    var page = '',
        props = {};


    var store = {
        getPage: function () {
            return page;
        },

        getProps: function (_page) {
            _page =  _page || page;
            return props[_page] ? _.cloneDeep(props[_page]) : {};
        },

        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'page.update':
                    page = payload.page;
                    props[payload.page] = payload.props;

                    store.trigger('change');
                    break;
            }
        })
    };

    return store;

});