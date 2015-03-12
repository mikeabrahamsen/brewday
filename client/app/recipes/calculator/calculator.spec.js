/* global inject */
describe('Calculator Service', function() {
  var CalculatorService;
  var scope;
  beforeEach(module('recipes.calculator'));
  beforeEach(inject(function(_$rootScope_, _CalculatorService_) {
    scope = _$rootScope_;
    CalculatorService = _CalculatorService_;
  }));
  describe('Initial Values', function() {
    it('should have an initial total vol of zero', function() {
      expect(CalculatorService.totalVol).toEqual(0);
    });
    it('should have have an initial grain bill', function() {
      expect(CalculatorService.grainBill).toEqual(0);
    });
    it('should have an initial batch size', function() {
      expect(CalculatorService.details.batchSize).toEqual(5);
    });
    it('should have an initial boil time', function() {
      expect(CalculatorService.details.boilTime).toEqual(60);
    });
    it('should have an initial trub loss', function() {
      expect(CalculatorService.equipmentProfile.trubLoss).toEqual(0.5);
    });
    it('should have an initial equipment loss', function() {
      expect(CalculatorService.equipmentProfile.equipmentLoss).toEqual(1);
    });
    it('should have an initial mash thickness', function() {
      expect(CalculatorService.details.mashThickness).toEqual(1.33);
    });
  });
  describe('calculator', function() {
    it('should return the correct volumes with default values', function() {
      CalculatorService.calculateWaterVol(10);
      expect(CalculatorService.totalVol).toBe(8.67);
      expect(CalculatorService.mashVol).toBe(3.33);
      expect(CalculatorService.spargeVol).toBe(5.34);
    });
    it('should calculate strike temperature with default values', function() {
      var strikeTemp = CalculatorService.calculateStrikeTemp(152);
      expect(strikeTemp).toBe(165.1);
    });
  });
});

describe('Calculator Directive', function() {
  var CalculatorService;
  var $scope;
  var $compile;
  var $httpBackend;
  var element;
  var controller;
  beforeEach(module("brewday.templates"));
  beforeEach(module('recipes.calculator'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_) {
    $scope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $scope.data = {
      grains: [{amount: 9},{amount: 1}]
    };
    element = angular.element('<water-calculations grains="data.grains"></water-calculations>');
    $compile(element)($scope);
    $scope.$apply();
    controller = element.controller('waterCalculations');
  }));
  describe('Calculator Directive Controller', function() {
    it('should be defined', function() {
      expect(controller).toBeDefined();
    });
    it('should have a CalculatorService', function() {
      expect(controller.calcService).toBeDefined();
    });
    it('should calulate the grain bill', function() {
      expect(controller.grainBill).toBe(10);
    });
  });
});
