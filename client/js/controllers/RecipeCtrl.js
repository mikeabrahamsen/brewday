Brewday.controller('RecipeCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain',
    function($scope, $location, $window, $routeParams, Recipe, Grain){
        $scope.recipe = {};
        $scope.grains = {};
        $scope.data = {};
        if ($routeParams.recipe_id)
        {
            factory_method = 'Update';
            var recipe_id = $routeParams.recipe_id;
            $scope.recipe = Recipe.getOne(recipe_id).$object;
            $scope.grains = Grain.get(recipe_id).$object;
        }
        else
        {
            factory_method = 'Create';
            $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
        }
        $scope.grain_options = Grain.getAll().$object;

        $scope.addNewGrain= function() {
            var newItemNo = $scope.grains.length+1;
            $scope.grains.push({'id':'grain'+newItemNo});
        };

        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains){
            var recipe = {};
            var id = 0;
            recipe.name= name;
            recipe.beer_type = beertype;
            Recipe.create(recipe).then(function(data){
                id = data.id;
                console.log(id);
                grains.forEach(function(grain){
                    if (grain.name && grain.amount)
                    {
                        g = {}
                        console.log(grain);
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.brew_stage = 0;
                        g.time = 1;
                        Grain.add(g).then(function(data){
                            console.log(data);
                        });

                    }
                });
            $location.path('/recipes/'+ id + '/edit');
            });
        }
    }
])
