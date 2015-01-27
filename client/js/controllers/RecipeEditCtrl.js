Brewday.controller('RecipeEditCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain',
    function($scope, $location, $window, $routeParams, Recipe, Grain){
        var recipe_id = $routeParams.recipe_id;
        $scope.recipe = {};
        $scope.grains = {};
        $scope.recipe = Recipe.getOne(recipe_id).$object;
        $scope.grains = Grain.get(recipe_id).$object;
    }
])
