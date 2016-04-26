define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {
    var appState = {
        page: 'search',

        search: {   // all off this is in url params
            activeTab: 'by_size',
            by_size: {
                width: '',
                height: '',
                rim: '',
                load_index: '',
                speed_rating: '',
                base_category: ''
            },

            by_vehicle: {
                year: '',
                make: '',
                model: '',
                trim: '',
                car_tire_id: '',
                base_category: ''
            },

            by_part_number: {
                part_number: ''
            },

            location_id: '',

            page_number: 1,

            order_by: 'best_mutch',
            display: 'full',

            filters: {
                brands: [],
                category: [],
                run_flat: [],
                light_truck: []
            }
        },

        quote: {   // all off this is in url params
            quantity: 4,
            with_discount: false,
            customer_discount: 0,
            optional_services: []
        },

        customer: {   // used on several pages: quotes and order
            name: '',
            phone: '',
            email: '',
            vehicle: {
                year: '',
                make: '',
                model: '',
                trim: ''
            },
            notes: '',
            preferred_time: '',
            way_to_contact: 'phone',
            follow_up: false
        }
    };


    var store = {
        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'page.update':
                    appState.page = payload.page;
                    break;

                case 'search.params.update':
                    break;

                case 'customer.params.update':
                    break;

                case 'quote.params.update':
                    break;
            }

            store.trigger('change');
        })
    }

    return store;

});