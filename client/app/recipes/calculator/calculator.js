Brewday.service('WaterService', function(){
    var waterService = this;
    waterService.totalVol = 0;
    waterService.mashVol = 0;
    waterService.spargeVol = 0;
    waterService.grainBill = 0;


    waterService.calculateWaterVol = function(grainBill){
        var batchSize = 5;
        var bt = 120;
        var trubLoss = 0.5;
        var equipmentLoss = 1;
        var mashThickness = 1.33;

        var ga = grainAbsorbtion(grainBill);
        var pv = preBoilVol(bt, batchSize, trubLoss);
        var tv = totalVol(pv, ga, equipmentLoss);
        var mv = mashVol(mashThickness, grainBill);
        var sv = spargeVol(tv, mv);

        this.totalVol = tv;
        this.mashVol = mv;
        this.spargeVol = sv;

        return


    }
        function grainAbsorbtion(grainBill){
            return 0.13 * grainBill;
        }
        function preBoilVol(boilTime, batchSize, trubLoss){
            var wsFactor = shrinkageFactor(0.04)
                var ev = evaporateFactor(boilTime)
                return ((batchSize + trubLoss) / wsFactor) / ev;
        }
        function evaporateFactor(boilTime){
            return 1-(0.10 * (boilTime / 60))
        }
        function shrinkageFactor(percent){
            return 1-percent
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
})
Brewday.controller('WaterVolumeCtrl',['WaterService',
        function(WaterService){
            var waterVol = this;
            waterVol.waterService = WaterService;

            this.grainTotal = function(){
                var total =
                _.chain(this.grains)
                 .map(function(grain){ return grain.amount; })
                 .inject(function(sum, value){ return sum + value; })
                 .value()

                waterVol.waterService.calculateWaterVol(total);
                waterVol.grainBill = total;
                return total
            }
        }
])

Brewday.directive('waterCalculations', function waterCalculations(){
    return {
        restrict: "E",
        bindToController: true,
        scope: {
            grains: '='
        },
        controller: 'WaterVolumeCtrl',
        controllerAs: 'waterVol',
        templateUrl: 'app/recipes/calculator/calculator.html'
    }
})