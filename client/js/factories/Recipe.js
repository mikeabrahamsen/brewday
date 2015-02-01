Brewday.factory('Recipe', function(Restangular) {
    var Recipe;
    Recipe = {
        get: function() {
            return Restangular
                .one('recipes')
                .getList();
        },
        create: function(data) {
            return Restangular
                .one('recipes')
                .customPOST(data);
        },
        update: function(data) {
            recipe = Restangular.one('recipes', data.id)
            recipe.name = data.name;
            recipe.beer_type = data.beer_type;
            return recipe.put();
        },
        getOne: function(data) {
            return Restangular.one('recipes',data).get();
        },
    };
    return Recipe;
})
