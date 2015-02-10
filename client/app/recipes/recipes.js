angular.module('recipes',[
        'brewday.models.recipe',
        'brewday.models.grain',
        'brewday.models.hop',
        'recipes.grains',
        'recipes.hops',
        'recipes.view',
        'recipes.edit',
        'recipes.create',
        'recipes.calculator'
])
.controller('RecipeListCtrl',  ['$scope', 'recipes',
        function($scope, recipes){
            $scope.recipes = recipes;
        }
]);
