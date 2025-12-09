const AIService = {
  extractMetadata: function(subject, body, sender, apiKey) {
    // PII Scrubbing (Regex)
    const phoneRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[0-9]{2,8}[-\s\.]?[0-9]{2,8}\b/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    
    const cleanBody = body.replace(phoneRegex, "[REDACTED]").replace(emailRegex, "[REDACTED]");
    const cleanSender = sender.replace(emailRegex, "[REDACTED]");

    const url = "https://api.openai.com/v1/chat/completions";
    const payload = {
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You are a strict data extractor. Current Date: ${new Date().toISOString()}. Output JSON: {"vendor": string, "date": "YYYY-MM-DD", "type": "Invoice"|"Receipt"|"Other", "confidence": int}` },
        { role: "user", content: `From: ${cleanSender}\nSub: ${subject}\nBody: ${cleanBody.substring(0, 1500)}` }
      ]
    };

    try {
      const response = UrlFetchApp.fetch(url, {
        method: "post",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) return { error: true, message: "API_" + response.getResponseCode() };
      
      const content = JSON.parse(JSON.parse(response.getContentText()).choices[0].message.content);
      return content;
    } catch (e) {
      return { error: true, message: e.toString() };
    }
  }
};
