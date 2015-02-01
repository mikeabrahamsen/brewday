Brewday.controller('RecipeCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain',
    function($scope, $location, $window, $routeParams, Recipe, Grain){
        $scope.recipe = {};
        $scope.grains = {};
        $scope.data = {};
        factory_method = '';
        if ($routeParams.recipe_id)
        {
            factory_method = 'update';
            var recipe_id = $routeParams.recipe_id;
            $scope.recipe = Recipe.getOne(recipe_id).$object;
            $scope.grains = Grain.get(recipe_id).$object;
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

        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains){
            recipe = $scope.recipe;
            recipe.name = name;
            recipe.beer_type = beertype;
            Recipe[factory_method](recipe).then(function(data){
                id = data.id;
                grains.forEach(function(grain,i){
                    if (grain.name && grain.amount)
                    {
                        g = {}
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
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
