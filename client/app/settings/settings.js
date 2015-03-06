angular.module('settings',[
  'settings.equipment',
])
.config(function($stateProvider){
    $stateProvider
    .state('settings',{
        url: '/settings',
        templateUrl: 'app/settings/settings.tmpl.html',
        data:{
            authRequired: true,
        }
    });
});
