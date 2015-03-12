angular.module('recipes.create',[
])
.controller('RecipeCreateCtrl',  ['$state', 'Recipe', 'Grain', 'Hop',
        function($state, Recipe, Grain, Hop){

        var createCtrl = this;
        this.additions = {grains: [], hops: []};
        this.toDelete = [];
        this.recipe = {};

        this.createRecipe = function(recipe) {
          Recipe.create(recipe).then(function(data){
            createCtrl.recipe = data;

            createCtrl.additions.grains.forEach(function(grain){
              grain.recipe_id = createCtrl.recipe.id;
              Grain.add(grain);
            });
            createCtrl.additions.hops.forEach(function(hop){
              hop.recipe_id = createCtrl.recipe.id;
              Hop.add(hop);
            });
            $state.go('recipes.view', {recipe_id: createCtrl.recipe.id});
          });
        };
        this.submit_recipe =
          function submit_recipe(name,beertype,grains,hops, equipment_id){
          createCtrl.recipe.name = name;
          createCtrl.recipe.beer_type = beertype;
          createCtrl.recipe.equipment_id = equipment_id;

          createCtrl.createRecipe(createCtrl.recipe);
        };
        }
])
.config(function($stateProvider){
    $stateProvider
        .state('create',{
            url: '/create',
            controllerAs: 'recipes',
            controller: 'RecipeCreateCtrl',
            templateUrl: 'app/recipes/create/create.html',
        });
});
