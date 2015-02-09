Brewday.controller('RecipeCtrl',  ['$state', 'Recipe', 'Grain', 'Hop', 'Addition', 'recipe','grains', 'hops','additions',
    function($state, Recipe, Grain, Hop, Addition, recipe, grains, hops, additions){
        this.recipe = recipe;
        this.data = {};
        this.readOnly = false;
        this.grains = grains;
        this.additions = additions;
        this.hops = hops;

        this.toDelete = [];

        if(hops.length < 1)
            this.hops = [{id: 'hop1'}];

        var original_hops = hops.slice(0);

        this.hop_options = Hop.getAll().$object;

        this.addNewHop= function() {
            var newItemNo = this.hops.length+1;
            this.hops.push({'id':'hop'+newItemNo});
        };

        this.removeHop = function(hop) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_hops.indexOf(hop) > -1)
            {
                this.toDelete.push(hop);
            }
            this.hops.splice( this.hops.indexOf(hop), 1 );
        };
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
                    {
                        hop.put();
                    }
                    else
                    {
                        Hop.add(hop);
                    }
                });
                $state.go('recipes.view', {recipe_id: this.recipe.id})
            }
    }
]);
