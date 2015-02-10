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
            }
        }
]);
