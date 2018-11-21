require('angular');

angular.module('DDKApp').controller("migrationController", ["$scope", "$http", "$rootScope", "$interval", "$window", function ($scope, $http, $rootScope, $interval, $window) {

   // $scope.height = null;
    $scope.height = 0;
    $scope.total = 1072753;

    $scope.getTransactionCount = function () {
        $http.get($rootScope.serverUrl + "/api/transactions/count")
            .then(function (resp) {
                if (resp.data.success) {
                    $scope.currentTxn = resp.data.confirmed;
                    $scope.loadingState = (($scope.currentTxn/$scope.total)*100).toFixed(3);
                    console.log("No. of Transactions : ",$scope.currentTxn);
                }
            });
    }

    $scope.getTransactionCount();

    $scope.heightInterval = $interval(function () {
        $scope.getTransactionCount();
    }, 2000);

}]);
