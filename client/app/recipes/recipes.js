angular.module('recipes',[
        'brewday.models.recipe',
        'brewday.models.grain',
        'brewday.models.hop',
        'recipes.additions',
        'recipes.view',
        'recipes.edit',
        'recipes.create',
        'recipes.calculator'
])
.controller('RecipeListCtrl',  ['recipes',
        function(recipes){
            this.recipes = recipes;
        }
])
.config(function($stateProvider){
    $stateProvider
    .state('recipes',{
        abstract: true,
        url: '/recipes',
        controller: 'RecipeListCtrl',
        template: '<div ui-view></div>',
        resolve: {
            recipes: ['Recipe',
            function(recipes){
                return recipes.get();
            }],
        },
        data:{
            authRequired: true,
        }
    })
    .state('recipes.list',{
        url: '',
        controller: 'RecipeListCtrl',
        controllerAs: 'recipes',
        templateUrl: 'app/recipes/list.html',
    });
});
