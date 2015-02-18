angular.module('brewday.models.addition',[

])
.factory('Addition', function(Restangular) {
    var Addition;
    Addition = {
        get: function(data) {
            return Restangular.one('recipes',data).getList('additions');
        },
        getAll: function() {
            return Restangular.one('additions').getList();
        },
        add: function(data){
            return Restangular.one('recipes', data.recipe_id).post('additions', data);
        }
    };
    return Addition;
});
