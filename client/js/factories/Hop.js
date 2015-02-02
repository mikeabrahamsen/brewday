Brewday.factory('Hop', function(Restangular) {
    var Hop;
    Hop = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('hops');
        },
        getAll: function() {
            return Restangular.one('hops').getList();
        },
    };
    return Hop;
})
