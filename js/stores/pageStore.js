define([
    'dispatcher'
], function(
    dispatcher
) {

    // private section
    var _name = 'search';
    var _props = {};


    // public section
    var pageStore = {
        getName: function() {
            return _name;
        },
        getProps: function() {
            return _props;
        }
    };

    dispatcher.register(function(payload) {
        if (payload.actionType === 'page-update') {
            _name = payload.name || 'search';
            _props = payload.props || {};

            pageStore.trigger('change');
        }
    });

    return pageStore;
});