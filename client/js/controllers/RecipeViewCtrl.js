Brewday.controller('RecipeViewCtrl',  ['$scope', '$location', '$window','recipe', 'grains', 'hops',
        function($scope, $location, $window, recipe, grains, hops){
            $scope.recipe = recipe;
            $scope.grains = grains;
            $scope.hops = hops;
            $scope.readOnly = true;
            $scope.totalVol = 0;
            $scope.mashVol = 0;
            $scope.spargeVol = 0;

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
