function toggleAutoPilotTrigger(enabled) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'runBackgroundSweep') ScriptApp.deleteTrigger(t);
  });

  if (enabled) {
    ScriptApp.newTrigger('runBackgroundSweep').timeBased().everyMinutes(10).create();
  }
}

function runBackgroundSweep() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;

  try {
    const query = 'label:inbox has:attachment -label:GhostFiler_Done -label:GhostFiler_Review -label:GhostFiler_Error -label:GhostFiler_Config_Error';
    const threads = GmailApp.search(query, 0, 10);
    
    for (const t of threads) {
      try {
        const lastMsg = t.getMessages().pop();
        processSingleMessage(lastMsg.getId());
      } catch (e) {
        if (e.message === "QUOTA_STOP") break; 
      }
    }
  } finally {
    lock.releaseLock();
  }
}
