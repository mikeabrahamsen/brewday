/* global inject */
describe('CalculatorService', function() {
  var CalculatorService;
  beforeEach(module('recipes.calculator'));
  beforeEach(inject(function(_CalculatorService_) {
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
      expect(CalculatorService.batchSize).toEqual(5);
    });
    it('should have an initial boil time', function() {
      expect(CalculatorService.boilTime).toEqual(60);
    });
    it('should have an initial trub loss', function() {
      expect(CalculatorService.trubLoss).toEqual(0.5);
    });
    it('should have an initial equipment loss', function() {
      expect(CalculatorService.equipmentLoss).toEqual(1);
    });
    it('should have an initial mash thickness', function() {
      expect(CalculatorService.mashThickness).toEqual(1.33);
    });
  });

});
