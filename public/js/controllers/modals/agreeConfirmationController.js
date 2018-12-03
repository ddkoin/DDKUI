require('angular');

angular.module('DDKApp').controller('agreeConfirmationController', ["$scope", "$http", "$rootScope", "userService", "agreeConfirmationModal", function ($scope, $http, $rootScope, userService, agreeConfirmationModal) {


    // console.log("showFUll TIme"+$scope.showFullTime); 
    // $scope.check = function(){
    //     console.log("check value------"+$scope.showFullTime)
    // }

    $scope.agreeConfirmation = function () {


        console.log("Damini");
        if ($scope.showFullTime == true) {
            $http.post($rootScope.serverUrl + '/api/accounts/updateUserStatus', {
                address: userService.address,
                status: "AGREED"
            })
                .then(function (resp) {
                    if (resp.data.success) {
                        Materialize.toast('You have successfully agreed to DDK Terms & Conditions Agreement', 3000, 'green white-text');
                        agreeConfirmationModal.deactivate();
                    } else {
                        Materialize.toast('Sent Error', 5000, 'red white-text');
                    }

                });

        } else {
            Materialize.toast('Please read  all terms and conditions', 3000, 'red white-text');
        }

    }
}]);




