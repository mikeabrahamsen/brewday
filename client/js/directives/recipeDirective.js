Brewday.directive('waterCalculations', function waterCalculations(){
    return {
        restrict: "E",
        bindToController: true,
        scope: {
            grains: '='
        },
        controller: 'WaterVolumeCtrl',
        controllerAs: 'waterVol',
        templateUrl: '../../partials/recipes/waterVolume.html'
    }
})
