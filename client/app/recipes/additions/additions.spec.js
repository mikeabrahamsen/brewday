describe("Additions", function() {
  var element;
  var $compile;
  var $scope;
  var $httpBackend;
  var controller;
  var recipe;
  beforeEach(module("recipes.additions"));
  beforeEach(module("brewday.models.grain"));
  beforeEach(module("brewday.models.hop"));
  beforeEach(module("brewday.templates"));
  beforeEach(module("restangular"));
  beforeEach(inject(function(_$compile_, $rootScope, _$httpBackend_, Restangular) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expect('GET', '/grains').respond('');
    $httpBackend.expect('GET', '/hops').respond('');
    recipe = Restangular.one('recipes', 1);
    $scope = $rootScope;
    $compile = _$compile_;
    $scope.data = {
      additions: {grains: [], hops: []},
      toDelete: [],
      recipe: recipe
    };
    element = angular.element("<additions-form additions='data.additions' to-delete='data.toDelete' recipe='data.recipe'></additions-form>");
    $compile(element)($rootScope);
    $scope.$apply();
    $httpBackend.flush();
    controller = element.controller('additionsForm');
  }));
  describe("directive", function() {
    it("will always have a default grain", function() {
      expect(element.scope().data.additions.grains.length).toBe(1);
      expect(element.isolateScope().additionCtrl.additions.grains.length).toBe(1);
    });
    it("will always have a default hop", function() {
      expect(element.scope().data.additions.hops.length).toBe(1);
      expect(element.isolateScope().additionCtrl.additions.hops.length).toBe(1);
    });
    it('will take in grain data', function() {
      $scope.data.additions.grains =  [{},{},{}];
      $scope.$apply();

      expect(element.scope().data.additions.grains.length).toBe(3);
      expect(element.isolateScope().additionCtrl.additions.grains.length).toBe(3);
    });

    it('will take in toDelete data', function() {
      $scope.data = {toDelete: [{},{},{}], additions: {grains: []}, recipe: recipe};
      $scope.$apply();
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().additionCtrl.toDelete.length).toBe(3);
    });

    it('will have 2 way binding', function() {
      element.isolateScope().additionCtrl.additions.grains = [{},{}];
      element.isolateScope().additionCtrl.toDelete = [{},{},{}];
      $scope.$apply();

      expect($scope.data.additions.grains.length).toBe(2);
      expect(element.scope().data.additions.grains.length).toBe(2);
      expect(element.isolateScope().additionCtrl.additions.grains.length).toBe(2);

      expect($scope.data.toDelete.length).toBe(3);
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().additionCtrl.toDelete.length).toBe(3);
    });
  });
  describe("AdditionFormController ", function() {
    beforeEach(inject(function($httpBackend) {
      $httpBackend.expect('GET', '/grains').respond('');
      $httpBackend.expect('GET', '/hops').respond('');
    }));
    it('will be on the element', function() {
      expect(element.controller('additionsForm')).toBeDefined();
      expect(controller).toBeDefined();
    });
    it('will have grains', function() {
      expect(controller.additions.grains).toBeDefined;
      expect(controller.additions.grains.length).toBe(1);
    });
    it('will have a toDelete list', function() {
      expect(controller.toDelete).toEqual([]);
    });
    it('will have grain_options', function() {
      expect(controller.options.grains).toBeDefined();
      expect(controller.options.grains.length).toBe(0);
    });
    it('will add a new grain', function() {
      controller.addNewAddition('grain');
      controller.addNewAddition('grain');
      expect(controller.additions.grains.length).toBe(3);
    });
    it('will delete a grain', function() {
      expect(controller.additions.grains.length).toBe(1);
      controller.removeAddition(controller.additions.grains[0]);
      expect(controller.additions.grains.length).toBe(0);
    });
    it('will not put the default grain in the toDelete list', function(){
      controller.removeAddition(controller.additions.grains[0]);
      expect(controller.toDelete.length).toBe(0);
    });
    it('will put not put a grain that was not in the db in toDelete', function() {
      var grain = controller.addNewAddition('grain');
      controller.removeAddition(grain);
      expect(controller.toDelete.length).toBe(0);
    });

    it('will add a grain to toDelete if grain was in the original list', function() {
      var grains = [{id: 'grain1', addition_type: 'grain'},{id: 'grain2', addition_type: 'grain'}];
      $scope.data.additions.grains = grains;
      $compile(element)($scope);
      $scope.$apply();

      controller = element.controller('additionsForm');
      expect(controller.additions.grains.length).toBe(2);
      controller.removeAddition(controller.additions.grains[1]);
      expect(controller.toDelete.length).toBe(1);

      var grain = controller.addNewAddition('grain');
      controller.removeAddition(controller.additions.grains[0]);
      expect(controller.toDelete.length).toBe(2);
    });
  });
  describe('Addition Service', function() {
    var AdditionService;
    var Grain;
    beforeEach(inject(function(_AdditionService_, _Grain_) {
      AdditionService = _AdditionService_;
      Grain = _Grain_;
      spyOn(AdditionService, 'addNewAddition').and.callThrough();
    }));
    it('should set default addition by calling add new additions', function() {
      var additions = {grains: [], hops: []};
      expect(additions.grains.length).toBe(0);
      expect(additions.hops.length).toBe(0);
      AdditionService.setDefaultAdditions(additions, [], recipe);
      expect(AdditionService.addNewAddition).toHaveBeenCalled();
      expect(additions.grains.length).toBe(1);
      expect(additions.hops.length).toBe(1);
    });
    it('should be able to set the model name', function() {
      var modelName = AdditionService.getModelName('hop');
      expect(modelName).toBe('HopModel');
      modelName = AdditionService.getModelName('hops');
      expect(modelName).toBe('HopModel');
      modelName = AdditionService.getModelName('Hops');
      expect(modelName).toBe('HopModel');
    });
    it('will add a new addition as a restangular object if recipe is given', function() {
      var additions = {grains: [], hops: []};
      expect(additions.grains.length).toBe(0);
      var addition = AdditionService.addNewAddition('grain',additions, recipe);
      expect(additions.grains.length).toBe(1);
      expect(additions.grains[0].getRestangularUrl()).toBe('/recipes/1/grains');
    });
    it('add additions with a recipe id if available', function() {
      var additions = {grains: [], hops: []};
      expect(additions.grains.length).toBe(0);
      var addition = AdditionService.addNewAddition('grain',additions, recipe);
      expect(additions.grains.length).toBe(1);
      expect(additions.grains[0].recipe_id).toBe(recipe.id);
    });
  });
});
