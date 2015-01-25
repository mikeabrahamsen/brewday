Brewday.controller('SessionDestroyCtrl',  ['$scope', '$location', '$window', 'AuthService',
    function($scope, $location, $window, AuthService ){
            AuthService.logout();
            $scope.isLoggedIn = false;
            $location.path('/sessions/create');
        }
])
