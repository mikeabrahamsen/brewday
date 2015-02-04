Brewday.controller('RecipeViewCtrl',  ['$scope', '$location', '$window','recipe', 'grains', 'hops',
        function($scope, $location, $window, recipe, grains, hops){
            $scope.recipe = recipe;
            $scope.grains = grains;
            $scope.hops = hops;
            $scope.readOnly = true;
        }
]);
