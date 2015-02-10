Brewday.controller('SessionCreateCtrl',  ['$scope', '$state', 'AuthService',
    function($scope, $state, AuthService ){
        $scope.data = {};
        $scope.login = function login(email, password){

            var user = {'email': '', 'password': ''};
            user.email = email;
            user.password = password;

             AuthService.login(user).then(function() {
                $state.go('recipes.list')
            });
        }
    }
])
