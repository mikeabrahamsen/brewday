Brewday.controller('RecipeListCtrl',  ['$scope', 'recipes',
        function($scope, recipes){
            $scope.recipes = recipes;
        }
]);
