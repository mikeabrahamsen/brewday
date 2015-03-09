angular.module('recipes.equipment',[

])
.controller('RecipeEquipmentCtrl',['EquipmentProfile',
            function(EquipmentProfile){
              var equipmentCtrl = this;

              EquipmentProfile.get().then(function(data){
                equipmentCtrl.equipmentList = data;
              });
            }
])
.directive('equipmentSelect', function(){
  return {
    restrict: "E",
    bindToController: true,
    scope: {
      equipmentId: '='
    },
    controller: 'RecipeEquipmentCtrl',
    controllerAs: 'equipmentCtrl',
    templateUrl: 'app/recipes/equipment/equipment-select-tmpl.html'
  };
});
