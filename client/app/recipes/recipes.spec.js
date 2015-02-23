describe("Recipes List", function() {
  var $httpBackend;
  var controller;
  beforeEach(module("brewday.templates"));
  beforeEach(module("ui.router"));
  beforeEach(module("recipes"));
  beforeEach(module("restangular"));
  beforeEach(inject(function(_$httpBackend_, $controller, Recipe) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expect('GET','/recipes').respond([{"name": 'test-recipe'},{}]);

    var recipes = Recipe.get().$object;
    controller = $controller("RecipeListCtrl",{recipes: recipes});
    $httpBackend.flush();
  }));
  describe('Recipes List Controller', function() {
    it('should have a list of recipes', function() {
      expect(controller.recipes).toBeDefined();
      expect(controller.recipes.length).toBe(2);
      expect(controller.recipes[0].name).toBe('test-recipe');
      expect(controller.recipes[1].name).not.toBeDefined();
    });
  });
});
