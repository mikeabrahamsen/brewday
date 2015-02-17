describe("Recipe View Controller", function() {
  var element;
  var $scope;
  var $state;
  var $httpBackend;
  var controller;
  beforeEach(module("brewday.templates"));
  beforeEach(module("ui.router"));
  beforeEach(module("recipes"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, _$state_, Recipe) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expect('GET','/recipes/1').respond({name: 'test-recipe'});

    $scope = $rootScope;
    $state = _$state_;
    var recipe = Recipe.getOne(1).$object;
    var grains = {};
    var hops= {};
    controller = $controller("RecipeViewCtrl",{$state: $state, recipe: recipe, grains: grains, hops: hops});
    $scope.$apply();
    $httpBackend.flush();
  }));
  afterEach (function () {
    $httpBackend.verifyNoOutstandingExpectation ();
    $httpBackend.verifyNoOutstandingRequest ();
  });
  describe('Viewing recipes', function() {
    it('should have a recipe defined', function() {
      expect(controller.recipe).toBeDefined();
      expect(controller.recipe.name).toBe('test-recipe');
    });
    it('should have hops defined', function() {
      expect(controller.hops).toBeDefined();
    });
    it('should have grains defined', function() {
      expect(controller.grains).toBeDefined();
    });
    it('should go to the recipes.list state after delete', function() {
      $httpBackend.whenDELETE('/recipes').respond('');
      $httpBackend.whenGET('/recipes').respond([{},{},{}]);

      controller.delete(controller.recipe);
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.list');
    });
  });
});
