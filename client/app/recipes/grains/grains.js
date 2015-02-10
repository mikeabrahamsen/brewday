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
Brewday.controller('GrainFormCtrl', ['Grain',
        function(Grain){

        var original_grains =[]

        if(this.grains.length < 1)
            this.grains = [{id: 'grain1'}];
        else
            original_grains = this.grains.slice(0);

        this.grain_options = Grain.getAll().$object;

        this.addNewGrain= function() {
            var newItemNo = this.grains.length+1;
            this.grains.push({'id':'grain'+newItemNo});
        };
        this.removeGrain= function(grain) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_grains.indexOf(grain) > -1)
            {
                this.toDelete.push(grain);
            }
            this.grains.splice( this.grains.indexOf(grain), 1 );
        };
        }
])
