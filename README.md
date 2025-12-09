# 💎 GhostFiler v11.0 - Gmail Add-on

## Overview
GhostFiler is a Google Workspace Add-on for Gmail that automatically organizes email attachments using AI. It extracts metadata from emails, categorizes attachments, and files them into Google Drive with intelligent folder structures.

## Features
- **AI-Powered Extraction**: Uses OpenAI GPT-4o-mini to analyze emails and extract vendor, date, and document type
- **Smart Filing**: Automatically organizes files into `Year/Vendor/Type` folder structure
- **Privacy-First**: BYOK (Bring Your Own Key) architecture with PII scrubbing
- **Quota Management**: 50 files per day limit with automatic reset
- **Review Queue**: Low-confidence extractions go to review folder
- **Auto-Pilot Mode**: Background processing every 10 minutes (optional)
- **Audit Logging**: Comprehensive activity tracking in Google Sheets

## File Structure
```
GhostFiler/
├── appsscript.json       # Manifest with OAuth scopes and add-on config
├── Utils.gs              # Utility functions (validation, sanitization)
├── Controller.gs         # Core processing logic and quota management
├── UI.gs                 # Card UI and user interactions
├── AIService.gs          # OpenAI API integration with PII scrubbing
├── LicenseService.gs     # License validation
├── DriveService.gs       # Google Drive operations
├── Logger.gs             # Audit logging to Google Sheets
└── Triggers.gs           # Background automation triggers
```

## Setup Instructions

### Step 1: Create a New Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. Name your project "GhostFiler"

### Step 2: Upload Files
For each `.gs` file in this folder:
1. In the Apps Script editor, click the **"+"** next to Files
2. Select **"Script"**
3. Name it exactly as shown (e.g., `Utils`, `Controller`, etc.)
4. Copy and paste the code from each file

For `appsscript.json`:
1. Click on **"Project Settings"** (gear icon)
2. Check **"Show 'appsscript.json' manifest file in editor"**
3. Go back to **"Editor"** and click on `appsscript.json`
4. Replace all content with the provided manifest

### Step 3: Configure Prerequisites
1. **Get an OpenAI API Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Create a Google Drive Folder**: 
   - Create a folder for GhostFiler in Drive
   - Get the folder ID from the URL: `drive.google.com/drive/folders/[THIS_IS_THE_ID]`
3. **Generate a License Key**: Any string longer than 8 characters (for testing)

### Step 4: Deploy as Add-on
1. Click **"Deploy"** > **"Test deployments"**
2. Click **"Select type"** > **"Editor Add-on"**
3. Configure:
   - **Description**: GhostFiler Test
   - **Deployment config**: Gmail
4. Click **"Deploy"**
5. Authorize the add-on when prompted

### Step 5: Test in Gmail
1. Open Gmail in the same account
2. Open any email with attachments
3. Click the GhostFiler icon in the right sidebar
4. Click **"⚙️ Configure"** and enter:
   - License Key (>8 characters)
   - OpenAI API Key
   - Root Folder ID from Drive
5. Click **"⚡ Analyze This Thread"** to test

## Configuration Options

### Settings (via ⚙️ Configure)
| Field | Required | Description |
|-------|----------|-------------|
| License Key | Yes | Any string >8 chars (v11 uses simple validation) |
| OpenAI API Key | Yes | Your BYOK API key from OpenAI |
| Root Folder ID | Yes | Google Drive folder ID for filing |
| Background Auto-Pilot | No | Enable automatic processing every 10 min |
| Auto-Archive | No | Move processed emails to archive |

## How It Works

### Processing Flow
1. **License Check**: Validates license key (free, no quota cost)
2. **Quota Check**: Ensures under 50 files/day limit
3. **Config Validation**: Checks for required settings
4. **Attachment Filter**: Validates file types and size (>5KB)
5. **AI Extraction**: Analyzes email with PII scrubbing
6. **Confidence Gate**: 
   - ≥80% confidence + valid date → File automatically
   - <80% confidence → Send to `_Review_Needed` folder
7. **Drive Filing**: Creates `Year/Vendor/Type` structure
8. **Labeling**: Applies Gmail labels for tracking
9. **Audit Log**: Records activity in spreadsheet

### Supported File Types
- PDF (`.pdf`)
- Images (`.jpg`, `.png`)
- Word Documents (`.docx`)
- Excel Spreadsheets (`.xlsx`)
- CSV Files (`.csv`)

## Labels Created
- `GhostFiler_Done`: Successfully processed
- `GhostFiler_Review`: Needs manual review
- `GhostFiler_Error`: Processing error
- `GhostFiler_Config_Error`: Missing configuration

## Troubleshooting

### "License Invalid" Error
- Ensure license key is longer than 8 characters
- Check for extra spaces in Settings

### "CONFIG_ERROR: Missing Setup"
- Verify all three required fields are filled in Settings
- Check that Drive Folder ID is correct (no extra characters)

### "QUOTA_STOP" 
- You've hit the 50 files/day limit
- Wait until next day (resets at UTC midnight)

### API Errors
- Verify OpenAI API key is valid and has credits
- Check API key has no extra spaces
- Ensure you're using a valid key from platform.openai.com

### Attachments Not Processing
- Check file size is >5KB
- Verify file type is in supported list
- Look for labels to see processing status

## Privacy & Security
- **BYOK Architecture**: Your OpenAI key stays in your User Properties
- **PII Scrubbing**: Phone numbers and emails redacted before AI analysis
- **Zero Retention**: No data stored outside your Google Workspace
- **Local Processing**: All operations run in your Apps Script environment

## Compliance Note
This add-on uses time-based triggers for Auto-Pilot mode. During Google Marketplace review:
- Manual trigger (⚡ button) is the primary feature
- Auto-Pilot is presented as optional convenience
- Ensure thorough testing in Test Deployment before submission

## Support & Development
- Built on Google Apps Script V8 runtime
- Uses CardService UI framework
- Requires Gmail Add-on contextual triggers
- Integrates with Google Drive API and Sheets API

## License
This is a functional specification implementation. Ensure you have proper licensing for production use.

---

**Version**: 11.0  
**Status**: Final Build  
**Architecture**: Google Workspace Add-on (CardService)  
**Runtime**: V8
