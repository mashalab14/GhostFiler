const Logger = {
  logAudit: (status, subject, details) => {
    try {
      const props = PropertiesService.getUserProperties();
      const rootId = props.getProperty('root_folder_id');
      if (!rootId) return;

      const root = DriveApp.getFolderById(rootId);
      const files = root.getFilesByName("GhostFiler_Audit_Log");
      let sheet;
      
      if (files.hasNext()) {
        sheet = SpreadsheetApp.open(files.next()).getActiveSheet();
      } else {
        const ss = SpreadsheetApp.create("GhostFiler_Audit_Log");
        DriveApp.getFileById(ss.getId()).moveTo(root);
        sheet = ss.getActiveSheet();
        sheet.appendRow(["Timestamp", "Status", "Subject", "Details"]);
      }
      sheet.appendRow([new Date(), status, subject, details]);
    } catch (e) { console.error("Log failed", e); }
  }
};
