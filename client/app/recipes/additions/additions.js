angular.module('recipes.additions',[
  'recipes.additions.hops',
  'recipes.additions.grains'
])
.controller('AdditionFormCtrl', ['Hop','Grain',
        function(Hop, Grain){
        var additionFormCtrl = this;
        var original_additions = [];
        this.HopModel = Hop;
        this.GrainModel = Grain;

        this.additionTypeName = function(){
          return this.additionType.toLowerCase() + 's';};
        this.addFunctionName = function(){
          return "addNew" + this.additionType;};
        this.removeFunctionName = function(){
          return "remove" + this.additionType;};
        this.optionFunctionName = function(){
          return this.additionType.toLowerCase() + "_options";};
        this.getFunctionName = function(){
          return this.additionType + "Model";};

        this[this.additionTypeName()] = this.additions;

        if(this.additions.length < 1)
            this.additions = [{id: this.additionType + '1'}];
        else
            original_additions = this.additions.slice(0);


        this[this.optionFunctionName()] = this[this.getFunctionName()].getAll().$object;

        this[this.addFunctionName()] = function() {
            var newItemNo = this.additions.length+1;
            this.additions.push({'id':this.additionTypeName() + newItemNo});
        };

        this[this.removeFunctionName()] = function(addition) {
            // if the grain to be deleted is part of the recipe
            // flag it for deletion
            if (original_additions.indexOf(addition) > -1)
            {
                this.toDelete.push(addition);
            }
            this.additions.splice( this.additions.indexOf(addition), 1 );
        };
        }
]);
