define([
    'load!stores/appStore',
    'lodash',
    'moment'
], function(
    appStore,
    _,
    moment
) {
    
    var customerInfo = {
        name            : '',
        email           : '',
        phone           : '',
        way_to_contact  : 'phone',
        notes           : '',
        preferred_time  : moment().add(1, 'd').minutes(0).hour(13).format('YYYY-MM-DD HH:mm'),
        vehicle: {
            year    : '',
            make    : '',
            model   : '',
            trim    : ''
        }
    };

    var observer = {
        update: function(pageComponent) {
            switch (pageComponent.constructor.displayName) {
                case 'email_form':
                    customerInfo.email = pageComponent.refs.email.value;
                    break;
                case 'order':
                case 'quote_form':
                    customerInfo = _.merge(customerInfo, pageComponent.state.values);
                    break;
            }
        }
    };

    appStore.addObserver(observer);

    return {
        getCustomerInfo: function () {
            return _.cloneDeep(customerInfo);
        }
    };
});