define([
    'dispatcher',
    'ajax',
    'lodash',
    'load!stores/searchSearch'
], function(
    dispatcher,
    ajax,
    _,
    searchStore
) {

    var resultsStore = {


        dispatcherToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'results.list.update':
                    // if (!self.isSearchAvailable()) {
                    //     return;
                    // }

                    var method;
                    var activeSection = searchStore.getActiveSection()
                    switch (activeSection) {
                        case 'size':
                            method = 'searchBySize';
                            break;
                        case 'vehicle':
                            method = 'searchByCarTire';
                            break;
                        case 'part_number':
                            method = 'searchByPartNumbers';
                            break;
                    }

                    var data = searchStore.getSectionValues(activeSection);


                    ajax.make({
                        url: 'tire/' + method,
                        data: data,
                        method: 'post',
                        success: function(response) {
                            console.log(response.data);
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
                    });

                    break;    
                case 'search.field.update':
                    
                
            }
            // resultsStore.trigger('change');
        });
    };

    return resultsStore;
});