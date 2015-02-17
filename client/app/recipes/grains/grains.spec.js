describe("Grains", function() {
  var element;
  var $scope;
  beforeEach(module("recipes.grains"));
  beforeEach(module("brewday.models.grain"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($compile, $rootScope, $httpBackend) {
    $httpBackend.expect('GET', 'app/recipes/grains/grainForm.html').respond('<div class="col-md-6"> <ng-form name="grainForm" ng-model="grainform.grains"> ');
    $httpBackend.expect('GET', '/grains').respond('');
    $scope = $rootScope;
    $scope.data = {
      grains: [],
      toDelete: []
    };
    element = angular.element("<grain-list-form grains='data.grains' to-delete='data.toDelete'></grain-list-form>");
    $compile(element)($rootScope.$new());
    $httpBackend.flush();
  }));

  describe("grainListForm directive", function() {
    it("will always have a default grain", function() {
      expect(element.scope().data.grains.length).toBe(1);
      expect(element.isolateScope().grainform.grains.length).toBe(1);
    });

    it('will take in grain data', inject(function($compile, $rootScope, $httpBackend) {
      $scope.data = { grains: [{},{},{}]};
      $compile(element)($rootScope);
      $httpBackend.expect('GET', '/grains').respond('');
      $rootScope.$digest();
      expect(element.scope().data.grains.length).toBe(3);
      expect(element.isolateScope().grainform.grains.length).toBe(3);
    }));

    it('will take in toDelete data', inject(function($compile, $rootScope, $httpBackend) {
      $scope.data = {toDelete: [{},{},{}], grains: []};
      $compile(element)($rootScope);
      $httpBackend.expect('GET', '/grains').respond('');
      $rootScope.$digest();
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().grainform.toDelete.length).toBe(3);
    }));

    it('will have 2 way binding', inject(function($compile,$httpBackend, $rootScope) {
      element.isolateScope().grainform.grains = [{},{}];
      element.isolateScope().grainform.toDelete = [{},{},{}];
      $compile(element)($rootScope);
      $httpBackend.expect('GET', '/grains').respond('');
      $rootScope.$digest();

      expect($scope.data.grains.length).toBe(2);
      expect(element.scope().data.grains.length).toBe(2);
      expect(element.isolateScope().grainform.grains.length).toBe(2);

      expect($scope.data.toDelete.length).toBe(3);
      expect(element.scope().data.toDelete.length).toBe(3);
      expect(element.isolateScope().grainform.toDelete.length).toBe(3);
    }));
  });
});

