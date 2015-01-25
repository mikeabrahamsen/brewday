Brewday.controller('ApplicationCtrl',  ['$scope', '$location', '$window', 'AuthService',
    function($scope, $location, $window,AuthService){
        $scope.AuthService = AuthService; // important! to make the watch code below work
        $scope.$watch('AuthService.isAuthenticated()', function(newVal) {
            $scope.isLoggedIn = newVal;
        });
}
])
