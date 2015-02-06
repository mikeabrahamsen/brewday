Brewday.controller('RecipeViewCtrl',  ['$scope', 'WaterService', 'recipe', 'grains', 'hops',
        function($scope, WaterService, recipe, grains, hops){
            this.waterService = WaterService

            this.recipe = recipe;
            this.grains = grains;
            this.hops = hops;
            this.readOnly = true;

            this.grainBill = function(grains){
                return this.waterService.getGrainBill(grains);
            }

        }
]);
