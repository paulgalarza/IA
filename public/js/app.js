'use stric';

var app = angular.module('myApp', ['btford.socket-io']).
factory('mySocket', function (socketFactory) {
    var socket = socketFactory();
    socket.forward('broadcast');
    return socket;
}).
controller('ArduController', function ($scope,mySocket) {

    $scope.batches = [];
    $scope.flavors = ['Fresa', 'Cajeta', 'Piña'];
    $scope.pies = 0;
    var idBatch = 1;

    $scope.ledOff = function () {
        mySocket.emit('led:off');
    };

    $scope.addBatch = function(quantity,flavor){
      mySocket.emit('led:on',$scope.quantity);
      $scope.pies = $scope.pies-(-$scope.quantity);
      $scope.quantity = '';
      $scope.flavor = '';
      idBatch += 1;
    };

    $scope.cancel = function(batch){
      mySocket.emit('led:off');
    };

    $scope.$on('socket:broadcast', function(event, data) {
      $scope.pies = data.quantity;
    });

    angular.element(document).ready(function () {
        $('select').material_select();
    });
});
