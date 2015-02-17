describe("Grains", function() {
  var element;
  var $compile;
  var $scope;
  var controller;
  beforeEach(module("recipes.grains"));
  beforeEach(module("brewday.models.grain"));
  beforeEach(module("brewday.templates"));
  beforeEach(module("restangular"));
  beforeEach(inject(function(_$compile_, $rootScope, $httpBackend) {
    $httpBackend.expect('GET', '/grains').respond('');
    $scope = $rootScope;
    $compile = _$compile_;
    $scope.data = {
      grains: [],
      toDelete: []
    };
    element = angular.element("<grain-list-form grains='data.grains' to-delete='data.toDelete'></grain-list-form>");
    $compile(element)($rootScope);
    $httpBackend.flush();
    controller = element.controller('grainListForm');
  }));

  describe("grainListForm directive", function() {
    beforeEach(inject(function($httpBackend) {
      $httpBackend.expect('GET', '/grains').respond('');
    }));

    it("will always have a default grain", function() {
      expect(element.scope().data.grains.length).toBe(1);
      expect(element.isolateScope().grainform.grains.length).toBe(1);
    });

    it('will take in grain data', function() {
      $scope.data = { grains: [{},{},{}]};
      $scope.$apply();

      expect(element.scope().data.grains.length).toBe(3);
      expect(element.isolateScope().grainform.grains.length).toBe(3);
    });

    it('will take in toDelete data', function() {
      $scope.data = {toDelete: [{},{},{}], grains: []};
      $scope.$apply();
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().grainform.toDelete.length).toBe(3);
    });

    it('will have 2 way binding', function() {
      element.isolateScope().grainform.grains = [{},{}];
      element.isolateScope().grainform.toDelete = [{},{},{}];
      $scope.$apply();

      expect($scope.data.grains.length).toBe(2);
      expect(element.scope().data.grains.length).toBe(2);
      expect(element.isolateScope().grainform.grains.length).toBe(2);

      expect($scope.data.toDelete.length).toBe(3);
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().grainform.toDelete.length).toBe(3);
    });
  });
  describe("GrainFormController ", function() {
    beforeEach(inject(function($httpBackend) {
      $httpBackend.expect('GET', '/grains').respond('');
    }));
    it('will be on the element', function() {
      expect(element.controller('grainListForm')).toBeDefined();
      expect(controller).toBeDefined();
    });
    it('will have grains', function() {
      expect(controller.grains).toBeDefined;
      expect(controller.grains.length).toBe(1);
    });
    it('will have a toDelete list', function() {
      expect(controller.toDelete).toEqual([]);
    });
    it('will have grain_options', function() {
      expect(controller.grain_options).toBeDefined();
      expect(controller.grain_options.length).toBe(0);
    });
    it('will add a new grain', function() {
      controller.addNewGrain();
      controller.addNewGrain();
      expect(controller.grains.length).toBe(3);
    });
    it('will delete a grain', function() {
      expect(controller.grains.length).toBe(1);
      controller.removeGrain(controller.grains[0]);
      expect(controller.grains.length).toBe(0);
    });
    it('will not put the default grain in the toDelete list', function(){
      controller.removeGrain(controller.grains[0]);
      expect(controller.toDelete.length).toBe(0);
    });
    it('will put not put a grain that was not in the db in toDelete', function() {
      var grain = controller.addNewGrain();
      controller.removeGrain(grain);
      expect(controller.toDelete.length).toBe(0);
    });
    it('will add a grain to toDelete if grain was in the original list', function() {
        $scope.data.grains = [{name: 'test-grain'},{}];
        $compile(element)($scope);
        $scope.$apply();

        controller = element.controller('grainListForm');
        expect(controller.grains.length).toBe(2);
        controller.removeGrain(controller.grains[1]);
        expect(controller.toDelete.length).toBe(1);
        var grain = controller.addNewGrain();
        controller.removeGrain(controller.grains[0]);
        expect(controller.toDelete.length).toBe(2);
    });
  });
});

