describe('Equipment Select Directive', function() {
  var $scope;
  var controller;
  var element;
  var $compile;
  var $httpBackend;
  var calc;

  beforeEach(module("brewday.templates"));
  beforeEach(module('brewday.models.equipment'));
  beforeEach(module('recipes.equipment'));
  beforeEach(module('recipes.calculator'));
  beforeEach(module("restangular"));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _CalculatorService_) {
    $scope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    calc = _CalculatorService_;
    $scope.data = {
      profile: {name: 'Profile 1', trubLoss: 1, equipmentLoss: 2, fermenterLoss: 3}
    };
    $httpBackend.expect('GET', '/equipment').respond('[{}]');
    element = angular.element('<equipment-select profile="data.profile"></equipment-select>');
    $compile(element)($scope);
    $scope.$apply();
    $httpBackend.flush();
    controller = element.controller('equipmentSelect');
  }));
  describe('controller', function() {
    it('should be defined', function() {
      expect(controller).toBeDefined();
    });
    it('should have a profile', function() {
      expect(controller.profile).toBeDefined();
      expect(controller.profile.name).toBe('Profile 1');
    });
    it('will set a default profile it one was not passed in', function() {
      $httpBackend.expect('GET', '/equipment').respond('[{"name": "Default"}]');
      $scope.data = {};
      element = angular.element('<equipment-select profile="data.profile"></equipment-select>');
      $compile(element)($scope);
      $scope.$apply();
      $httpBackend.flush();
      controller = element.controller('equipmentSelect');
      expect(controller.profile.name).toBe('Default');
    });
    it('should update the calculator service profile', function() {
      controller.updateCalc();
      expect(calc.equipmentProfile).toBe(controller.profile);
    });
  });
});
