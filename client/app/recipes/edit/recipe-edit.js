angular.module('recipes.edit',[
])
.controller('RecipeCtrl',  ['$state', 'Recipe', 'Grain', 'Hop', 'recipe','grains', 'hops',
    function($state, Recipe, Grain, Hop, recipe, grains, hops){
        this.recipe = recipe;
        this.data = {};
        this.readOnly = false;
        this.grains = grains;
        this.hops = hops;
        this.toDelete = [];

        this.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
                recipe.put()

                this.toDelete.forEach(function(addition){
                    addition.remove();
                })

                grains.forEach(function(grain){
                    grain.brew_stage = 0;
                    grain.time = 1;
                    grain.recipe_id = recipe.id;
                    if (typeof(grain.put) == 'function' )
                        grain.put();
                    else
                        Grain.add(grain);

                });
                hops.forEach(function(hop){
                    hop.recipe_id = recipe.id;
                    hop.brew_stage = 0;

                    // check if it is a restangular object
                    if (typeof(hop.put) == 'function' )
                        hop.put();
                    else
                        Hop.add(hop);
                });
                $state.go('recipes.view', {recipe_id: this.recipe.id})
            }
    }
]);
