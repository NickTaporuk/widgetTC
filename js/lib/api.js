define([
    'ajax'
], function(
    ajax
) {

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
                    method = 'searchByRawSize';
                    if (!searchParams.size && searchParams.width) {
                        searchParams.size = searchParams.width + searchParams.height + searchParams.rim;
                        delete searchParams.width; 
                        delete searchParams.height; 
                        delete searchParams.rim;
                    }
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
        }

                            

    };

    return Api;

});