angular.module('recipes.edit',[
])
.controller('RecipeEditCtrl',  ['$state', 'recipe', 'grains', 'hops',
    function($state, recipe, grains, hops){
        var editCtrl = this;
        this.recipe = recipe;
        this.readOnly = false;
        this.grains = grains;
        this.hops = hops;
        this.toDelete = [];
        this.additions = {grains: this.grains, hops: this.hops};

        this.tabs = [
          { title:'Recipe Info', template: 'app/recipes/recipe-info-form-tmpl.html'},
          { title:'Grains', showGrains: true},
          { title:'Hops', showGrains: false}
        ];

        this.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
                recipe.equipment_id = recipe.equipment_profile.id;
                recipe.put();

                this.toDelete.forEach(function(addition){
                    addition.remove();
                });

                grains.forEach(function(grain){
                    grain.save();

                });
                hops.forEach(function(hop){
                    hop.save();

                });

                $state.go('recipes.view', {recipe_id: this.recipe.id});
            };
    }
])
.config(function($stateProvider){
    $stateProvider
        .state('recipes.edit',{
            url: '/:recipe_id/edit',
            controller: 'RecipeEditCtrl',
            controllerAs: 'vm',
            templateUrl: 'app/recipes/edit/edit.html',
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
                }]
            }
        });
});
