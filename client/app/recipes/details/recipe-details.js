angular.module('recipes.details',[

])
.controller(
  'RecipeDetailCtrl',['CalculatorService',
    function(Calculator){
      var detailCtrl = this;
      this.recipe.details = Calculator.details;
    }
  ])
.directive('recipeDetails', function(){
  return {
    restrict: "E",
    bindToController: true,
    scope: {
      recipe: '='
    },
    controller: 'RecipeDetailCtrl',
    controllerAs: 'detailCtrl',
    templateUrl: 'app/recipes/details/recipe-details-tmpl.html'
  };
});
