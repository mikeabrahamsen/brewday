Brewday.controller('RecipeCreateCtrl',  ['$scope', '$location', '$window', 'Recipe',
    function($scope, $location, $window, Recipe){
        $scope.data = {};
        $scope.submit_recipe = function submit_recipe(name,beertype){
            var recipe = {};
            recipe.name= name;
            recipe.beer_type = beertype;
            Recipe.create(recipe);
            $location.path('/');
        }
    }
])
