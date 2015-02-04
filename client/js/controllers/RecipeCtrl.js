Brewday.controller('RecipeCtrl',  ['$scope', '$state', '$window', '$stateParams', 'Recipe', 'Grain', 'Hop', 'Addition', 'recipe','grains', 'hops',
    function($scope, $state, $window, $stateParams, Recipe, Grain, Hop, Addition, recipe, grains, hops){
        $scope.recipe = recipe;
        $scope.data = {};
        $scope.readOnly = false;
        $scope.grains = grains;
        $scope.hops = hops;
        if(grains.length < 1)
            $scope.grains = [{id: 'grain1'}];
        if(hops.length < 1)
            $scope.hops = [{id: 'hop1'}];
        $scope.grainBill = 0;
        $scope.totalVol = 0;
        $scope.mashVol = 0;
        $scope.spargeVol = 0;

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
            recipe = $scope.recipe;
            recipe.name = name;
            recipe.beer_type = beertype;
            Recipe.update(recipe).then(function(data){
                var id = data.id;
                toDelete.forEach(function(addition){
                    Addition.remove(addition);
                });
                grains.forEach(function(grain){
                    if (grain.name && grain.amount)
                    {
                        var g = {};
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
                        g.addition_type = 'grain';
                        g.brew_stage = 0;
                        g.time = 1;

                        Addition.update(g);
                    }
                });
                hops.forEach(function(hop){
                    if (hop.name && hop.amount)
                    {
                        var h = {};
                        h.name = hop.name;
                        h.amount = hop.amount;
                        h.recipe_id = id;
                        h.addition_id = hop.addition_id;
                        h.addition_type = 'hop';
                        h.brew_stage = 0;
                        h.time = hop.time;
                        Addition.update(h);
                    }
                });
                $state.go('recipes.view', {recipe_id: recipe.id})
            });
        };

    }
]);
