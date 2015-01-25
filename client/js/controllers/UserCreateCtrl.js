Brewday.controller('UserCreateCtrl',  ['$scope', '$location', '$window', 'User',
    function($scope, $location, $window, User){
        $scope.data = {};
        $scope.register = function register(formIsValid, email, password){

            var user = {'email': '', 'pass': ''};
            user.email = email;
            user.password = password;

            var u = User.create(user).then(function(data) {
                $location.path('/sessions/create');
            });
        }
    }
])
