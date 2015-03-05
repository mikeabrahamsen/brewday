angular.module('settings.equipment',[
  'brewday.models.equipment'
])
.controller('EquipmentCreateCtrl',  ['$state', 'EquipmentProfile',
        function($state, EquipmentProfile){

        var equipCreateCtrl = this;
        equipCreateCtrl.createProfile = function(name, trubLoss, equipmentLoss, fermenterLoss) {
          var profile = {
            "name": name,
            "trub_loss": trubLoss,
            "equipment_loss": equipmentLoss,
            "fermenter_loss": fermenterLoss
          };
          EquipmentProfile.create(profile);
        };
        }
])
.controller('EquipmentListCtrl',  ['$state', 'equipmentProfiles',
            function($state, equipmentProfiles){
              var equipmentList = this;
              this.equipmentProfiles = equipmentProfiles;
            }
])
.config(function($stateProvider){
    $stateProvider
        .state('settings.equipment',{
            url: '/equipment',
            controllerAs: 'equipmentList',
            controller: 'EquipmentListCtrl',
            template: '<div ui-view>Equipment List</div>',
            resolve: {
              equipmentProfiles: ['EquipmentProfile',
                function(equipment){
                  return equipment.get();
                }],
            },
        })
        .state('settings.equipment.create',{
            url: '/new',
            controllerAs: 'equipmentCreate',
            controller: 'EquipmentCreateCtrl',
            templateUrl: 'app/settings/equipment/equipment-form.html',
        });
});
