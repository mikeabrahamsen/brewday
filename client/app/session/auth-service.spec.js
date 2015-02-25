describe('Auth Service', function() {
  var AuthService;
  var $scope;
  var $httpBackend;
  var authRequest;
  beforeEach(module('ui.router'));
  beforeEach(module('restangular'));
  beforeEach(module('LocalStorageModule'));
  beforeEach(module('session.auth'));
  beforeEach(inject(function(_$rootScope_, _AuthService_, _$httpBackend_) {
    $scope = _$rootScope_;
    AuthService = _AuthService_;
    $httpBackend = _$httpBackend_;
    authRequest = $httpBackend.expect('POST', '/sessions').respond({'id':1, 'email': 'test@test.com'}, 201);
    AuthService.logout();
  }));
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  describe('login', function() {
    it('should return a promise', function() {
      var promise = AuthService.login('test@test.com', 'pass');
      expect(promise).toBeDefined();
      $httpBackend.flush();
      expect(promise.$$state.value.email).toBe('test@test.com');
      expect(AuthService.isAuthenticated()).toBe(true);
    });
    it('should not login if invalid user', function() {
      authRequest.respond(401, '');
      var promise = AuthService.login('test@test.com', 'pss');
      $httpBackend.flush();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
    it('should not login if invalid form data', function() {
      authRequest.respond(422, '');
      var req = AuthService.login('test.com', '');
      $httpBackend.flush();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });
  describe('logout', function() {
    it('should no longer have the user authenticated', function() {
      var user = AuthService.login('test@test.com', 'pass');
      $httpBackend.flush();
      expect(AuthService.isAuthenticated()).toBe(true);

      AuthService.logout();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });
});
