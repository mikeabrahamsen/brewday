angular.module('settings.equipment',[
  'brewday.models.equipment'
])
.controller('EquipmentCreateCtrl',  ['$state', 'EquipmentProfile',
        function($state, EquipmentProfile){

        var equipCreateCtrl = this;
        this.createProfile = function(name, trubLoss, equipmentLoss, fermenterLoss) {
          var profile = {
            "name": name,
            "trubLoss": trubLoss,
            "equipmentLoss": equipmentLoss,
            "fermenterLoss": fermenterLoss
          };
          EquipmentProfile.create(profile);
          $state.go('settings.equipmentList');
        };
        }
])
.controller('EquipmentEditCtrl',  ['$state','equipmentProfile',
        function($state, equipmentProfile){
        var equipEditCtrl = this;
        this.profile = equipmentProfile;
        equipEditCtrl.createProfile = function(name, trubLoss, equipmentLoss, fermenterLoss) {
          equipEditCtrl.profile.name = name;
          equipEditCtrl.profile.trubLoss = trubLoss;
          equipEditCtrl.profile.equipmentLoss = equipmentLoss;
          equipEditCtrl.profile.fermenterLoss = fermenterLoss;
          equipEditCtrl.profile.save();
          $state.go('settings.equipmentList');
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
              this.delete = function(recipe){
                equipmentView.profile.remove();
                $state.go('settings.equipment',{}, {reload: true});
              };

            }
])
.config(function($stateProvider){
    $stateProvider
        .state('settings.equipment',{
            url: '/equipment',
            template: '<div ui-view></div>',
            abstract: true,
        })
        .state('settings.equipmentList',{
            url: '',
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
            url: '/createEquipmentProfile',
            controllerAs: 'equipment',
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
        })
        .state('settings.equipmentEdit',{
            url: '/equipment/:profileId/edit',
            controllerAs: 'equipment',
            controller: 'EquipmentEditCtrl',
            templateUrl: 'app/settings/equipment/equipment-form.html',
            resolve: {
                equipmentProfile: ['$stateParams', 'EquipmentProfile',
                function($stateParams, profile){
                    return profile.getOne($stateParams.profileId);
                }],
            }
        });
});
