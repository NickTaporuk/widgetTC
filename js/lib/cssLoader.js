define([], function() {
    function loadStyleSheet(path, fn) {
        var head = document.getElementsByTagName('head')[0], // reference to document.head for appending/ removing link nodes
            link = document.createElement('link');           // create the link node
        link.setAttribute('href', path);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        var sheet, cssRules;
        // get the correct properties to check for depending on the browser
        if ('sheet' in link) {
            sheet = 'sheet';
            cssRules = 'cssRules';
        } else {
            sheet = 'styleSheet';
            cssRules = 'rules';
        }

        var interval_id = setInterval(function () {                    // start checking whether the style sheet has successfully loaded
                try {
                    if (link[sheet] && link[sheet][cssRules].length) { // SUCCESS! our style sheet has loaded
                        clearInterval(interval_id);                     // clear the counters
                        clearTimeout(timeout_id);
                        fn();           // fire the callback with success == true
                    }
                } catch (e) {
                } finally {
                }
            }, 10),                                                   // how often to check if the stylesheet is loaded

            timeout_id = setTimeout(function () {       // start counting down till fail
                clearInterval(interval_id);            // clear the counters
                clearTimeout(timeout_id);
                head.removeChild(link);                // since the style sheet didn't load, remove the link node from the DOM
                fn(); // fire the callback with success == false
            }, 15000);                                 // how long to wait before failing

        head.appendChild(link);  // insert the link node into the DOM and start loading the style sheet

        return link; // return the link node;
    }

    return {
        load: function(name, req, onload, _config) {
            if (_config.isBuild || name == 'load') {
                // used by optimizer:
                onload();
            } else {
                loadStyleSheet(name, onload);
            }
        }
    };
});

 /*
(function() {
    var doc = win.document,
        docBody = doc.body,
        createLink = function(src) {
            var link = doc.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = src;
            return link;
        },
        resolveClassName = function(moduleName) {
            var parts = moduleName.split('/');
            return parts[parts.length - 1].replace('.', '-') + '-loaded';
        };

    define({
        load: function (name, req, load) {
            var head = doc.getElementsByTagName('head')[0],
                test,
                interval,
                link;

            test = doc.createElement('div');
            test.className = resolveClassName(name);
            test.style.cssText = 'position: absolute;left:-9999px;top:-9999px;';
            docBody.appendChild(test);

            if (test.offsetHeight > 0) {
                docBody.removeChild(test);
                load();
            } else {
                link = createLink(name),
                    head.appendChild(link);

                interval = win.setInterval(function () {
                    if (test.offsetHeight > 0) {
                        clearInterval(interval);
                        docBody.removeChild(test);
                        load(link);
                    }
                }, 50);
            }
        }
    });
})();
*/