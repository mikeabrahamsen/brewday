describe('Recipe Details', function() {
  var detailCtrl;
  var $scope;
  var $compile;
  var element;
  var calc;
  beforeEach(module('recipes.calculator'));
  beforeEach(module("brewday.templates"));
  beforeEach(module('recipes.details'));
  beforeEach(inject(function(_$rootScope_, _$compile_, CalculatorService) {
    $scope = _$rootScope_;
    $compile = _$compile_;
    calc = CalculatorService;
    $scope.data = {
      recipe: {name: 'test_recipe', details: {}}
    };
    element = angular.element('<recipe-details recipe="data.recipe"></recipe-details>');
    $compile(element)($scope);
    $scope.$apply();
    detailCtrl = element.controller('recipeDetails');
  }));
  describe('Controller', function() {
    it('should be defined', function() {
      expect(detailCtrl).toBeDefined();
    });
    it('should update values on scope', function() {
      detailCtrl.recipe.details.batchSize = 5;
      expect($scope.data.recipe.details.batchSize).toBe(5);
    });
    it('should update values on calculator service', function() {
      detailCtrl.recipe.details.batchSize = 10;
      expect(calc.details.batchSize).toBe(10);
    });
  });
});
