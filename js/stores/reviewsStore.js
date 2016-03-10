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
    // var branches ={};


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
                    if (reviews[payload.tireId]) {
                        reviews[payload.tireId] = _.concat(reviews[payload.tireId], payload.data.reviews);
                    } else {
                        reviews[payload.tireId] = payload.data.reviews;
                        totalCount[payload.tireId] = payload.data.nb_results;
                    }
                    change = true;
                    break;
            }
            
            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});