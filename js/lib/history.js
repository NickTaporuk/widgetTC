define([
    'microEvent'
], function(
    microEvent
) {

    // change/replace url
    // return state after back/forward. trigger event popstate.

// on popstate event:
    // if browser support history API we can use this one    //have to return state from history
    // if hashchange exists and url can be change we can use //have to return state form url params
    // if no url need and no history API                     //have to return state form local history variable

    function hist(params) {
        var currentPos = 0;
        var list = [];

        this.pushState = function(state, title, url) {
            list.splice(currentPos, list.length-currentPos, {
                state: state,
                title: title,
                url: url
            });

            currentPos = list.length;

            changeUrl();
        };

        this.replaceState = function(state, title, url) {
            list[currentPos] = {
                state: state,
                title: title,
                url: url
            };

            replaceUrl();
        };

        this.back = function() {
            if (currentPos == 0) {
                window.history.back()
            } else {
                currentPos--;
                this.trigger('popstate', list[currentPos]);
            }
        };

        this.forward = function() {
            if (list.length == currentPos ) {
                window.history.forward();
            } else {
                currentPos++;
                this.trigger('popstate', list[currentPos]);
            }
        };

        var changeUrl = function() {
            var current = list[currentPos];

            window.location.hash = current.url;
        };

        var replaceUrl = function() {
            var current = list[currentPos];

            location.replace(current.url);
        };

        window.addEventListener('popstate', function(e) {
            //check if it prev/next base on list var
            // call
            // this.back();
            // or
            // this.forward();
            // 
            //if list is empty but state exist?
            

            //var page = e.state && e.state.page ? e.state.page : null;
            //var params = e.state && e.state.params ? e.state.params : {};
            // if (!page && config.allowUrl) {
            //     var urlData = h.queryToObj(window.location.hash);
            //     page = urlData.page;                
            //     params = urlData.params;
            // }
            //execute(page, params, true);
            //currentPage = page;
        }, false);
    }

    microEvent.mixin(hist);

    return new hist();
});