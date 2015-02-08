window.Brewday = angular.module('Brewday', ['ui.router', 'restangular', 'LocalStorageModule'])

.run(function($location, Restangular, AuthService) {
    Restangular.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
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
        .state('create',{
            url: '/create',
            controllerAs: 'recipes',
            controller: 'RecipeCreateCtrl',
            templateUrl: partialsDir + '/recipes/create.html',
        })
        .state('recipes',{
            abstract: true,
            url: '/recipes',
            controller: 'RecipeListCtrl',
            templateUrl: partialsDir + '/recipes/index.html',
            resolve: {
                recipes: ['Recipe',
                function(recipes){
                    return recipes.get();
                }],
            }
        })
        .state('recipes.list',{
            url: '',
            controller: 'RecipeListCtrl',
            templateUrl: partialsDir + '/recipes/list.html',
        })
        .state('recipes.view',{
            url: '/:recipe_id',
            templateUrl: partialsDir + '/recipes/view.html',
            controller: 'RecipeViewCtrl',
            controllerAs: 'recipes',
            resolve: {
                recipe: ['$stateParams', 'Recipe',
                function($stateParams, recipe){
                    return recipe.getOne($stateParams.recipe_id)
                }],
                hops: ['$stateParams', 'Hop',
                function($stateParams, hop){
                    return hop.get($stateParams.recipe_id)
                }],
                grains: ['$stateParams', 'Grain',
                function($stateParams, grain){
                    return grain.get($stateParams.recipe_id)
                }]
            }
        })
        .state('recipes.edit',{
            url: '/:recipe_id/edit',
            controller: 'RecipeCtrl',
            controllerAs: 'recipes',
            templateUrl: partialsDir + '/recipes/edit.html',
            resolve: {
                recipe: ['$stateParams', 'Recipe',
                function($stateParams, recipe){
                    return recipe.getOne($stateParams.recipe_id)
                }],
                additions: ['$stateParams', 'Addition',
                function($stateParams, additions){
                    return additions.get($stateParams.recipe_id)
                }],
                hops: ['$stateParams', 'Hop',
                function($stateParams, hop){
                    return hop.get($stateParams.recipe_id)
                }],
                grains: ['$stateParams', 'Grain',
                function($stateParams, grain){
                    return grain.get($stateParams.recipe_id)
                }]
            }
        });
})
