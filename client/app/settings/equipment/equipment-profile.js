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
.controller('EquipmentViewCtrl',  ['$state', 'equipmentProfile',
            function($state, equipmentProfile){
              var equipmentView = this;
              this.readOnly = true;
              this.profile = equipmentProfile;
            }
])
.config(function($stateProvider){
    $stateProvider
        .state('settings.equipment',{
            url: '/equipment',
            controllerAs: 'equipmentList',
            controller: 'EquipmentListCtrl',
            templateUrl: 'app/settings/equipment/equipment-list.tmpl.html',
            resolve: {
              equipmentProfiles: ['EquipmentProfile',
                function(equipment){
                  return equipment.get();
                }],
            },
        })
        .state('settings.equipmentCreate',{
            url: '/new',
            controllerAs: 'equipmentCreate',
            controller: 'EquipmentCreateCtrl',
            templateUrl: 'app/settings/equipment/equipment-form.html',
        })
        .state('settings.equipmentView',{
            url: '/equipment/:profileId',
            controllerAs: 'equipmentView',
            controller: 'EquipmentViewCtrl',
            templateUrl: 'app/settings/equipment/equipment-view.tmpl.html',
            resolve: {
                equipmentProfile: ['$stateParams', 'EquipmentProfile',
                function($stateParams, profile){
                    return profile.getOne($stateParams.profileId);
                }],
            }
        });
});
