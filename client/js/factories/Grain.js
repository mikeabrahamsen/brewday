Brewday.factory('Grain', function(Restangular) {
    var Grain;
    Grain = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('grains');
        },
        add: function(data) {
            var recipe = Restangular.one('recipes',data.recipe_id);
            return recipe.post("grains",data);
        }
    };
    return Grain;
})
