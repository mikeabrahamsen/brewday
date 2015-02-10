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
        templateUrl: 'app/recipes/grains/grainForm.html'
    }
})
