/**
 * Contextual Trigger: Entry Point
 */
function buildContextCard(e) {
  GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken);
  const messageId = e.gmail.messageId;

  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();

  section.addWidget(CardService.newTextParagraph().setText("GhostFiler Ready"));
  
  // MANUAL TRIGGER
  section.addWidget(CardService.newTextButton()
    .setText("⚡ Analyze This Thread")
    .setOnClickAction(CardService.newAction()
      .setFunctionName("handleManualAction")
      .setParameters({ msgId: messageId })
    ));

  // SETTINGS NAV
  section.addWidget(CardService.newTextButton()
    .setText("⚙️ Configure")
    .setOnClickAction(CardService.newAction().setFunctionName("pushSettingsCard"))
  );

  return card.addSection(section).build();
}

function handleManualAction(e) {
  GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken); 
  const result = processSingleMessage(e.parameters.msgId);
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(`Status: ${result.status}`))
    .build();
}

function pushSettingsCard() {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createSettingsCard()))
    .build();
}

/**
 * SETTINGS CARD
 * FIX: Uses DecoratedText to label switches (The correct Google way)
 */
function createSettingsCard() {
  const props = PropertiesService.getUserProperties().getProperties();
  
  const card = CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle("Settings"));
  const section = CardService.newCardSection();

  // 1. Text Inputs
  section.addWidget(CardService.newTextInput().setFieldName("license_key").setTitle("License Key").setValue(props.license_key || ""));
  section.addWidget(CardService.newTextInput().setFieldName("api_key").setTitle("OpenAI API Key").setValue(props.api_key || ""));
  section.addWidget(CardService.newTextInput().setFieldName("root_folder_id").setTitle("Root Folder ID").setValue(props.root_folder_id || ""));

  // NEW: Path Template Input
  section.addWidget(CardService.newTextInput()
    .setFieldName("path_template")
    .setTitle("Folder Structure Template")
    .setHint("Use: {year}, {vendor}, {type}")
    .setValue(props.path_template || "/{year}/{vendor}/{type}/"));

  // 2. Switches
  const pilotSwitch = CardService.newSwitch()
    .setFieldName("auto_pilot_enabled")
    .setValue("true")
    .setSelected(props.auto_pilot_enabled === 'true');

  section.addWidget(CardService.newDecoratedText()
    .setText("Enable Background Auto-Pilot")
    .setBottomLabel("Scans inbox every 1 hour")
    .setSwitchControl(pilotSwitch));

  const archiveSwitch = CardService.newSwitch()
    .setFieldName("auto_archive")
    .setValue("true")
    .setSelected(props.auto_archive === 'true');

  section.addWidget(CardService.newDecoratedText()
    .setText("Auto-Archive Emails")
    .setBottomLabel("Archive after successful filing")
    .setSwitchControl(archiveSwitch));

  // 3. Save Button
  const saveAction = CardService.newAction().setFunctionName("saveSettings");
  section.addWidget(CardService.newTextButton().setText("Save Configuration").setOnClickAction(saveAction));
  
  return card.addSection(section).build();
}

function saveSettings(e) {
  const inputs = e.formInput;
  const props = PropertiesService.getUserProperties();
  
  props.setProperty('license_key', inputs.license_key);
  props.setProperty('api_key', inputs.api_key);
  props.setProperty('root_folder_id', inputs.root_folder_id);
  
  // NEW: Save the template
  props.setProperty('path_template', inputs.path_template);
  
  props.setProperty('auto_pilot_enabled', inputs.auto_pilot_enabled ? 'true' : 'false');
  props.setProperty('auto_archive', inputs.auto_archive ? 'true' : 'false');
  
  toggleAutoPilotTrigger(inputs.auto_pilot_enabled ? true : false);
  
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Settings Saved"))
    .setNavigation(CardService.newNavigation().popCard())
    .build();
}
