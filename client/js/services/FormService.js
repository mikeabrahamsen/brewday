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
Brewday.controller('HopFormCtrl', ['Hop',
        function(Hop){
        var original_hops = []
        if(this.hops.length < 1)
            this.hops = [{id: 'hop1'}];
        else
            original_hops = this.hops.slice(0);

        this.hop_options = Hop.getAll().$object;

        this.addNewHop= function() {
            var newItemNo = this.hops.length+1;
            this.hops.push({'id':'hop'+newItemNo});
        };

        this.removeHop = function(hop) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_hops.indexOf(hop) > -1)
            {
                this.toDelete.push(hop);
            }
            this.hops.splice( this.hops.indexOf(hop), 1 );
        };
        }
])
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
