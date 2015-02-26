angular.module('user',[
        'brewday.models.user'
])
.controller('UserCreateCtrl',  ['$state', 'User',
    function($state, User){
        this.register = function register(email, password){

            var user = {};
            user.email = email;
            user.password = password;

            User.create(user).then(function() {
                $state.go('login');
            });
        };
    }
])
.config(function($stateProvider){
    $stateProvider
        .state('register',{
            url: 'users/create',
            controller: 'UserCreateCtrl',
            controllerAs: 'user',
            templateUrl: 'app/users/create.html'
        });
});
