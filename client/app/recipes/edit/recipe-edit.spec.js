describe("Recipe Edit", function() {
  var element;
  var $scope;
  var $httpBackend;
  var controller;
  var AdditionService;
  var $state;

  beforeEach(module("recipes.additions"));
  beforeEach(module("ui.router"));
  beforeEach(module("recipes"));
  beforeEach(module("brewday.models.recipe"));
  beforeEach(module("brewday.templates"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, _$state_, _AdditionService_, Recipe) {
    $httpBackend = _$httpBackend_;
    AdditionService = _AdditionService_;
    $httpBackend.expect('GET', '/recipes/1').respond('{"id": 1, "name": "TestRecipe"}');
    var recipe = Recipe.getOne(1).$object;
    var grains = [];
    var hops = [];
    $state = _$state_;
    $scope = $rootScope;
    $httpBackend.flush();
    controller = $controller("RecipeCtrl", {$state: $state, recipe: recipe, grains: grains, hops: hops});

  }));
  describe('Recipe Edit Controller', function() {
    it('should have a recipe', function() {
      expect(controller.recipe).toBeDefined();
      expect(controller.recipe.id).toBe(1);
    });
    it('should have grains defined', function() {
      expect(controller.grains).toBeDefined();
      expect(controller.grains.length).toBe(0);
    });
  });
});
