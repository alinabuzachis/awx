/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Projects
 * @description This form is for adding/editing projects
*/

export default
angular.module('ProjectFormDefinition', ['SchedulesListDefinition'])
    .factory('ProjectsFormObject', ['i18n', function(i18n) {
    return {

        addTitle: i18n._('New Project'),
        editTitle: '{{ name }}',
        name: 'project',
        basePath: 'projects',
        // the top-most node of generated state tree
        stateTree: 'projects',
        forceListeners: true,
        tabs: true,
        subFormTitles: {
            sourceSubForm: i18n._('Source Details'),
        },
        fields: {
            name: {
                label: i18n._('Name'),
                type: 'text',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)',
                required: true,
                capitalize: false
            },
            description: {
                label: i18n._('Description'),
                type: 'text',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            organization: {
                label: i18n._('Organization'),
                type: 'lookup',
                list: 'OrganizationList',
                sourceModel: 'organization',
                basePath: 'organizations',
                sourceField: 'name',
                dataTitle: i18n._('Organization'),
                required: true,
                dataContainer: 'body',
                dataPlacement: 'right',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            scm_type: {
                label: i18n._('SCM Type'),
                type: 'select',
                class: 'Form-dropDown--scmType',
                ngOptions: 'type.label for type in scm_type_options track by type.value',
                ngChange: 'scmChange()',
                required: true,
                hasSubForm: true,
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            missing_path_alert: {
                type: 'alertblock',
                ngShow: "showMissingPlaybooksAlert && scm_type.value == 'manual'",
                alertTxt: '<p class=\"text-justify\"><strong>WARNING:</strong> There are no available playbook directories in {{ base_dir }}.  ' +
                    'Either that directory is empty, or all of the contents are already assigned to other projects.  ' +
                    'Create a new directory there and make sure the playbook files can be read by the "awx" system user, ' +
                    'or have Tower directly retrieve your playbooks from source control using the SCM Type option above.</p>',
                closeable: false
            },
            base_dir: {
                label: i18n._('Project Base Path'),
                type: 'text',
                class: 'Form-textUneditable',
                showonly: true,
                ngShow: "scm_type.value == 'manual' " ,
                awPopOver: i18n._('<p>Base path used for locating playbooks. Directories found inside this path will be listed in the playbook directory drop-down. ' +
                    'Together the base path and selected playbook directory provide the full path used to locate playbooks.</p>' +
                    '<p>Use PROJECTS_ROOT in your environment settings file to determine the base path value.</p>'),
                dataTitle: i18n._('Project Base Path'),
                dataContainer: 'body',
                dataPlacement: 'right',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            local_path: {
                label: i18n._('Playbook Directory'),
                type: 'select',
                id: 'local-path-select',
                ngOptions: 'path.label for path in project_local_paths',
                awRequiredWhen: {
                    reqExpression: "pathRequired",
                    init: false
                },
                ngShow: "scm_type.value == 'manual' && !showMissingPlaybooksAlert",
                awPopOver: i18n._('<p>Select from the list of directories found in the base path.' +
                    'Together the base path and the playbook directory provide the full path used to locate playbooks.</p>' +
                    '<p>Use PROJECTS_ROOT in your environment settings file to determine the base path value.</p>'),
                dataTitle: i18n._('Project Path'),
                dataContainer: 'body',
                dataPlacement: 'right',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            scm_url: {
                label: 'SCM URL',
                type: 'text',
                ngShow: "scm_type && scm_type.value !== 'manual'",
                awRequiredWhen: {
                    reqExpression: "scmRequired",
                    init: false
                },
                subForm: 'sourceSubForm',
                hideSubForm: "scm_type.value === 'manual'",
                awPopOverWatch: "urlPopover",
                awPopOver: "set in controllers/projects",
                dataTitle: 'SCM URL',
                dataContainer: 'body',
                dataPlacement: 'right',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            scm_branch: {
                labelBind: "scmBranchLabel",
                type: 'text',
                ngShow: "scm_type && scm_type.value !== 'manual'",
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)',
                subForm: 'sourceSubForm',
            },
            credential: {
                label: i18n._('SCM Credential'),
                type: 'lookup',
                basePath: 'credentials',
                list: 'CredentialList',
                // apply a default search filter to show only scm credentials
                search: {
                    kind: 'scm'
                },
                ngShow: "scm_type && scm_type.value !== 'manual'",
                sourceModel: 'credential',
                sourceField: 'name',
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)',
                subForm: 'sourceSubForm'
            },
            checkbox_group: {
                label: i18n._('SCM Update Options'),
                type: 'checkbox_group',
                ngShow: "scm_type && scm_type.value !== 'manual'",
                subForm: 'sourceSubForm',
                fields: [{
                    name: 'scm_clean',
                    label: i18n._('Clean'),
                    type: 'checkbox',
                    awPopOver: i18n._('<p>Remove any local modifications prior to performing an update.</p>'),
                    dataTitle: i18n._('SCM Clean'),
                    dataContainer: 'body',
                    dataPlacement: 'right',
                    labelClass: 'checkbox-options stack-inline',
                    ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
                }, {
                    name: 'scm_delete_on_update',
                    label: i18n._('Delete on Update'),
                    type: 'checkbox',
                    awPopOver: i18n._('<p>Delete the local repository in its entirety prior to performing an update.</p><p>Depending on the size of the ' +
                        'repository this may significantly increase the amount of time required to complete an update.</p>'),
                    dataTitle: i18n._('SCM Delete'),
                    dataContainer: 'body',
                    dataPlacement: 'right',
                    labelClass: 'checkbox-options stack-inline',
                    ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
                }, {
                    name: 'scm_update_on_launch',
                    label: i18n._('Update on Launch'),
                    type: 'checkbox',
                    awPopOver: i18n._('<p>Each time a job runs using this project, perform an update to the local repository prior to starting the job.</p>'),
                    dataTitle: i18n._('SCM Update'),
                    dataContainer: 'body',
                    dataPlacement: 'right',
                    labelClass: 'checkbox-options stack-inline',
                    ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
                }]
            },
            scm_update_cache_timeout: {
                label: i18n._(`Cache Timeout<span class="small-text"> (seconds)</span>`),
                id: 'scm-cache-timeout',
                type: 'number',
                integer: true,
                min: 0,
                ngShow: "scm_update_on_launch && projectSelected && scm_type.value !== 'manual'",
                spinner: true,
                "default": '0',
                awPopOver: i18n._('<p>Time in seconds to consider a project to be current. During job runs and callbacks the task system will ' +
                    'evaluate the timestamp of the latest project update. If it is older than Cache Timeout, it is not considered current, ' +
                    'and a new project update will be performed.</p>'),
                dataTitle: i18n._('Cache Timeout'),
                dataPlacement: 'right',
                dataContainer: "body",
                ngDisabled: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            }
        },

        buttons: {
            cancel: {
                ngClick: 'formCancel()',
                ngShow: '(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            close: {
                ngClick: 'formCancel()',
                ngShow: '!(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            },
            save: {
                ngClick: 'formSave()',
                ngDisabled: true,
                ngShow: '(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
            }
        },

        related: {
            permissions: {
                awToolTip: i18n._('Please save before assigning permissions'),
                djangoModel: 'access_list',
                dataPlacement: 'top',
                basePath: 'api/v1/projects/{{$stateParams.project_id}}/access_list/',
                search: {
                    order_by: 'username'
                },
                type: 'collection',
                title: i18n._('Permissions'),
                iterator: 'permission',
                index: false,
                open: false,
                actions: {
                    add: {
                        ngClick: "$state.go('.add')",
                        label: 'Add',
                        awToolTip: i18n._('Add a permission'),
                        actionClass: 'btn List-buttonSubmit',
                        buttonContent: i18n._('&#43; ADD'),
                        ngShow: '(project_obj.summary_fields.user_capabilities.edit || !canAdd)'
                    }
                },

                fields: {
                    username: {
                        label: 'User',
                        uiSref: 'users({user_id: field.id})',
                        class: 'col-lg-3 col-md-3 col-sm-3 col-xs-4'
                    },
                    role: {
                        label: 'Role',
                        type: 'role',
                        noSort: true,
                        class: 'col-lg-4 col-md-4 col-sm-4 col-xs-4',
                    },
                    team_roles: {
                        label: 'Team Roles',
                        type: 'team_roles',
                        noSort: true,
                        class: 'col-lg-5 col-md-5 col-sm-5 col-xs-4',
                    }
                }
            },
            notifications: {
                include: "NotificationsList",
            }
        },

        relatedSets: function(urls) {
            return {
                permissions: {
                    iterator: 'permission',
                    url: urls.access_list
                },
                notifications: {
                    iterator: 'notification',
                    url: '/api/v1/notification_templates/'
                }
            };
        }

    };}])

    .factory('ProjectsForm', ['ProjectsFormObject', 'NotificationsList',
    function(ProjectsFormObject, NotificationsList) {
        return function() {
            var itm;
            for (itm in ProjectsFormObject.related) {
                if (ProjectsFormObject.related[itm].include === "NotificationsList") {
                    ProjectsFormObject.related[itm] = NotificationsList;
                    ProjectsFormObject.related[itm].generateList = true;   // tell form generator to call list generator and inject a list
                }
            }
            return ProjectsFormObject;
        };
    }]);
