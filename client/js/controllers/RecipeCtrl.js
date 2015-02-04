Brewday.controller('RecipeCtrl',  ['$scope', '$state', '$window', '$stateParams', 'Recipe', 'Grain', 'Hop', 'Addition', 'recipe','grains', 'hops',
    function($scope, $state, $window, $stateParams, Recipe, Grain, Hop, Addition, recipe, grains, hops){
        $scope.recipe = recipe;
        $scope.data = {};
        $scope.readOnly = false;
        $scope.grains = grains;
        $scope.hops = hops;
        if(grains.length < 1)
            $scope.grains = [{id: 'grain1'}];
        if(hops.length < 1)
            $scope.hops = [{id: 'hop1'}];
        $scope.grainBill = 0;
        $scope.totalVol = 0;
        $scope.mashVol = 0;
        $scope.spargeVol = 0;

        var toDelete = [];
        var original_grains = grains.slice(0);
        var original_hops = hops.slice(0);

        $scope.grain_options = Grain.getAll().$object;
        $scope.hop_options = Hop.getAll().$object;

        $scope.addNewGrain= function() {
            var newItemNo = $scope.grains.length+1;
            $scope.grains.push({'id':'grain'+newItemNo});
        };
        $scope.addNewHop= function() {
            var newItemNo = $scope.hops.length+1;
            $scope.hops.push({'id':'hop'+newItemNo});
        };
        $scope.removeGrain= function(grain) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_grains.indexOf(grain) > -1)
            {
                toDelete.push(grain);
            }
            $scope.grains.splice( $scope.grains.indexOf(grain), 1 );
        };

        $scope.removeHop = function(hop) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_hops.indexOf(hop) > -1)
            {
                toDelete.push(hop);
            }
            $scope.hops.splice( $scope.hops.indexOf(hop), 1 );
        };
        $scope.submit_recipe =
            function submit_recipe(name,beertype,grains,hops){
            recipe = $scope.recipe;
            recipe.name = name;
            recipe.beer_type = beertype;
            Recipe.update(recipe).then(function(data){
                var id = data.id;
                toDelete.forEach(function(addition){
                    Addition.remove(addition);
                });
                grains.forEach(function(grain){
                    if (grain.name && grain.amount)
                    {
                        var g = {};
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
                        g.addition_type = 'grain';
                        g.brew_stage = 0;
                        g.time = 1;

                        Addition.update(g);
                    }
                });
                hops.forEach(function(hop){
                    if (hop.name && hop.amount)
                    {
                        var h = {};
                        h.name = hop.name;
                        h.amount = hop.amount;
                        h.recipe_id = id;
                        h.addition_id = hop.addition_id;
                        h.addition_type = 'hop';
                        h.brew_stage = 0;
                        h.time = hop.time;
                        Addition.update(h);
                    }
                });
                $state.go('recipes.view', {recipe_id: recipe.id})
            });
        };
        $scope.getGrainBill = function(){
            var total = 0;
            for(var i = 0; i < $scope.grains.length; i++){
                var grain = $scope.grains[i];
                total += grain.amount;
            }
            $scope.grainBill = total;
            return total;
        };

        calculateWaterVol = function(){
            var batchSize = 5;
            var grainBill = $scope.grainBill;
            var bt = 120;
            var trubLoss = 0.5;
            var equipmentLoss = 1;
            var mashThickness = 1.33;

            var ga = grainAbsorbtion(grainBill);
            var pv = preBoilVol(bt, batchSize, trubLoss);
            var tv = totalVol(pv, ga, equipmentLoss);
            var mv = mashVol(mashThickness, grainBill);
            var sv = spargeVol(tv, mv);

            $scope.totalVol = tv;
            $scope.mashVol = mv;
            $scope.spargeVol = sv;


            function grainAbsorbtion(grainBill){
                return 0.13 * grainBill;
            }
            function preBoilVol(boilTime, batchSize, trubLoss){
                wsFactor = shrinkageFactor(0.04)
                ev = evaporateFactor(boilTime)
                return ((batchSize + trubLoss) / wsFactor) / ev;
            }
            function evaporateFactor(boilTime){
                return 1-(0.10 * (boilTime / 60))
            }
            function shrinkageFactor(percent){
                return 1-percent
            }
            function boilTimeLoss(boilTime, preBoilVol){
                return boilTime / 60 * preBoilVol * 0.10;
            }
            function wortShrinkage(preBoilVol){
                btl = boilTimeLoss(boilTime, preBoilVol);
                return (preBoilVol + btl) * 0.04;
            }
            function totalVol(preBoilVol, grainAbsorbtion, equipmentLoss){
                return preBoilVol + grainAbsorbtion + equipmentLoss;
            }
            function mashVol(mashThickness, grainBill){

                return mashThickness * grainBill * 0.25;
            }
            function spargeVol(totalVol, mashVol){
                return totalVol - mashVol;
            }
        };
        $scope.$watch('grainBill', calculateWaterVol);

    }
]);
