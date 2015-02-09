Brewday.directive('hopListForm', function(){
    return {
        restrict: "E",
        scope: {
            hops: '=',
            toDelete: '='
        },
        controller: "HopFormCtrl",
        controllerAs: "hopform",
        bindToController: true,
        templateUrl: '../../partials/recipes/hopForm.html'
    }
})
Brewday.directive('grainListForm', function(){
    return {
        restrict: "E",
        scope: {
            grains: '=',
            toDelete: '='
        },
        controller: "GrainFormCtrl",
        controllerAs: "grainform",
        bindToController: true,
        templateUrl: '../../partials/recipes/grainForm.html'
    }
})
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
