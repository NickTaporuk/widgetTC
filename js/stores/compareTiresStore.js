define([
    'load!stores/appStore',
    'lodash'
], function(
    appStore,
    _
) {

    var compareTires = [];

    var observer = {
        update: function(compareTiresIds) {
            _.merge(compareTires, compareTiresIds);
        }
    };

    appStore.addObserver(observer);

    return {
        getCompareTires: function () {
            return compareTires;
        },
        addCompareTireIds:function(tireIds) {
            compareTires = tireIds;
            console.log('addCompareTireId:',compareTires);
        }
    };
});