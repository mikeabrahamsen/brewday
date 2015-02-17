angular.module('recipes.additions.grains',[
])
.directive('grainListForm', function(){
    return {
        restrict: "E",
        scope: {
            additions: '=',
            toDelete: '=',
            additionType: '@'
        },
        controller: "AdditionFormCtrl",
        controllerAs: "grainform",
        bindToController: true,
        templateUrl: 'app/recipes/additions/grains/grainForm.html'
    };
});
