require('angular');


angular.module('DDKApp').controller('passphraseController', ['$scope', '$rootScope', '$http', "$state", "userService", "newUser", 'gettextCatalog', '$cookies', '$window', 'agreeConfirmationModal', function ($scope, $rootScope, $http, $state, userService, newUser, gettextCatalog, $cookies, $window, agreeConfirmationModal) {

    userService.setData();
    userService.rememberPassphrase = false;
    userService.rememberedPassphrase = '';
    $scope.rememberPassphrase = true;
    $scope.errorMessage = "";



    $scope.cleanUpUserData = function () {
        var userProperties = ['address', 'allVotes', 'balance', 'balanceToShow', 'dataToShow', 'unconfirmedBalance',
            'unconfirmedPassphrase', 'username', 'rememberedPassphrase', 'publicKey', 'delegate'];
        for (var i = 0; i < userProperties.length; i++) {
            if ($rootScope[userProperties[i]] != undefined) {
                $rootScope[userProperties[i]] = null;
            }
        }
    }
    $scope.cleanUpUserData();

    $scope.newUser = function () {
        $scope.newUserModal = newUser.activate({
            destroy: function () {
            }
        });
    }
       $scope.login = function (pass, remember) {
        if (!pass || pass.trim().split(/\s+/g).length < 12) {
            $scope.errorMessage = 'Passphrase must consist of 12 or more words.';
            return;
        }
        if (pass.length > 100) {
            $scope.errorMessage = 'Passphrase must contain less than 100 characters.';
            return;
        }
        if (!Mnemonic.isValid(pass)) {
            $scope.errorMessage = 'Passphrase must be a valid BIP39 mnemonic code.';
            return;
        }
        var data = { secret: pass };
        $scope.errorMessage = "";
        $http.post($rootScope.serverUrl + "/api/accounts/open/", { secret: pass }).then(function (resp) {
            if (resp.data.success) {
                $window.localStorage.setItem('token', resp.data.account.token);
                userService.setData(resp.data.account.address, resp.data.account.publicKey, resp.data.account.balance, resp.data.account.unconfirmedBalance, resp.data.account.effectiveBalance, resp.data.account.token, resp.data.account.totalFrozeAmount, resp.data.account.username, resp.data.account.groupBonus);
                userService.setForging(resp.data.account.forging);
                userService.setSecondPassphrase(resp.data.account.secondSignature || resp.data.account.unconfirmedSignature);
                userService.unconfirmedPassphrase = resp.data.account.unconfirmedSignature;
                if (remember) {
                    userService.setSessionPassphrase(pass);
                }

                var goto = $cookies.get('goto');
                if (goto) {
                    $state.go(goto);
                } else {
                    $state.go('main.dashboard');
                    //MODAL CALL

                    
/*                  $scope.agreeConfirmationModal = agreeConfirmationModal.activate({
            
                }); */
                  
                }
            } else {
                $scope.errorMessage = resp.data.error ? resp.data.error : 'Error connecting to server';
            }
        }, function (error) {
            $scope.errorMessage = error.data.error ? error.data.error : error.data;
        });
    }

    var passphrase = $cookies.get('passphrase');
    if (passphrase) {
        $scope.login(passphrase);
    }

}]);
