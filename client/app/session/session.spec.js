describe('Session', function(){
  var $scope;
  var $httpBackend;
  var $state;
  var createController;
  var authRequest;
  var AuthService;
  var baseUrl = 'http://localhost:5000/api/v1';

  beforeEach(module("brewday.templates"));
  beforeEach(module('Brewday'));

  beforeEach(inject(function(_$rootScope_, $controller, _AuthService_, _$httpBackend_, _$state_) {
    $scope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $state = _$state_;
    AuthService = _AuthService_;
    createController = $controller("SessionCreateCtrl", {$state: $state, AuthService: AuthService});
  }));
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  describe('session create', function() {
    it('should log in a user', function() {
      authRequest = $httpBackend.expect('POST', baseUrl + '/sessions').respond({'id':1, 'email': 'test@test.com'}, 201);
      $httpBackend.expect('GET', baseUrl + '/recipes').respond('');
      spyOn(AuthService, 'login').and.callThrough();
      createController.login('test@test.com', 'test');
      expect(AuthService.login).toHaveBeenCalledWith({email: 'test@test.com', password: 'test'});
      $httpBackend.flush();
      expect($state.current.name).toBe('recipes.list');
    });
  });
  describe('session destroy', function() {
    it('should logout a user', inject(function($controller) {
      spyOn(AuthService, 'logout');
      var logoutController = $controller("SessionDestroyCtrl", {$state: $state, AuthService: AuthService});
      $scope.$apply();
      expect(AuthService.logout).toHaveBeenCalled();
      expect(logoutController.isLoggedIn).toBe(false);
      expect($state.current.name).toBe('home');
    }));
  });
});
