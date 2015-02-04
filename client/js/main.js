window.Brewday = angular.module('Brewday', ['ngRoute', 'restangular', 'LocalStorageModule', 'ui.router'])

.run(function($location, Restangular, AuthService) {
    Restangular.setFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
        headers['Authorization'] = 'Basic ' + AuthService.getToken();
        return {
            headers: headers
        };
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

    var partialsDir = '../partials';

    var redirectIfAuthenticated = function(route) {
        return function($location, $q, AuthService) {

            var deferred = $q.defer();

            if (AuthService.isAuthenticated()) {
                deferred.reject()
                $location.path(route);
            } else {
                deferred.resolve()
            }

            return deferred.promise;
        }
    }

    var redirectIfNotAuthenticated = function(route) {
        return function($location, $q, AuthService) {

            var deferred = $q.defer();

            if (! AuthService.isAuthenticated()) {
                deferred.reject()
                $location.path(route);
            } else {
                deferred.resolve()
            }

            return deferred.promise;
        }
    }

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: partialsDir + '/home/detail.html'
        })
        .state('login',{
            url: 'sessions/create',
            controller: 'SessionCreateCtrl',
            templateUrl: partialsDir + '/session/create.html',
        })
        .state('logout',{
            url: 'sessions/destroy',
            controller: 'SessionDestroyCtrl',
            templateUrl: partialsDir + '/session/destroy.html'
        })
        .state('register',{
            url: 'users/create',
            controller: 'UserCreateCtrl',
            templateUrl: partialsDir + '/user/create.html'
        })
        .state('recipes',{
            abstract: true,
            url: '/recipes',
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/index.html',
            resolve: {
                recipes: ['Recipe',
                function(recipes){
                    return recipes.get();
                }]
            }
        })
        .state('recipes.list',{
            url: '',
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/list.html',
        })
        .state('recipes.create',{
            url: '/create',
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/create.html',
        })
        .state('recipes.view',{
            url: '/:recipe_id',
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/view.html',
        });

/*

    $routeProvider
        .when('/', {
            controller: 'HomeDetailCtrl',
            templateUrl: partialsDir + '/home/detail.html'
        })
        .when('/sessions/create', {
            controller: 'SessionCreateCtrl',
            templateUrl: partialsDir + '/session/create.html',
            resolve: {
                redirectIfAuthenticated: redirectIfAuthenticated('/home/detail.html')
            }
        })
        .when('/sessions/destroy', {
            controller: 'SessionDestroyCtrl',
            templateUrl: partialsDir + '/session/destroy.html'
        })
        .when('/users/create', {
            controller: 'UserCreateCtrl',
            templateUrl: partialsDir + '/user/create.html'
        })
        .when('/recipes/:recipe_id/edit', {
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/edit.html',
            resolve: {
                redirectIfNotAuthenticated: redirectIfNotAuthenticated('/sessions/create')
            }
        })
        .when('/recipes/:recipe_id/view', {
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/view.html',
            resolve: {
                redirectIfNotAuthenticated: redirectIfNotAuthenticated('/sessions/create')
            }
        })
        .when('/recipes/create', {
            controller: 'RecipeCtrl',
            templateUrl: partialsDir + '/recipes/create.html',
            resolve: {
                redirectIfNotAuthenticated: redirectIfNotAuthenticated('/sessions/create')
            }
        });
        */
})
