Brewday.controller('RecipeCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain',
    function($scope, $location, $window, $routeParams, Recipe, Grain){
        $scope.recipe = {};
        $scope.grains = {};
        $scope.data = {};
        factory_method = '';
        var toDelete = []
        var original_grains = []
        if ($routeParams.recipe_id)
        {
            factory_method = 'update';
            var recipe_id = $routeParams.recipe_id;
            $scope.recipe = Recipe.getOne(recipe_id).$object;
            Grain.get(recipe_id).then(function(grains){
                $scope.grains = grains
                // copy the array to so we can do a comparison later
                original_grains = grains.slice(0);
            });
        }
        else
        {
            factory_method = 'create';
            $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
        }
        $scope.grain_options = Grain.getAll().$object;

        $scope.addNewGrain= function() {
            var newItemNo = $scope.grains.length+1;
            $scope.grains.push({'id':'grain'+newItemNo});
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

        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains){
            recipe = $scope.recipe;
            recipe.name = name;
            recipe.beer_type = beertype;
            Recipe[factory_method](recipe).then(function(data){
                id = data.id;
                toDelete.forEach(function(grain){
                    Grain.remove(grain);
                });
                grains.forEach(function(grain,i){
                    if (grain.name && grain.amount)
                    {
                        g = {}
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
                        g.addition_type = 'grain';
                        g.brew_stage = 0;
                        g.time = 1;

                        Grain[factory_method](g);
                    }
                });
            $location.path('/recipes/'+ id + '/edit');
            });
        }
    }
])
