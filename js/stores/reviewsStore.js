define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {
    var reviews = {};
    var totalCount = {};


    function setCurrentLocation(id) {
        currectLocation = id;
    }

    var store = {
        getReviews: function(tireId) {
            return reviews[tireId] || [];
        },
        getTotalReviews: function(tireId) {
            return totalCount[tireId] || null;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_REVIEWS_SUCCESS:
                    if (!reviews[payload.tireId]) {
                        reviews[payload.tireId] = [];
                        totalCount[payload.tireId] = payload.data.nb_results;                        
                    }

                    var tireReviews = reviews[payload.tireId];

                    // tireReviews.splice( payload.offset, (tireReviews.length - payload.offset));
                    
                    
                    // if there are no new reviews on payload do not do anything
                    if (tireReviews.length === payload.offset) {
                        reviews[payload.tireId] = _.concat(tireReviews, payload.data.reviews);
                        change = true;
                    }

                    break;
            }
            
            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});