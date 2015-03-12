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
  beforeEach(module("brewday.models.grain"));
  beforeEach(module("brewday.templates"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, _$state_, _AdditionService_, Recipe) {
    $httpBackend = _$httpBackend_;
    AdditionService = _AdditionService_;
    $httpBackend.expect('GET', '/recipes/1').respond('{"id": 1, "name": "TestRecipe", "equipment_profile": {"id":0}}');
    var recipe = Recipe.getOne(1).$object;
    var grains = [];
    var hops = [];
    $state = _$state_;
    $scope = $rootScope;
    $httpBackend.flush();
    controller = $controller("RecipeEditCtrl", {$state: $state, recipe: recipe, grains: grains, hops: hops});

  }));
  describe('Controller', function() {
    it('should have a recipe', function() {
      expect(controller.recipe).toBeDefined();
      expect(controller.recipe.id).toBe(1);
    });
    it('should have additinos defined', function() {
      expect(controller.grains).toBeDefined();
      expect(controller.grains.length).toBe(0);
      expect(controller.hops).toBeDefined();
      expect(controller.hops.length).toBe(0);
      expect(controller.additions).toBeDefined();
      expect(controller.additions.grains.length).toBe(0);
      expect(controller.additions.hops.length).toBe(0);
    });
    it('should save a recipe on submit', function() {
      $httpBackend.expect('PUT', '/recipes/1').respond('201', '');
      $httpBackend.expect('GET', '/recipes/1').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $httpBackend.expect('GET', '/recipes/1/hops').respond([{'name': 'hop1'},{'name': 'hop2'}]);
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      controller.submit_recipe('Test Name', 'Test Type',[] ,[]);
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.view');
    });
    it('should delete additions from toDelete', inject(function(Grain) {
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'}]);
      var grains = Grain.get(1).$object;
      $httpBackend.flush();
      controller.toDelete = grains;
      $httpBackend.expect('PUT', '/recipes/1').respond('201', '');
      $httpBackend.expect('DELETE', '/recipes/1/grains').respond('');
      $httpBackend.expect('GET', '/recipes/1').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $httpBackend.expect('GET', '/recipes/1/hops').respond([{'name': 'hop1'},{'name': 'hop2'}]);
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      controller.submit_recipe('Test Name', 'Test Type',[] ,[]);
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.view');
    }));
    it('should save grains and hops on submit', inject(function(Grain, Hop) {
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $httpBackend.expect('GET', '/recipes/1/hops').respond([{'name': 'hop1'},{'name': 'hop2'}]);
      var grains = Grain.get(1).$object;
      var hops = Hop.get(1).$object;
      $httpBackend.flush();
      $httpBackend.expect('PUT', '/recipes/1').respond('201', '');
      $httpBackend.expect('PUT', '/recipes/1/grains').respond('201', '');
      $httpBackend.expect('PUT', '/recipes/1/grains').respond('201', '');
      $httpBackend.expect('PUT', '/recipes/1/hops').respond('201', '');
      $httpBackend.expect('PUT', '/recipes/1/hops').respond('201', '');
      $httpBackend.expect('GET', '/recipes/1').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $httpBackend.expect('GET', '/recipes/1/hops').respond([{'name': 'hop1'},{'name': 'hop2'}]);
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      controller.submit_recipe('Test Name', 'Test Type', grains,hops);
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.view');
    }));
  });
  describe('Route', function() {
    it('should request recipes and additions', function() {
      $httpBackend.expect('GET', '/recipes/1').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $httpBackend.expect('GET', '/recipes/1/hops').respond([{'name': 'hop1'},{'name': 'hop2'}]);
      $httpBackend.expect('GET', '/recipes/1/grains').respond([{'name': 'grain1'},{'name': 'grain2'}]);
      $state.go('recipes.edit', {recipe_id: 1});
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.edit');
    });
  });
});
