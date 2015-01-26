Brewday.controller('SessionCreateCtrl',  ['$scope', '$location', '$window', 'AuthService',
    function($scope, $location, $window, AuthService ){
        $scope.data = {};
        $scope.login = function login(email, password){

            var user = {'email': '', 'password': ''};
            user.email = email;
            user.password = password;

             AuthService.login(user).then(function(data) {
                 success = true;
                $location.path('/recipes/create');
            });
        }
    }
])
