angular.module('brewday.models.equipment',[

])
.factory('EquipmentProfile', function(Restangular) {
    var EquipmentProfile;
    EquipmentProfile = {
        get: function() {
            return Restangular.all('equipment').getList();
        },
        create: function(data) {
            return Restangular.one('equipment').post(data);
        },
        getOne: function(data) {
            return Restangular.one('equipment',data).get();
        },
    };
    return EquipmentProfile;
});
