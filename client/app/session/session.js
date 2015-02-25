angular.module('session', [
        'brewday.models.session',
        'session.auth'
])
.controller('SessionCreateCtrl',  ['$scope', '$state', 'AuthService',
    function($scope, $state, AuthService ){
        $scope.login = function login(email, password){

            var user = {'email': '', 'password': ''};
            user.email = email;
            user.password = password;

             AuthService.login(user).then(function() {
                $state.go('recipes.list');
            });
        };
    }
])
.controller('SessionDestroyCtrl',  ['$scope', '$state', 'AuthService',
    function($scope, $state, AuthService ){
            AuthService.logout();
            $scope.isLoggedIn = false;
            $state.go('home');
        }
])
.config(function($stateProvider){
    $stateProvider
        .state('login',{
            url: 'sessions/create',
            controller: 'SessionCreateCtrl',
            templateUrl: 'app/session/create.html',
        })
        .state('logout',{
            url: 'sessions/destroy',
            controller: 'SessionDestroyCtrl',
            templateUrl: 'app/session/destroy.html'
        });
});
