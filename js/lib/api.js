define([
    'ajax'
], function(
    ajax
) {
    var Promise = function() {
        var response = null;

        var methods = {
            success: [],
            error: []
        };

        this.resolve = function(resp) {
            response = resp;
            success();
        };

        var success = function() {
            if (response) {
                for (var i = 0; i < count; i++) {
                    if (typeof methods.success[i] == 'function') {
                        response = methods.success[i](response);    
                    }
                }
                response = null;
                methods.success = [];
            }
        }

        this.then = function(callback) {
            methods.success.push(callback);
            success();
            return this;
        }
    };

    return {
        getLocations: function() {
            var promise = new Promise();

            ajax.make({
                url: 'location/list',
                success: function(resp) {
                    promise.resolve(resp.data.locations);
                },
                error: function(resp) {
                    promise.reject(resp);
                }
            });

            return promise;
        }


    }


});