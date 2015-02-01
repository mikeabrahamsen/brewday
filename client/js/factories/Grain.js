Brewday.factory('Grain', function(Restangular) {
    var Grain;
    Grain = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('grains');
        },
        create: function(data) {
            var recipe = Restangular.one('recipes',data.recipe_id);
            return recipe.post("additions",data);
        },
        remove: function(data) {
            var recipe_addition = Restangular.one('recipes', data.recipe_id).one('additions', data.addition_id);
            recipe_addition.remove();
        },
        update: function(data) {
            if (typeof data.addition_id === 'undefined')
                Grain.create(data);

            else{
                var recipe_addition = Restangular.one('recipes', data.recipe_id).one('additions', data.addition_id);

                recipe_addition.addition_id = data.addition_id;
                recipe_addition.recipe_id = data.recipe_id;
                recipe_addition.brew_stage = data.brew_stage;
                recipe_addition.time = data.time;
                recipe_addition.name = data.name;
                recipe_addition.amount = data.amount;
                recipe_addition.addition_type = 'grain';
                return recipe_addition.put();
            }
        },
        getAll: function() {
            return Restangular.one('grains').getList();
        },
    };
    return Grain;
})
