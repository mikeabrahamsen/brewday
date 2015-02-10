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
        templateUrl: 'app/recipes/hops/hopForm.html'
    }
})
