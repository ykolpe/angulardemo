export class AppSettings {
    static HELP_DOCUMENT = 'https://sharepoint.soundtransit.org/sites/apps/icap/Shared%20Documents/ICAP%20User%20Reference%20Guide.doc';

    // should map URL with AD permissions
    //static URL_PERMS = {
    //    '/accounts-payable': [PermissionValue.AccountsPayableManage],
    //    '/contracts': [PermissionValue.ContractsManage],
    //    '/project-controls': [PermissionValue.ProjectControlsManage],
    //    '/rule-change-review': [PermissionValue.RulesManage],
    //    '/rules': [PermissionValue.RulesManage]
    //}

    static REPORT_SERVER_FOLDER = "businessobjects/enterprise115/infoview/scripts";
    static REPORT_SERVER_API = "openDocument.aspx";
    static REPORT_OBJECT_ID_TYPE = "ID";
    static REPORT_OBJECT_PARAM_TYPE = "lsS";
    static REPORT_OBJECT_PARAM = "@TransactionID";

    static REPORT_WINDOW_WIDTH = 1024;
    static REPORT_WINDOW_HEIGHT = 768;
    static REPORT_WINDOW_STATUS = 1;
    static REPORT_WINDOW_LOCATION = 1;
    static REPORT_WINDOW_RESIZABLE = 1;
    static REPORT_WINDOW_SCROLLBARS = 1;
}

export function ICAPSafeStringCompare(a1, a2) {
    if (a1 == null) return -1;
    if (a2 == null) return 1;
    return a1.localeCompare(a2);
}