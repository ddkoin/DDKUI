require('angular');

angular.module('DDKApp').controller('registrationDelegateModalController', ["$scope", "$rootScope", "registrationDelegateModal", "$http", "userService", "feeService", "delegateService", function ($scope, $rootScope, registrationDelegateModal, $http, userService, feeService, delegateService) {

    $scope.error = null;
    $scope.sending = false;
    $scope.passmode = false;
    $scope.delegate = userService.delegate;
    $scope.isSecondPassphrase = userService.secondPassphrase;
    $scope.delegateData = {username: ''};
    $scope.secondPassphrase = userService.secondPassphrase;
    $scope.rememberedPassphrase = userService.rememberPassphrase ? userService.rememberedPassphrase : false;
    $scope.focus = 'username';
    $scope.ddkfoundation=false;

    $scope.close = function () {
        if ($scope.destroy) {
            $scope.destroy();
        }

        registrationDelegateModal.deactivate();
        angular.element(document.querySelector("body")).removeClass("ovh");
    }
    if(userService.address === "DDK8999840344646463126"){
        $scope.ddkfoundation = true;
    }

    function validate(onValid) {
        var isAddress = /^(DDK)+[0-9]+$/ig;
        var allowSymbols = /^[a-z0-9!@$&_.]+$/g;
        var isCorrectURL = /^(http[s]?:\/\/){1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/g;

        $scope.delegateData.username = $scope.delegateData.username.trim();

        if ($scope.delegateData.username == "") {
            $scope.error = "Empty username";
        } else if ($scope.delegateData.username.length > 20) {
            $scope.error = "Username is too long. Maximum is 20 characters";
        } else {
            if (!isAddress.test($scope.delegateData.username)) {
                if (allowSymbols.test($scope.delegateData.username.toLowerCase())) {
                    if ($scope.delegateData.URL && !isCorrectURL.test($scope.delegateData.URL)) {
                        $scope.error = "Please enter valid URL";
                    } else if ($scope.delegateData.URL && $scope.delegateData.URL.length > 100) {
                        $scope.error = "URL is too long. Maximum 100 characters allowed";
                    } else {
                        return onValid();
                    }
                } else {
                    $scope.error = "Username can only contain alphanumeric characters with the exception of !@$&_.";
                }
            } else {
                $scope.error = "Username cannot be a potential address";
            }
        }
    }

    $scope.passcheck = function (fromSecondPass) {
        $scope.error = null;
        if (fromSecondPass) {
            $scope.checkSecondPass = false;
            $scope.passmode = $scope.rememberedPassphrase ? false : true;
            $scope.secondPhrase = '';
            $scope.pass = '';
            if ($scope.passmode) {
                $scope.focus = 'secretPhrase';
            } else {
                $scope.focus = 'username';
            }
            return;
        }

        if ($scope.rememberedPassphrase) {
            validate(function () {
                $scope.error = null;
                $scope.registrationDelegate($scope.rememberedPassphrase);
            });
        } else {
            validate(function () {
                $scope.error = null;
                $scope.focus = 'secretPhrase';
                $scope.passmode = !$scope.passmode;
                $scope.pass = '';
            });
        }
    }

    $scope.registrationDelegate = function (pass, withSecond) {
        if ($scope.secondPassphrase && !withSecond) {
            $scope.focus = 'secondPhrase';
            $scope.checkSecondPass = true;
            return;
        }

        pass = pass || $scope.secretPhrase;

        $scope.error = null;

        var data = {
            secret: pass,
            secondSecret: $scope.secondPhrase,
            publicKey: userService.publicKey
        };

        if ($scope.delegateData.username.trim() != '') {
            data.username = $scope.delegateData.username.trim()
        }

        if ($scope.secondPassphrase) {
            data.secondSecret = $scope.secondPhrase;
            if ($scope.rememberedPassphrase) {
                data.secret = $scope.rememberedPassphrase;
            }
        }

        if ($scope.delegateData.URL) {
            data.URL = $scope.delegateData.URL;
        }

        if (!$scope.sending) {
            $scope.sending = true;

            $http.put($rootScope.serverUrl + "/api/delegates/", data)
                .then(function (resp) {
                    $scope.sending = false;
                    userService.setDelegateProcess(resp.data.success);

                    if (resp.data.success) {
                        if ($scope.destroy) {
                            $scope.destroy();
                        }

                        Materialize.toast('Transaction sent', 3000, 'green white-text');
                        registrationDelegateModal.deactivate();
                    } else {
                        Materialize.toast('Transaction error', 3000, 'red white-text');
                        $scope.error = resp.data.error;
                    }
                });
        }
    }

    feeService(function (fees) {
        $scope.fee = fees.delegate;
    });

}]);
