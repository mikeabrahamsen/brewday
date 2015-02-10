Brewday.factory('Addition', function(Restangular) {
    var Addition;
    Addition = {
        get: function(recipe_id) {
            return Restangular.one('recipes',recipe_id).getList('additions');
        },
        create: function(data) {
            var recipe = Restangular.one('recipes',data.recipe_id);
            return recipe.post("additions",data);
        },
    };
    return Addition;
})
