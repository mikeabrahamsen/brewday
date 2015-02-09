Brewday.controller('RecipeViewCtrl',  ['$scope', 'recipe', 'grains', 'hops',
        function($scope, recipe, grains, hops){
            this.recipe = recipe;
            this.grains = grains;
            this.hops = hops;
            this.readOnly = true;
        }
]);
