angular.module('recipes.view',[
])
.controller('RecipeViewCtrl',  ['$state', 'recipe', 'grains', 'hops',
        function($state, recipe, grains, hops){
            this.recipe = recipe;
            this.grains = grains;
            this.hops = hops;
            this.readOnly = true;

            this.delete = function(recipe){
                recipe.remove();
                $state.go('recipes.list',{}, {reload: true});
            };
        }
])
.config(function($stateProvider){
    $stateProvider
        .state('recipes.view',{
            url: '/:recipe_id',
            templateUrl: 'app/recipes/view/view.html',
            controller: 'RecipeViewCtrl',
            controllerAs: 'recipes',
            resolve: {
                recipe: ['$stateParams', 'Recipe',
                function($stateParams, recipe){
                    return recipe.getOne($stateParams.recipe_id);
                }],
                hops: ['$stateParams', 'Additions',
                function($stateParams, additions){
                    return additions.get($stateParams.recipe_id);
                }],
            }
        });
});
