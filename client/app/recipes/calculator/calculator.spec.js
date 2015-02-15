/* global inject */
describe('Brewday', function() {
    var WaterService;
    beforeEach(module('recipes.calculator'));
    beforeEach(inject(function(_WaterService_) {
        WaterService = _WaterService_;
    }));
    describe('WaterService', function() {
        it('should have an initial total vol of zero', function() {
            expect(WaterService.totalVol).toEqual(0);
        });

    });

});
