angular.module('recipes.additions.hops',[

])
.directive('hopListForm', function(){
    return {
        restrict: "E",
        scope: {
            additions: '=',
            toDelete: '=',
            additionType: '@'
        },
        controller: "AdditionFormCtrl",
        controllerAs: "hopform",
        bindToController: true,
        templateUrl: 'app/recipes/additions/hops/hopForm.html'
    };
});
