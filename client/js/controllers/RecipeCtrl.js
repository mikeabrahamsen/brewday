Brewday.controller('RecipeCtrl',  ['$scope', '$location', '$window', '$routeParams', 'Recipe', 'Grain', 'Hop', 'Addition',
    function($scope, $location, $window, $routeParams, Recipe, Grain, Hop, Addition){
        $scope.recipe = {};
        $scope.data = {};
        $scope.readOnly = false;
        factory_method = '';
        $scope.grains = [{id: 'grain1'},{id: 'grain2'}];
        $scope.hops = [{id: 'hop1'},{id: 'hop2'}];
        $scope.grainBill, $scope.totalVol, $scope.mashVol, $scope.spargeVol = 0


        url = $location.$$url.split('/');
        if (url[url.length-1]  === 'view')
            $scope.readOnly = true;

        var toDelete = []
        var original_grains = []
        var original_hops = []
        if ($routeParams.recipe_id)
        {
            factory_method = 'update';
            var recipe_id = $routeParams.recipe_id;
            $scope.recipe = Recipe.getOne(recipe_id).$object;
            Grain.get(recipe_id).then(function(grains){
                if(grains.length > 0)
                {
                    $scope.grains = grains
                    // copy the array to so we can do a comparison later
                    original_grains = grains.slice(0);
                }
            });
            Hop.get(recipe_id).then(function(hops){
                if(hops.length > 0)
                {
                    $scope.hops = hops
                    original_hops = hops.slice(0);
                }
            });

        }
        else
        {
            factory_method = 'create';
        }

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
            Recipe[factory_method](recipe).then(function(data){
                id = data.id;
                toDelete.forEach(function(addition){
                    Addition.remove(addition);
                });
                grains.forEach(function(grain,i){
                    if (grain.name && grain.amount)
                    {
                        g = {}
                        g.name = grain.name;
                        g.amount = grain.amount;
                        g.recipe_id = id;
                        g.addition_id = grain.addition_id;
                        g.addition_type = 'grain';
                        g.brew_stage = 0;
                        g.time = 1;

                        Addition[factory_method](g);
                    }
                });
                hops.forEach(function(hop,i){
                    if (hop.name && hop.amount)
                    {
                        h = {}
                        h.name = hop.name;
                        h.amount = hop.amount;
                        h.recipe_id = id;
                        h.addition_id = hop.addition_id;
                        h.addition_type = 'hop';
                        h.brew_stage = 0;
                        h.time = hop.time;
                        Addition[factory_method](h);
                    }
                });
            $location.path('/recipes/'+ id + '/edit');
            });
        }
        $scope.getGrainBill = function(){
            var total = 0;
            for(var i = 0; i < $scope.grains.length; i++){
                var grain = $scope.grains[i];
                total += grain.amount;
            }
            $scope.grainBill = total;
            return total;
        }

        calculateWaterVol = function(){
            var batchSize = 5;
            var grainBill = $scope.grainBill;
            var boilTime = 60;
            var trubLoss = 0.5;
            var equipmentLoss = 1;
            var mashThickness = 1.33;

            var grainAbsorbtion = grainAbsorbtion(grainBill);
            var preBoilVol = preBoilVol(batchSize, trubLoss);
            var totalVol = totalVol(preBoilVol, grainAbsorbtion, equipmentLoss);
            var mashVol = mashVol(mashThickness, grainBill);
            var spargeVol = spargeVol(totalVol, mashVol);

            $scope.totalVol = totalVol;
            $scope.mashVol = mashVol;
            $scope.spargeVol = spargeVol;


            function grainAbsorbtion(grainBill){
                return .13 * grainBill;
            }
            function preBoilVol(batchSize, trubLoss){
                return ((batchSize + trubLoss) / .96) /.90;
            }
            function boilTimeLoss(boilTime, preBoilVol){
                return boilTime / 60 * preBoilVol * .10;
            }
            function wortShrinkage(preBoilVol, boilTimeLoss){
                return (preBoilVol + boilTimeLoss) * .04;
            }
            function totalVol(preBoilVol, grainAbsorbtion, equipmentLoss){
                return preBoilVol + grainAbsorbtion + equipmentLoss;
            }
            function mashVol(mashThickness, grainBill){

                return mashThickness * grainBill * .25;
            }
            function spargeVol(totalVol, mashVol){
                return totalVol - mashVol;
            }
        }
        $scope.$watch('grainBill', calculateWaterVol);

    }
])
