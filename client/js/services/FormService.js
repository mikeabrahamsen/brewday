Brewday.directive('grainListForm', function waterCalculations(){
    return {
        restrict: "E",
        scope: {
            grains: '=grains'
        },
        controller: "GrainFormCtrl",
        controllerAs: "grainform",
        bindToController: true,
        templateUrl: '../../partials/recipes/grainForm.html'
    }
})
Brewday.controller('GrainFormCtrl', ['Grain',
    function GrainFormCtrl(Grain){

    this.grain_options = Grain.getAll().$object;

    this.addNewGrain= function() {
        var newItemNo = this.grains.length+1;
        this.grains.push({'id':'grain'+newItemNo});
    };
}
])
