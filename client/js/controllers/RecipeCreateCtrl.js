Brewday.controller('RecipeCreateCtrl',  ['$scope', '$state', '$window', '$stateParams', 'Recipe', 'Grain', 'Hop', 'Addition',
        function($scope, $state, $window, $stateParams, Recipe, Grain, Hop, Addition){

        $scope.grains = [{id: 'grain1'}];
        $scope.hops = [{id: 'hop1'}];
        $scope.grain_options = Grain.getAll().$object;
        $scope.hop_options = Hop.getAll().$object;
        $scope.recipe = {};
        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
                recipe = $scope.recipe;
                recipe.name = name;
                recipe.beer_type = beertype;

                Recipe.create(recipe).then(function(data){
                    $scope.recipe_id = data.id
                    var id = data.id;
                    grains.forEach(function(grain){
                        console.log(id);
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
