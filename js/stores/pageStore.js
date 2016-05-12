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
            return props[_page] ? props[_page] : null;
        },

        getProp: function(prop, _page) {
            _page =  _page || page;
            return props[_page] && props[_page] ? props[_page][prop] : null;
        },

        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'page.update':
                    page = payload.page;
                    props[payload.page] = payload.props;
                    break;
            }
            store.trigger('change');
        })
    };

    return store;

});