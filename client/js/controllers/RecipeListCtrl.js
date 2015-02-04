Brewday.controller('RecipeListCtrl',  ['$scope', '$location', '$window','recipes',
        function($scope, $location, $window, recipes){
            $scope.recipes = recipes;
        }
]);
