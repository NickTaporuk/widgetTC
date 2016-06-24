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
            _.merge(compareTires);
        }
    };

    appStore.addObserver(observer);

    return {
        getCompareTires: function () {
            return compareTires;
        },
        addCompareTireIds:function(tireIds) {
            _.merge(compareTires,tireIds);
        },
        addCompareTireId:function(tireId) {
            console.log('tireId:',tireId);
            compareTires.push(tireId);
        },
        deleteCompareTireId:function(tireId) {
            _.remove(compareTires,function(id){
                return id == tireId;
            });
        }
    };
});