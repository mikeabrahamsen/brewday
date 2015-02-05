Brewday.factory('Grain', function(Restangular) {
    var Grain;
    Grain = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('grains');
        },
        getAll: function() {
            return Restangular.one('grains').getList();
        },
        add: function(data){
            return Restangular.one('recipes', data.recipe_id).post('grains', data);
        }
    };
    return Grain;
})
