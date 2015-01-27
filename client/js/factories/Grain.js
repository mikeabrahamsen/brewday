Brewday.factory('Grain', function(Restangular) {
    var Grain;
    Grain = {
        get: function() {
            return Restangular
                .one('recipes')
                .getList();
        },
        add: function(data) {
            var recipe = Restangular.one('recipes',data.id).one('additions');
            return recipe.post("grains",data);
        }
    };
    return Grain;
})
