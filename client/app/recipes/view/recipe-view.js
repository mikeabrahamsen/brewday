angular.module('recipes.view',[
])
.controller('RecipeViewCtrl',  ['$state', 'recipe', 'grains', 'hops', 'EquipmentProfile',
        function($state, recipe, grains, hops, EquipmentProfile){
            var recipeView = this;
            this.recipe = recipe;
            this.grains = grains;
            this.hops = hops;
            this.additions = {grains: this.grains, hops: this.hops};

            this.tabs = [
              { title:'Overview', template: 'app/recipes/view/view-overview.html'},
              { title:'Grains', template: 'app/recipes/view/view-grains.html'},
              { title:'Hops', template: 'app/recipes/view/view-hops.html'}
            ];

            this.readOnly = true;

            this.delete = function(){
                recipeView.recipe.remove();
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
            controllerAs: 'vm',
            resolve: {
                recipe: ['$stateParams', 'Recipe',
                function($stateParams, recipe){
                    return recipe.getOne($stateParams.recipe_id);
                }],
                hops: ['$stateParams', 'Hop',
                function($stateParams, hop){
                    return hop.get($stateParams.recipe_id);
                }],
                grains: ['$stateParams', 'Grain',
                function($stateParams, grain){
                    return grain.get($stateParams.recipe_id);
                }],
            }
        });
});
