Brewday.controller('SessionDestroyCtrl',  ['$scope', '$state', 'AuthService',
    function($scope, $state, AuthService ){
            AuthService.logout();
            $scope.isLoggedIn = false;
            $state.go('home')
        }
])
