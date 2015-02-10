angular.module('recipes.create',[
])
.controller('RecipeCreateCtrl',  ['$state', 'Recipe', 'Grain', 'Hop',
        function($state, Recipe, Grain, Hop){

        this.toDelete = []
        this.grains = [];
        this.hops = [];

        this.recipe = {};
        this.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
                var recipe = this.recipe;
                recipe.name = name;
                recipe.beer_type = beertype;

                Recipe.create(recipe).then(function(data){
                    this.recipe_id = data.id
                    var id = data.id;
                    grains.forEach(function(grain){
                        grain.brew_stage = 0;
                        grain.time = 1;
                        grain.recipe_id = id;
                        Grain.add(grain);

                    });
                    hops.forEach(function(hop){
                        hop.recipe_id = id;
                        hop.brew_stage = 0;
                        Hop.add(hop);
                    });
                $state.go('recipes.view', {recipe_id: id})
                })
            }
        }
]);
