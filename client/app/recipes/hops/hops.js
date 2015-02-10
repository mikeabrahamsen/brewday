angular.module('recipes.hops',[

])
.directive('hopListForm', function(){
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
.controller('HopFormCtrl', ['Hop',
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
