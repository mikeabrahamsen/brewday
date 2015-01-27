Brewday.controller('RecipeCreateCtrl',  ['$scope', '$location', '$window', 'Recipe',
    function($scope, $location, $window, Recipe){
        $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
        $scope.data = {};
        $scope.addNewGrain= function() {
            var newItemNo = $scope.grains.length+1;
            $scope.grains.push({'id':'grain'+newItemNo});
        };
        $scope.submit_recipe = function submit_recipe(name,beertype){
            var recipe = {};
            recipe.name= name;
            recipe.beer_type = beertype;
            Recipe.create(recipe);
            $location.path('/');
        }
    }
])
