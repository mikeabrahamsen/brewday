describe("Recipe Create", function() {
  var element;
  var $scope;
  var $httpBackend;
  var controller;
  var $state;

  beforeEach(module("recipes.additions"));
  beforeEach(module("ui.router"));
  beforeEach(module("recipes"));
  beforeEach(module("brewday.models.grain"));
  beforeEach(module("brewday.models.hop"));
  beforeEach(module("brewday.models.recipe"));
  beforeEach(module("brewday.templates"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, _$state_, Recipe, Grain, Hop) {
    $httpBackend = _$httpBackend_;
    $state = _$state_;
    $scope = $rootScope;
    controller = $controller("RecipeCreateCtrl", {$state: $state, Recipe: Recipe, Grain: Grain, Hop: Hop});

    $httpBackend.expect('POST', '/recipes').respond(201, '{"id": 1}');
    //$httpBackend.expect('GET', '/grains').respond('');
    //$httpBackend.expect('GET', '/hops').respond('');
  }));
  describe('Recipe Create Controller', function() {
    it('should have empty additions', function() {
      expect(controller.additions).toBeDefined();
      expect(controller.additions.grains.length).toBe(0);
      expect(controller.additions.hops.length).toBe(0);
    });
    it('should have an empty recipe object', function() {
      expect(controller.recipe).toEqual({});
    });
    it('should fill the recipe object on form submit', function() {
      controller.submit_recipe("Test", "TestType", [],[]);
      expect(controller.recipe.name).toBe("Test");
      expect(controller.recipe.beer_type).toBe("TestType");
    });
    it('should go to the view state after creating', function(){
      controller.submit_recipe("Test", "TestType", [],[]);
      $httpBackend.expect('GET', '/recipes').respond('');
      $httpBackend.expect('GET', '/recipes/1').respond('');
      $httpBackend.expect('GET', '/recipes/1/hops').respond('');
      $httpBackend.expect('GET', '/recipes/1/grains').respond('');
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.view');
    });
    it('should create a recipe', function(){
      controller.recipe = {name: "TestName", beer_type: "TestType"};
      controller.createRecipe(controller.recipe);
      $httpBackend.expect('GET', '/recipes').respond('');
      $httpBackend.expect('GET', '/recipes/1').respond('');
      $httpBackend.expect('GET', '/recipes/1/hops').respond('');
      $httpBackend.expect('GET', '/recipes/1/grains').respond('');
      $httpBackend.flush();
      expect(controller.recipe.id).toBe(1);
    });

    it('should add grains ', function(){
      controller.recipe = {name: "TestName", beer_type: "TestType"};
      controller.additions = {grains: [{name: 'grain1'}], hops:[]};
      controller.createRecipe(controller.recipe);
      $httpBackend.expect('POST', '/recipes/1/grains').respond('');
      $httpBackend.expect('GET', '/recipes').respond('');
      $httpBackend.expect('GET', '/recipes/1').respond('');
      $httpBackend.expect('GET', '/recipes/1/hops').respond('');
      $httpBackend.expect('GET', '/recipes/1/grains').respond('');
      $httpBackend.flush();
      expect(controller.additions.grains[0].recipe_id).toBe(1);
    });
    it('should add hops', function(){
      controller.recipe = {name: "TestName", beer_type: "TestType"};
      controller.additions = {hops: [{name: 'hop1'}], grains:[]};
      controller.createRecipe(controller.recipe);
      $httpBackend.expect('POST', '/recipes/1/hops').respond('');
      $httpBackend.expect('GET', '/recipes').respond('');
      $httpBackend.expect('GET', '/recipes/1').respond('');
      $httpBackend.expect('GET', '/recipes/1/hops').respond('');
      $httpBackend.expect('GET', '/recipes/1/grains').respond('');
      $httpBackend.flush();
      expect(controller.additions.hops[0].recipe_id).toBe(1);
    });
  });
});
