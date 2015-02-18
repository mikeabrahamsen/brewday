angular.module('recipes.additions',[
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

      this.addNewAddition = function(addition_type) {
        return AdditionService.addNewAddition(addition_type, this.additions);
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

  this.getFunctionName = function(addition_type) {
    return addition_type.charAt(0).toUpperCase() + addition_type.substring(1).slice(0,-1) + 'Model';
  };
  this.addNewAddition = function(addition_type,additions) {
    var addType = addition_type + 's';
    var newItemNo = additions[addType].length+1;
    var newAddition = {'id': addition_type + newItemNo, 'addition_type': addition_type};
    additions[addType].push(newAddition);
    return newAddition;
  };
  this.setOptions = function(additions,options) {
    _.each(additions, function(addition, addition_type) {
      options[addition_type] =
        addService[addService.getFunctionName(addition_type)].getAll().$object;
    });
    return options;
  };
  this.setDefaultAdditions = function(additions, original_additions) {
    _.each(additions, function(t, addition_type) {
      if(t.length < 1)
        additions[addition_type] = [{id: addition_type.slice(0,-1) + '1', addition_type: addition_type.slice(0,-1)}];
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
    var list = additions_list[addition.addition_type + 's'];
    list.splice(list.indexOf(addition), 1 );
  };
}
]);
