define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {

    var ecommerce = {
        stripe: {
            key: null
        }
    }

    var store = {
        getStripeKey: function(id) {
            return ecommerce.stripe.key;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'dealer.config.set':
                    var c = payload.config;
                    if (c.ecommerce.enabled && c.ecommerce.services && c.ecommerce.services.stripe) {
                        ecommerce.stripe.key = c.ecommerce.services.stripe.publishable_key;
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