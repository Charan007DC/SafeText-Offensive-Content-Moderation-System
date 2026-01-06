// Get current tab and analyze
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {action: "analyze"}, (response) => {
    const status = document.getElementById('status');
    const results = document.getElementById('results');
    
    if (chrome.runtime.lastError || !response) {
      status.textContent = "Error: " + (chrome.runtime.lastError?.message || "No response");
      return;
    }
    
    status.textContent = `Found ${response.count} items`;
    results.innerHTML = response.items.map(item => 
      `<div class="result ${item.is_toxic ? 'toxic' : 'safe'}">
        ${item.text.substring(0, 80)}...
        <br><small>${(item.confidence*100).toFixed(1)}% confident</small>
      </div>`
    ).join('');
  });
});