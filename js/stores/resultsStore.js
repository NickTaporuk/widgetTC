define([
    'dispatcher',
    'lodash',
    'load!stores/searchStore',
    'load!stores/locationsStore'
], function(
    dispatcher,
    _,
    searchStore,
    locationsStore
) {
    var tires = [];
    var tiresIndexes = []
    var totalCount;
    var filters = [];
    var page;

    function fillTires(_tires) {
        _tires.map(function(tire, i) {
            tiresIndexes[tire.id] = i; 
        });
        tires = _tires;
    }

    var resultsStore = {
        getPage: function() {
            return page;
        },
        getFilters: function() {
            return _.cloneDeep(filters);
        },
        getTotalCount: function() {
            return totalCount;
        },
        getTires: function() {
            return _.cloneDeep(tires);
        },
        getTire: function(id) {
            return _.cloneDeep(tires[tiresIndexes[id]]);
        },

        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'results.fill':
                    fillTires(payload.tires);
                    totalCount = payload.totalCount;
                    filters = payload.filters;
                    page = payload.page;                
                    
                    /*
                    ajax.make({
                        url: 'tire/' + method,
                        data: data,
                        method: 'post',
                        success: function(response) {
                            setTires(response.data);
                            
                            resultsStore.trigger('change');

                            // console.log(response.data);
                            // searchWasMade = true;
                            // if (response.data.filters.brand) {
                            //     //add count tires to brand items:
                            //     var foundBrands = response.data.filters.brand.parameters;
                            //     var countTiresByBrands = {};
                            //     var foundBrandsLength = foundBrands.length;
                            //     for (var n = 0; n < foundBrandsLength; n++) {
                            //         countTiresByBrands[foundBrands[n].value] = foundBrands[n].count;
                            //     }

                            //     var brandItems = self.getFieldItems('brand');
                            //     var brandItemsLength = brandItems.length;
                            //     for (var n = 0; n < brandItemsLength; n++) {
                            //         var brandName = brandItems[n]['value'];
                            //         if ( countTiresByBrands[brandName] ) {
                            //             brandItems[n].description = brandName + ' ('+countTiresByBrands[brandName]+')';
                            //         }
                            //     }
                            //     self.setFieldsItems({'brand': brandItems});
                            // }
                            // if (typeof callback == 'function') {
                            //     callback(response);
                            // }
                        }
                    }); */

                    break;    
                // case 'search.field.update':
                    
                
            }
            resultsStore.trigger('change');
        })
    };

    return resultsStore;
});