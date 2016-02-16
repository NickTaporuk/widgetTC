define([
], function(
) {

    // private section
    var _name = 'search';
    var _props = {};


    // public section
    var pageStore = {
        setPage: function(name, props) {
            _name = name;
            _props = props || {};
        },
        getPage: function() {
            return {
                name: _name,
                props: _props
            }
        }
    };

    return pageStore;
});