define([
    'dispatcher',
    'ajax'
], function(
    dispatcher,
    ajax
) {

    ajax.beforeSend = function() {
        dispatcher.dispatch({
            actionType: 'ajax.beforeSend'
        });
    };
    ajax.complete = function() {
        dispatcher.dispatch({
            actionType: 'ajax.complete'
        });
    };
    ajax.error = function(error) {
        dispatcher.dispatch({
            actionType: 'ajax.error',
            error: error
        });
    };


    function prepareVehicleResponse(response) {
        var newOptions = [];
        response.data.values.map(function(val, i){
            newOptions.push({
                'value': val,
                'description': val
            });
        });
        return newOptions;
    };


    Api = {
        getLocations: function() {
            return ajax.make({
                url: 'location/list'
            });
        },

        getTireParameters: function() {
            return ajax.make({
                url: 'tire/parameters'
            });
        },

        searchTires: function(type, searchParams) {
            var method;
            switch (type){
                case 'size':
                    method = 'searchBySize';
                    break;
                case 'vehicle':
                    method = 'searchByCarTire';
                    break;
                case 'part_number':
                    method = 'searchByPartNumbers';
                    if (!searchParams.part_numbers && searchParams.part_number) {
                        searchParams.part_numbers = [searchParams.part_number];
                        delete searchParams.part_number;
                    }
                    break;
            }
            return ajax.make({
                url: 'tire/' + method,
                data: searchParams,
                method: 'post'
            }).then(function(response) {
                return response.data;
            });
        },

        getVehicleYears: function() {
            return ajax.make({
                url: 'vehicle/years'
            }).then(function(response) {
                return prepareVehicleResponse(response);
            });
        },
        getVehicleMakes: function(year) {
            var p;
            if (!year) {
                p = Promise.resolve([]);
            } else {
                p = ajax.make({
                    url: 'vehicle/makes',
                    data: {year: year}
                }).then(function(response) {
                    return prepareVehicleResponse(response);
                });
            }
            return p;
        },
        getVehicleModels: function(year, make) {
            var p;
            if (!make) {
                p = Promise.resolve([]);
            } else {
                p = ajax.make({
                    url: 'vehicle/models',
                    data: {year: year, make: make}
                }).then(function(response) {
                    return prepareVehicleResponse(response);
                });
            }
            return p;
        },
        getVehicleTrims: function(year, make, model) {
            var p;
            if (!model) {
                p = Promise.resolve([]);
            } else {
                p = ajax.make({
                    url: 'vehicle/trims',
                    data: {year: year, make: make, model: model}
                }).then(function(response) {
                    return prepareVehicleResponse(response);
                });
            }
            return p;
        },
        getVehicleTireSizes: function(year, make, model, trim) {
            var p;
            if (!trim) {
                p = Promise.resolve([]);
            } else {
                p = ajax.make({
                    url: 'vehicle/tireSizes',
                    data: {year: year, make: make, model: model, trim: trim}
                }).then(function(response) {
                    var options = [];
                    response.data.values.map(function(option) {
                        options.push({
                            value: option.cartireid,
                            description: option.fitment + ' ' + option.size_description
                        });
                    });
                    return options;
                });
            }
            return p;
        },

        getDealerConfig: function() {
            var p = ajax.make({
                url: 'dealer/config',
                data: {wdg:true}
            }).then(function(response) {
                return response.data;
            });

            return p;
        },

        getQuoteDisplay: function(data) {
            var p = ajax.make({
                url: 'quote/display',
                method: 'post',
                data: data
            }).then(function(response) {
                return response.data;
            });

            return p;
        },

        sendAppointment: function(data) {
            var p = ajax.make({
                url: 'quote/appointment',
                method: 'post',
                data: data
            }).then(function(response) {
                return response;
            });

            return p;
        },
        quotePrint: function(data) {
            var p = ajax.make({
                url: 'quote/print',
                method: 'post',
                data: data
            }).then(function(response) {
                return response;
            });

            return p;
        },
        quoteEmail: function(data) {
            var p = ajax.make({
                url: 'quote/email',
                method: 'post',
                data: data
            }).then(function(response) {
                return response;
            });

            return p;
        },
        quoteRequest: function(data) {
            var p = ajax.make({
                url: 'quote/request',
                method: 'post',
                data: data
            }).then(function(response) {
                return response;
            });

            return p;
        },


        orderCreate: function(data) {
            var p = ajax.make({
                url: 'order',
                method: 'post',
                data: data
            }).then(function(response) {
                return response.data;
            });

            return p;
        },
        orderCheckout: function(orderId, data) {
            var p = ajax.make({
                url: 'order/' + orderId + '/checkout',
                method: 'post',
                data: data
            }).then(function(response) {
                return response.data;
            });

            return p;
        },
        orderPayment: function(orderId, token) {
            var p = ajax.make({
                url: 'order/' + orderId + '/payment',
                method: 'post',
                data: {token: token}
            }).then(function(response) {
                return response;
            });

            return p;
        }


                            

    };

    return Api;

});