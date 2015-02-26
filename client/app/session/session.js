angular.module('session', [
        'brewday.models.session',
        'session.auth'
])
.controller('SessionCreateCtrl',  ['$state', 'AuthService',
    function($state, AuthService ){
        this.login = function login(email, password){

            var user = {'email': '', 'password': ''};
            user.email = email;
            user.password = password;

             AuthService.login(user).then(function() {
                $state.go('recipes.list');
            });
        };
    }
])
.controller('SessionDestroyCtrl',  ['$state', 'AuthService',
    function($state, AuthService ){
            AuthService.logout();
            this.isLoggedIn = false;
            $state.go('home');
        }
])
.config(function($stateProvider){
    $stateProvider
        .state('login',{
            url: 'sessions/create',
            controller: 'SessionCreateCtrl',
            controllerAs: 'session',
            templateUrl: 'app/session/create.html',
        })
        .state('logout',{
            url: 'sessions/destroy',
            controller: 'SessionDestroyCtrl',
            controllerAs: 'session',
            templateUrl: 'app/session/destroy.html'
        });
});
