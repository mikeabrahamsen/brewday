angular.module('recipes.additions',[
    'ui.select',
    'ngSanitize'
])
.directive('additionsForm', function(){
  return {
    restrict: "E",
    scope: {
      additions: '=',
      toDelete: '=',
      recipe: '=',
      showGrains: '@',
      showHops: '@'
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

      AdditionService.setDefaultAdditions(this.additions, original_additions, this.recipe);

      this.addNewAddition = function(addition_type) {
        return AdditionService.addNewAddition(addition_type, this.additions, additionCtrl.recipe);
      };

      AdditionService.setOptions(this.additions, this.options,
                                 this.showGrains, this.showHops);
      this.removeAddition = function(addition){
        AdditionService.removeAddition(
          addition,
          this.additions,
          original_additions,
          this.toDelete);
      };
    }
])
.service('AdditionService', ['Hop', 'Grain', 'Restangular',function(Hop, Grain, Restangular) {
  this.HopModel = Hop;
  this.GrainModel = Grain;
  var addService = this;

  function stripS(additionType){
    if (additionType.slice(-1) === 's'){
      additionType = additionType.slice(0,-1);
    }
    return additionType;
  }
  function addS(additionType){
    if (additionType.slice(-1) != 's'){
      additionType = additionType + 's';
    }
    return additionType;
  }
  this.getModelName = function(addition_type) {
    addition_type = stripS(addition_type);
    return addition_type.charAt(0).toUpperCase() + addition_type.substring(1) + 'Model';
  };
  this.addNewAddition = function(addition_type,additions, recipe) {
    var addGroup = addS(addition_type);
    var newItemNo = additions[addGroup].length+1;
    var newAddition = {'recipe_id': undefined, 'brew_stage': 0, 'addition_type': stripS(addGroup), amount: 0};
    // if we have the recipe - make a restangular object
    if(typeof(recipe.id) !== 'undefined'){
      newAddition.recipe_id = recipe.id;
      Restangular.restangularizeElement(recipe, newAddition, addGroup);
    }
    additions[addGroup].push(newAddition);
    return newAddition;
  };
  this.setOptions = function(additions, options, showGrains, showHops) {
    showGrains = (typeof showGrains === 'undefined') ? true : showGrains;
    showHops = (typeof showHops === 'undefined') ? true : showHops;
    _.each(additions, function(addition, addition_type) {
      if( (addition_type == 'grains' && showGrains)
        || (addition_type == 'hops' && showHops)){
          options[addition_type] =
            addService[addService.getModelName(addition_type)].getAll().$object;
        }
    });
    return options;
  };
  this.setDefaultAdditions = function(additions, original_additions, recipe) {
    _.each(additions, function(t, addition_type) {
      if(t.length < 1){
        addService.addNewAddition(addition_type, additions, recipe);
      }
      else{
        original_additions.push.apply(original_additions, t);
      }
    });
    return additions;
  };

  this.removeAddition = function(addition, additions_list, original_additions, toDelete){
    if (original_additions.indexOf(addition) > -1){
      toDelete.push(addition);
    }
    var list = additions_list[addS(addition.addition_type)];
    list.splice(list.indexOf(addition), 1 );
  };
}
]);
