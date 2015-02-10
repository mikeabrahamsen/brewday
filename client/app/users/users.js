angular.module('user',[
        'brewday.models.user'
])
.controller('UserCreateCtrl',  ['$scope', '$state', 'User',
    function($scope, $state, User){
        $scope.data = {};
        $scope.register = function register(formIsValid, email, password){

            var user = {'email': '', 'pass': ''};
            user.email = email;
            user.password = password;

            User.create(user).then(function() {
                $state.go('login')
            });
        }
    }
])
