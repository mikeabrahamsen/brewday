Brewday.factory('Grain', function(Restangular) {
    var Grain;
    Grain = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('grains');
        },
        getAll: function() {
            return Restangular.one('grains').getList();
        },
    };
    return Grain;
})
