Brewday.controller('RecipeCreateCtrl',  ['$state', 'WaterService', 'Recipe', 'Grain', 'Hop',
        function($state, WaterService, Recipe, Grain, Hop){

        this.toDelete = []
        this.waterService = WaterService
        this.grains = [];
        this.hops = [{id: 'hop1'}];
        this.grain_options = Grain.getAll().$object;
        this.hop_options = Hop.getAll().$object;

        this.addNewHop= function() {
            var newItemNo = this.hops.length+1;
            this.hops.push({'id':'hop'+newItemNo});
        };
        this.removeHop = function(hop) {
            this.hops.splice( this.hops.indexOf(hop), 1 );
        };

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
