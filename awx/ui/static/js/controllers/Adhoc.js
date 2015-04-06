/*************************************************
 * Copyright (c) 2015 AnsibleWorks, Inc.
 *
 *  Adhoc.js
 *
 *  Controller functions for the Adhoc model.
 *
 */
/**
 * @ngdoc function
 * @name controllers.function:Adhoc
 * @description This controller controls the adhoc form creation, command launching and navigating to standard out after command has been succesfully ran.
*/
export function AdhocCtrl($scope, $rootScope, $location, $routeParams,
    AdhocForm, GenerateForm, Rest, ProcessErrors, ClearScope, GetBasePath,
    GetChoices, KindChange, LookUpInit, CredentialList, Empty, OwnerChange,
    LoginMethodChange, Wait) {

    ClearScope();

    var url = GetBasePath('inventory') + $routeParams.inventory_id +
        '/ad_hoc_commands/',
        generator = GenerateForm,
        form = AdhocForm,
        master = {},
        id = $routeParams.inventory_id;

    // inject the adhoc command form
    generator.inject(form, { mode: 'edit', related: true, scope: $scope });
    generator.reset();

    // BEGIN: populate scope with the things needed to make the adhoc form
    // display
    Wait('start');
    $scope.id = id;
    $scope.argsPopOver = "<p>These arguments are used with the" +
        " specified module.</p>";
    // fix arguments help popover based on the module selected
    $scope.moduleChange = function () {
        // NOTE: for selenium testing link -
        // link will be displayed with id adhoc_module_arguments_docs_link
        // only when a module is selected
        if ($scope.module_name) {
            // give the docs for the selected module
            $scope.argsPopOver = "<p>These arguments are used with the" +
                " specified module. You can find information about the " +
                $scope.module_name.value +
                " <a id=\"adhoc_module_arguments_docs_link_for_module_" +
                $scope.module_name.value +
                "\"" +
                " href=\"http://docs.ansible.com/" + $scope.module_name.value +
                "_module.html\" target=\"_blank\">here</a>.</p>";
        } else {
            // no module selected
            $scope.argsPopOver = "<p>These arguments are used with the" +
                " specified module.</p>";
        }
    };

    // pre-populate hostPatterns from the inventory page and
    // delete the value off of rootScope
    $scope.limit = $rootScope.hostPatterns || "all";
    $scope.providedHostPatterns = $scope.limit;
    delete $rootScope.hostPatterns;

    if ($scope.removeChoicesReady) {
        $scope.removeChoicesReady();
    }
    $scope.removeChoicesReady = $scope.$on('choicesReadyAdhoc', function () {
        LookUpInit({
            scope: $scope,
            form: form,
            current_item: (!Empty($scope.credential_id)) ? $scope.credential_id : null,
            list: CredentialList,
            field: 'credential',
            input_type: 'radio'
        });

        OwnerChange({ scope: $scope });
        LoginMethodChange({ scope: $scope });

        Wait('stop'); // END: form population
    });

    // setup Machine Credential lookup
    GetChoices({
        scope: $scope,
        url: url,
        field: 'module_name',
        variable: 'adhoc_module_options',
        callback: 'choicesReadyAdhoc'
    });

    // Handle Owner change
    $scope.ownerChange = function () {
        OwnerChange({ scope: $scope });
    };

    // Handle Login Method change
    $scope.loginMethodChange = function () {
        LoginMethodChange({ scope: $scope });
    };

    // Handle Kind change
    $scope.kindChange = function () {
        KindChange({ scope: $scope, form: form, reset: true });
    };

    // launch the job with the provided form data
    $scope.launchJob = function () {
        var fld, data={};

        // stub the payload with defaults from DRF
        data = {
            "job_type": "run",
            "limit": "",
            "credential": null,
            "module_name": "command",
            "module_args": "",
            "forks": 0,
            "verbosity": 0,
            "privilege_escalation": ""
        };

        generator.clearApiErrors();

        // populate data with the relevant form values
        for (fld in form.fields) {
            if (form.fields[fld].type === 'select') {
                data[fld] = $scope[fld].value;
            } else {
                data[fld] = $scope[fld];
            }
        }

        Wait('start');

        // Launch the adhoc job
        Rest.setUrl(url);
        Rest.post(data)
            .success(function (data) {
                 Wait('stop');
                 $location.path("/ad_hoc_commands/" + data.id);
            })
            .error(function (data, status) {
                ProcessErrors($scope, data, status, form, { hdr: 'Error!',
                    msg: 'Failed to launch adhoc command. POST returned status: ' +
                        status });
                // TODO: still need to implement popping up a password prompt
                // if the credential requires it.  The way that the current end-
                // point works is that I find out if I need to ask for a
                // password from POST, thus I get an error response.
            });
    };

    // Remove all data input into the form
    $scope.formReset = function () {
        generator.reset();
        for (var fld in master) {
            $scope[fld] = master[fld];
        }
        $scope.limit = $scope.providedHostPatterns;
        KindChange({ scope: $scope, form: form, reset: false });
        OwnerChange({ scope: $scope });
        LoginMethodChange({ scope: $scope });
    };
}

AdhocCtrl.$inject = ['$scope', '$rootScope', '$location', '$routeParams',
    'AdhocForm', 'GenerateForm', 'Rest', 'ProcessErrors', 'ClearScope',
    'GetBasePath', 'GetChoices', 'KindChange', 'LookUpInit', 'CredentialList',
    'Empty', 'OwnerChange', 'LoginMethodChange', 'Wait'];
