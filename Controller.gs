const Controller = {
  LIMIT: 50, 

  checkQuota: function() {
    const props = PropertiesService.getUserProperties();
    const today = new Date().toISOString().split('T')[0];
    const storedDate = props.getProperty('usage_date');
    
    // Day Rollover
    if (storedDate !== today) {
      props.setProperty('usage_date', today);
      props.setProperty('usage_count', '0');
      return true; 
    }

    const count = Number(props.getProperty('usage_count') || 0);
    if (count >= this.LIMIT) throw new Error("QUOTA_STOP");
  },

  incrementQuota: function() {
    const props = PropertiesService.getUserProperties();
    const count = Number(props.getProperty('usage_count') || 0) + 1;
    props.setProperty('usage_count', count.toString());
  }
};

function processSingleMessage(id) {
  const message = GmailApp.getMessageById(id);
  const thread = message.getThread(); // <--- CRITICAL FIX: Get the Thread
  const subject = message.getSubject();
  const props = PropertiesService.getUserProperties().getProperties();

  try {
    // 1. LICENSE GATE (Blocking - No Quota Cost)
    if (!LicenseService.isValid(props.license_key)) {
      return { status: "BLOCKED", reason: "License Invalid" };
    }

    // 2. QUOTA CHECK (Stop - No Error)
    Controller.checkQuota();

    // 3. CONFIG GATE (Error - Consumes Quota if hit repeatedly)
    if (!props.api_key || !props.root_folder_id) throw new Error("CONFIG_ERROR: Missing Setup");

    // 4. ATTACHMENT FILTER (Skip - No Quota Cost)
    const atts = message.getAttachments().filter(att => Utils.isValidAttachment(att));
    if (!atts.length) {
      // FIX: Label the THREAD, not the message
      thread.addLabel(getLabel("GhostFiler_Done"));
      return { status: "SKIPPED", reason: "No valid attachments" };
    }

    // 5. AI EXTRACTION
    const metadata = AIService.extractMetadata(subject, message.getPlainBody(), message.getFrom(), props.api_key);
    if (metadata.error) throw new Error("AI_FAILURE: " + metadata.message);

    // 6. REVIEW GATE
    if (metadata.confidence < 80 || !metadata.vendor || !Utils.isValidDate(metadata.date)) {
      const reviewFolder = DriveService.getOrCreatePath(props.root_folder_id, "_Review_Needed");
      DriveService.saveAttachments(reviewFolder, atts, "REVIEW_REQ_");
      
      // FIX: Label the THREAD
      thread.addLabel(getLabel("GhostFiler_Review"));
      Logger.logAudit("REVIEW", subject, "Low Confidence");
      
      Controller.incrementQuota(); 
      return { status: "REVIEW", reason: "Low Confidence" };
    }

    // 7. SUCCESS PATH
    const safeVendor = Utils.sanitizePath(metadata.vendor);
    const safeType = Utils.sanitizePath(metadata.type);
    const year = metadata.date.substring(0, 4);
    const month = metadata.date.substring(5, 7);

    // DYNAMIC PATH GENERATION
    let pathTemplate = props.path_template || "/{year}/{vendor}/{type}/";
    
    let finalPath = pathTemplate
      .replace(/{year}/gi, year)
      .replace(/{month}/gi, month)
      .replace(/{vendor}/gi, safeVendor)
      .replace(/{type}/gi, safeType);

    finalPath = finalPath.replace(/\/\//g, "/");

    const finalFolder = DriveService.getOrCreatePath(props.root_folder_id, finalPath);
    const prefix = `${metadata.date}_${safeVendor}_${safeType}_`;

    DriveService.saveAttachments(finalFolder, atts, prefix);
    
    // FIX: Label and Archive the THREAD
    thread.addLabel(getLabel("GhostFiler_Done"));
    if (props.auto_archive === 'true') thread.moveToArchive();
      
    Controller.incrementQuota(); 
    Logger.logAudit("SUCCESS", subject, `Filed to /${safeVendor}`);

    return { status: "SUCCESS" };

  } catch (err) {
    if (err.message === "QUOTA_STOP") throw err;

    const isConfigError = err.message.startsWith("CONFIG_ERROR");
    const labelName = isConfigError ? "GhostFiler_Config_Error" : "GhostFiler_Error";
    
    // FIX: Label the THREAD
    thread.addLabel(getLabel(labelName));
    Logger.logAudit(isConfigError ? "CONFIG_ERROR" : "ERROR", subject, err.message);
    
    Controller.incrementQuota(); 
    return { status: "ERROR", reason: err.message };
  }
}

function getLabel(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}
