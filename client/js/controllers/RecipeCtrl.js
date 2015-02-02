Brewday.controller('RecipeCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain', 'Hop', 'Addition',
    function($scope, $location, $window, $routeParams, Recipe, Grain, Hop, Addition){
        $scope.recipe = {};
        $scope.grains = {};
        $scope.hops = {};
        $scope.data = {};
        factory_method = '';
        var toDelete = []
        var original_grains = []
        var original_hops = []
        if ($routeParams.recipe_id)
        {
            factory_method = 'update';
            var recipe_id = $routeParams.recipe_id;
            $scope.recipe = Recipe.getOne(recipe_id).$object;
            Grain.get(recipe_id).then(function(grains){
                if(grains.length < 1)
                    $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
                else
                    $scope.grains = grains
                // copy the array to so we can do a comparison later
                original_grains = grains.slice(0);
            });
            Hop.get(recipe_id).then(function(hops){
                if(hops.length < 1)
                    $scope.hops = [{id: 'hop1'},{id: 'hop2'}];
                else
                    $scope.hops = hops
                // copy the array to so we can do a comparison later
                original_hops = hops.slice(0);
            });

        }
        else
        {
            factory_method = 'create';
            $scope.hops = [{id: 'hop1'},{id: 'hop2'}];
            $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
        }

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
            Recipe[factory_method](recipe).then(function(data){
                id = data.id;
                toDelete.forEach(function(addition){
                    Addition.remove(addition);
                });
                grains.forEach(function(grain,i){
                    if (grain.name && grain.amount)
                    {
                        console.log(grain);
                        g = {}
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
                        g.addition_type = 'grain';
                        g.brew_stage = 0;
                        g.time = 1;

                        Addition[factory_method](g);
                    }
                });
                hops.forEach(function(hop,i){
                    if (hop.name && hop.amount)
                    {
                        h = {}
                        h.name = hop.name;
                        h.amount = hop.amount;
                        h.recipe_id = id;
                        h.addition_id = hop.addition_id;
                        h.addition_type = 'hop';
                        h.brew_stage = 0;
                        h.time = 1;
                        Addition[factory_method](h);
                    }
                });
            $location.path('/recipes/'+ id + '/edit');
            });
        }
    }
])
