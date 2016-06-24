define(['ajax', 'lib/helper'], function(ajax, h) {

    function loadStyleSheet(path, fn) {
        ajax.make({
            url: path,
            method: 'get',
            beforeSend: function() {},
            complete: function() {}
        }).then(function(response) {
            var styleElement = document.createElement("style");
            var styles = document.createTextNode(response);
            styleElement.appendChild(styles);
            document.head.appendChild(styleElement);
            fn();
        });
    }

    return {
        load: function(name, req, onload, _config) {
            if (_config.isBuild || name == 'load') {
                // used by optimizer:
                onload();
            } else {
                loadStyleSheet(name, function() {
                    
                    onload();
                });
            }
        }
    };
});