/* global inject */
describe('WaterService', function() {
    var WaterService;
    beforeEach(module('recipes.calculator'));
    beforeEach(inject(function(_WaterService_) {
        WaterService = _WaterService_;
    }));
    describe('Initial Values', function() {
        it('should have an initial total vol of zero', function() {
            expect(WaterService.totalVol).toEqual(0);
        });
        it('should have have an initial grain bill', function() {
            expect(WaterService.grainBill).toEqual(0);
        });
        it('should have an initial batch size', function() {
            expect(WaterService.batchSize).toEqual(5);
        });
        it('should have an initial boil time', function() {
            expect(WaterService.boilTime).toEqual(60);
        });
        it('should have an initial trub loss', function() {
            expect(WaterService.trubLoss).toEqual(0.5);
        });
        it('should have an initial equipment loss', function() {
            expect(WaterService.equipmentLoss).toEqual(1);
        });
        it('should have an initial mash thickness', function() {
            expect(WaterService.mashThickness).toEqual(1.33);
        });
    });

});
