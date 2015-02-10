angular.module('Brewday', [
        'ui.router',
        'restangular',
        'LocalStorageModule',
        'session',
        'user',
        'recipes',
])

.run(function($rootScope, $state, $stateParams,  $location, Restangular, AuthService) {
    Restangular.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
        headers['Authorization'] = 'Basic ' + AuthService.getToken();
        return {
            headers: headers
        };
    })

    // Check to see if the user is authenticated - this is only used to update the
    // navbar
    $rootScope.$stateParams = $stateParams;;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams
                                                  , fromState, fromParams) {
        loggedIn = AuthService.isAuthenticated();
        toParams.isLoggedIn = loggedIn;
        if( angular.isDefined(toState.data)){
            if( toState.data.authRequired && !AuthService.isAuthenticated()){
                event.preventDefault();
                $state.go('login')
            }
        }
    })
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
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
        })
        .state('login',{
            url: 'sessions/create',
            controller: 'SessionCreateCtrl',
            templateUrl: 'app/session/create.html',
        })
        .state('logout',{
            url: 'sessions/destroy',
            controller: 'SessionDestroyCtrl',
            templateUrl: 'app/session/destroy.html'
        })
        .state('register',{
            url: 'users/create',
            controller: 'UserCreateCtrl',
            templateUrl: 'app/users/create.html'
        })
        .state('recipes',{
            abstract: true,
            url: '/recipes',
            controller: 'RecipeListCtrl',
            template: '<div ui-view></div>',
            resolve: {
                recipes: ['Recipe',
                function(recipes){
                        return recipes.get();
                }],
            },
            data:{
                authRequired: true,
            }
        })
        .state('recipes.list',{
            url: '',
            controller: 'RecipeListCtrl',
            templateUrl: 'app/recipes/list.html',
        })
        .state('recipes.create',{
            url: '/create',
            controllerAs: 'recipes',
            controller: 'RecipeCreateCtrl',
            templateUrl: 'app/recipes/create/create.html',
        })
        .state('recipes.view',{
            url: '/:recipe_id',
            templateUrl: 'app/recipes/view/view.html',
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
            templateUrl: 'app/recipes/edit/edit.html',
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
        });
})
