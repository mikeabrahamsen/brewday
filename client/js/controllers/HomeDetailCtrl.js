Brewday.controller('HomeDetailCtrl',  ['$scope', '$location', '$window', 'Recipe',
    function($scope, $location, $window,Recipe){
        $scope.recipes = Recipe.get().$object;
    }
])
