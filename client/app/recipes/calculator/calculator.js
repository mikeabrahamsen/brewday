angular.module('recipes.calculator',[

])
.service('CalculatorService', function(){
  var calculatorService = this;
  calculatorService.totalVol = 0;
  calculatorService.mashVol = 0;
  calculatorService.spargeVol = 0;
  calculatorService.preBoilVol = 0;
  calculatorService.details = {
    batchSize: 5,
    boilTime: 60,
    mashThickness: 1.33
  };
  calculatorService.equipmentProfile = {
    name: "Default Profile",
    trubLoss: 0.5,
    equipmentLoss: 1,
    fermenterLoss: 0,
  };

  calculatorService.grainBill = 0;
  calculatorService.grainTemp = 65;


  calculatorService.calculateWaterVol = function(grainBill){
    var batchSize = calculatorService.details.batchSize;
    var bt = calculatorService.details.boilTime;
    var trubLoss = calculatorService.equipmentProfile.trubLoss;
    var equipmentLoss = calculatorService.equipmentProfile.equipmentLoss;
    var mashThickness = calculatorService.details.mashThickness;

    var ga = grainAbsorbtion(grainBill);
    var pv = preBoilVol(bt, batchSize, trubLoss);
    var tv = totalVol(pv, ga, equipmentLoss);
    var mv = mashVol(mashThickness, grainBill);
    var sv = spargeVol(tv, mv);

    this.totalVol = Math.round(tv*100) / 100;
    this.mashVol = Math.round(mv*100) / 100;
    this.spargeVol = Math.round(sv*100) / 100;
    this.preBoilVol = Math.round(pv*100) / 100;
  };
  calculatorService.calculateStrikeTemp = function(targetTemp){
    var strikeTemp = (0.2 / calculatorService.details.mashThickness)*(targetTemp - calculatorService.grainTemp) + targetTemp;
    return Math.round(strikeTemp*10) / 10;
  };
  function grainAbsorbtion(grainBill){
    return 0.13 * grainBill;
  }
  function preBoilVol(boilTime, batchSize, trubLoss){
    var wsFactor = shrinkageFactor(0.04);
    var ev = evaporateFactor(boilTime);
    return ((batchSize + trubLoss) / wsFactor) / ev;
  }
  function evaporateFactor(boilTime){
    return 1-(0.10 * (boilTime / 60));
  }
  function shrinkageFactor(percent){
    return 1-percent;
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
.controller('CalculatorCtrl',['CalculatorService',
            function(CalculatorService){
              this.calcService = CalculatorService;

              this.grainTotal = function(){
                var total =
                  _.chain(this.grains)
                .map(function(grain){ return grain.amount; })
                .inject(function(sum, value){ return sum + value; })
                .value();

                this.calcService.calculateWaterVol(total);
                this.grainBill = total;
                return total;
              };
            }
])

.directive('waterCalculations', function(){
  return {
    restrict: "E",
    bindToController: true,
    scope: {
      grains: '='
    },
    controller: 'CalculatorCtrl',
    controllerAs: 'calculator',
    templateUrl: 'app/recipes/calculator/calculator.html'
  };
});
