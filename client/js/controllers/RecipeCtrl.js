Brewday.controller('RecipeCtrl',  ['$scope', '$state', '$window', '$stateParams', 'Recipe', 'Grain', 'Hop', 'Addition', 'recipe','grains', 'hops','additions',
    function($scope, $state, $window, $stateParams, Recipe, Grain, Hop, Addition, recipe, grains, hops, additions){
        $scope.recipe = recipe;
        $scope.data = {};
        $scope.readOnly = false;
        $scope.grains = grains;
        $scope.additions = additions;
        $scope.hops = hops;

        if(grains.length < 1)
            $scope.grains = [{id: 'grain1'}];
        if(hops.length < 1)
            $scope.hops = [{id: 'hop1'}];

        var toDelete = [];
        var original_grains = grains.slice(0);
        var original_hops = hops.slice(0);

        $scope.grain_options = Grain.getAll().$object;
        $scope.hop_options = Hop.getAll().$object;

        $scope.addNewGrain= function() {
            var newItemNo = $scope.grains.length+1;
            $scope.grains.push({'id':'grain'+newItemNo});
        };
        $scope.addNewHop= function() {
            var newItemNo = $scope.hops.length+1;
            $scope.hops.push({'id':'hop'+newItemNo});
        };
        $scope.removeGrain= function(grain) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_grains.indexOf(grain) > -1)
            {
                toDelete.push(grain);
            }
            $scope.grains.splice( $scope.grains.indexOf(grain), 1 );
        };

        $scope.removeHop = function(hop) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_hops.indexOf(hop) > -1)
            {
                toDelete.push(hop);
            }
            $scope.hops.splice( $scope.hops.indexOf(hop), 1 );
        };
        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
                Recipe.update(recipe)

                toDelete.forEach(function(addition){
                    Addition.remove(addition);
                })

                grains.forEach(function(grain){
                    console.log(grain);
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
                    hop.addition_type = 'hop';
                    hop.brew_stage = 0;

                    Addition.update(hop);
                });
                $state.go('recipes.view', {recipe_id: recipe.id})
            }
    }
]);
