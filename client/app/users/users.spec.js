describe('Users', function() {
  var $scope;
  var $httpBackend;
  var $state;
  var controller;
  var UserModel;

  beforeEach(module("brewday.templates"));
  beforeEach(module("ui.router"));
  beforeEach(module("brewday.models.user"));
  beforeEach(module("restangular"));
  beforeEach(module("user"));
  beforeEach(module("session"));
  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, _$state_, User) {
    $httpBackend = _$httpBackend_;
    $state = _$state_;
    $scope = $rootScope;
    UserModel = User;

    controller = $controller("UserCreateCtrl", {$state: $state, User: UserModel});
  }));
  describe('creating a user', function() {
    beforeEach(function() {
      spyOn(UserModel, 'create').and.callThrough();
      controller.register('test@test.com', 'testpass');
    });
    it('should call UserModel create', function() {
      expect(UserModel.create)
      .toHaveBeenCalledWith({email: 'test@test.com', password: 'testpass'});
    });
    it('should post to users', function() {
      $httpBackend.expect('POST', '/users').respond('');
      $httpBackend.flush();
    });
    it('should move to login state', function() {
      $httpBackend.expect('POST', '/users').respond('');
      $httpBackend.flush();
      expect($state.current.name).toBe('login');
    });
  });
});
