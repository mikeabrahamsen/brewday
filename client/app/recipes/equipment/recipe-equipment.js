angular.module('recipes.equipment',[

])
.controller(
  'RecipeEquipmentCtrl',['EquipmentProfile', 'CalculatorService',
    function(EquipmentProfile, Calculator){
      var equipmentCtrl = this;

      EquipmentProfile.get().then(function(data){
        equipmentCtrl.equipmentList = data;
        if(!equipmentCtrl.profile){
          equipmentCtrl.profile = data[0];
        }
          equipmentCtrl.updateCalc();
      });

      this.updateCalc = function () {
        Calculator.trubLoss = equipmentCtrl.profile.trub_loss;
        Calculator.equipmentLoss = equipmentCtrl.profile.equipment_loss;
        Calculator.fermenterLoss = equipmentCtrl.profile.fermenter_loss;
      };
    }
  ])
.directive('equipmentSelect', function(){
  return {
    restrict: "E",
    bindToController: true,
    scope: {
      profile: '='
    },
    controller: 'RecipeEquipmentCtrl',
    controllerAs: 'equipmentCtrl',
    templateUrl: 'app/recipes/equipment/equipment-select-tmpl.html'
  };
});