angular.module('recipes.additions',[
  'recipes.additions.hops',
  'recipes.additions.grains'
])
.directive('additionsForm', function(){
  return {
    restrict: "E",
    scope: {
      additions: '=',
      toDelete: '=',
    },
    controller: "AdditionFormCtrl",
    controllerAs: "additionCtrl",
    bindToController: true,
    templateUrl: 'app/recipes/additions/additions-form.html'
  };
})
.controller(
  'AdditionFormCtrl', ['Hop','Grain','AdditionService',
    function(Hop, Grain, AdditionService){
      var additionCtrl = this;
      var original_additions = [];
      this.options = {grains: [], hops: []};

      AdditionService.setDefaultAdditions(this.additions, original_additions);
      this.addNewAddition = function(additionType) {
        return AdditionService.addNewAddition(additionType, this.additions);
      };
      AdditionService.setOptions(this.additions, this.options);

      this.removeAddition = function(addition){
        AdditionService.removeAddition(
          addition,
          this.additions,
          original_additions,
          this.toDelete);
      };
    }
])
.service('AdditionService', ['Hop', 'Grain', function(Hop, Grain) {
  this.HopModel = Hop;
  this.GrainModel = Grain;
  var addService = this;

  this.getFunctionName = function(additionType) {
    return additionType.charAt(0).toUpperCase() + additionType.substring(1).slice(0,-1) + 'Model';
  };
  this.addNewAddition = function(additionType,additions) {
    var addType = additionType + 's';
    var newItemNo = additions[addType].length+1;
    var newAddition = {'id': additionType + newItemNo, 'additionType': additionType};
    additions[addType].push(newAddition);
    return newAddition;
  };
  this.setOptions = function(additions,options) {
    _.each(additions, function(addition, additionType) {
      options[additionType] =
        addService[addService.getFunctionName(additionType)].getAll().$object;
    });
    return options;
  };
  this.setDefaultAdditions = function(additions, original_additions) {
    _.each(additions, function(t, additionType) {
      if(t.length < 1)
        additions[additionType] = [{id: additionType.slice(0,-1) + '1', additionType: additionType.slice(0,-1)}];
      else{
        original_additions.push.apply(original_additions, t);
      }
    });
    return;
  };

  this.removeAddition = function(addition, additions_list, original_additions, toDelete){
    if (original_additions.indexOf(addition) > -1){
      toDelete.push(addition);
    }
    var list = additions_list[addition.additionType + 's'];
    list.splice(list.indexOf(addition), 1 );
  };
}
]);
