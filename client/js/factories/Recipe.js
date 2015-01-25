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
        }
    };
    return Recipe;
})
