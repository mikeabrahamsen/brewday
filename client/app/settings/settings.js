angular.module('settings',[
  'settings.equipment',
])
.config(function($stateProvider){
    $stateProvider
    .state('settings',{
        url: '/settings',
        template: '<div ui-view></div>',
        data:{
            authRequired: true,
        }
    });
});
