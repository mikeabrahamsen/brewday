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
        remove: function(data) {
            var recipe_addition = Restangular.one('recipes', data.recipe_id).one('additions', data.addition_id);
            recipe_addition.remove();
        },
        update: function(data) {
            if (typeof data.addition_id === 'undefined')
                Addition.create(data);

            else{
                var recipe_addition = Restangular.one('recipes', data.recipe_id).one('additions', data.addition_id);

                recipe_addition.addition_id = data.addition_id;
                recipe_addition.recipe_id = data.recipe_id;
                recipe_addition.brew_stage = data.brew_stage;
                recipe_addition.time = data.time;
                recipe_addition.name = data.name;
                recipe_addition.amount = data.amount;
                recipe_addition.addition_type = data.addition_type;
                return recipe_addition.put();
            }
        },
    };
    return Addition;
})
