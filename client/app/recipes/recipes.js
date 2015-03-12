angular.module('recipes',[
        'brewday.models.recipe',
        'brewday.models.grain',
        'brewday.models.hop',
        'recipes.additions',
        'recipes.view',
        'recipes.edit',
        'recipes.create',
        'recipes.calculator',
        'recipes.equipment',
        'settings.equipment',
        'recipes.details',
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
        template: '<div ui-view></div>',
        data:{
            authRequired: true,
        }
    })
    .state('recipes.list',{
        url: '',
        controller: 'RecipeListCtrl',
        controllerAs: 'recipes',
        templateUrl: 'app/recipes/list.html',
        resolve: {
            recipes: ['Recipe',
            function(recipes){
                return recipes.get();
            }],
        },
    });
});
