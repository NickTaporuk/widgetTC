(function(root, factory) {

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = factory();
        }
    } else if (typeof define === 'function' && define.amd) {
        define('TCWidget', [], function() {
            return factory();
        });
    } else {
        root.TCWidget = factory();
    }

}(this, function() {