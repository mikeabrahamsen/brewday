describe("Equipment Profile", function() {
  var $scope;
  var $httpBackend;
  var equipmentController;
  var $controller;
  var $state;
  var EquipmentProfile;

  beforeEach(module("ui.router"));
  beforeEach(module("settings"));
  beforeEach(module("brewday.models.equipment"));
  beforeEach(module("restangular"));
  beforeEach(inject(function($rootScope, _$httpBackend_, _$controller_, _$state_, _EquipmentProfile_) {
    $httpBackend = _$httpBackend_;
    $state = _$state_;
    $scope = $rootScope;
    $controller = _$controller_;
    EquipmentProfile = _EquipmentProfile_;

  }));
  describe('creating an equipment profile', function() {
    beforeEach(function(){
      $httpBackend.expect('POST', '/equipment').respond(200, '[{"id": 1}]');
      equipmentController = $controller("EquipmentCreateCtrl", {$state: $state, EquipmentProfile: EquipmentProfile});
    });
    it('should have a controller', function() {
      expect(equipmentController).toBeDefined();
    });
    it('should have a create function', function() {
      expect(equipmentController.createProfile).toBeDefined();
    });
    it('should call /equipment url', function() {
      var trubLoss = 1;
      var equipmentLoss = 2;
      var fermenterLoss = 3;
      equipmentController.createProfile(trubLoss, equipmentLoss, fermenterLoss);
      $httpBackend.flush();
    });
  });

  describe('profile list', function() {
    beforeEach(function(){
      $httpBackend.expect('GET', '/equipment').respond(200, '[{"id": 1}]');
      var profiles = [{},{}];
      equipmentController = $controller("EquipmentListCtrl", {$state: $state, equipmentProfiles: profiles});
    });
    it('should have profiles', function() {
      expect(equipmentController.equipmentProfiles.length).toBe(2);
    });
    it('should request all profiles', function() {
      var profiles = EquipmentProfile.get().$object;
      $httpBackend.flush();
      equipmentController = $controller("EquipmentListCtrl", {$state: $state, equipmentProfiles: profiles});
      expect(equipmentController.equipmentProfiles.length).toBe(1);
    });

  });

});
