angular.module('Brewday', [
    'ui.router',
    'restangular',
    'LocalStorageModule',
    'session',
    'user',
    'recipes',
])

.run(function($rootScope, $state, $stateParams,  $location, Restangular, AuthService) {
    Restangular.addFullRequestInterceptor(function(element, operation, route, url, headers) {
        headers.Authorization = 'Basic ' + AuthService.getToken();
        return {
            headers: headers
        };
    });

    // Check to see if the user is authenticated - this is only used to update the
    // navbar
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeStart',
                   function(event, toState, toParams, fromState, fromParams) {
                       var loggedIn = AuthService.isAuthenticated();
                       toParams.isLoggedIn = loggedIn;
                       if( angular.isDefined(toState.data)){
                           if( toState.data.authRequired && !AuthService.isAuthenticated()){
                               event.preventDefault();
                               $state.go('login');
                           }
                       }
                   });
    Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
        if (response.config.bypassErrorInterceptor) {
            return true;
        } else {
            switch (response.status) {
                case 401:
                    AuthService.logout();
                    $location.path('/sessions/create');
                    break;
                default:
                    throw new Error('No handler for status code ' + response.status);
            }
            return false;
        }
    });
})

.config(function($stateProvider, $urlRouterProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('http://localhost:5000/api/v1');

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'app/home.html',
            data:{
                authRequired: false,
            }
        });
});
