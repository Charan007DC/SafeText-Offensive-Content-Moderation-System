// sidebar.js - Using executeScript

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    
    // Inject a script that analyzes the page
    chrome.scripting.executeScript({
      target: {tabId: currentTab.id},
      func: analyzePage
    }, (injectionResults) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Injection error:", chrome.runtime.lastError);
        showError("Extension error: " + chrome.runtime.lastError.message);
        return;
      }
      
      if (injectionResults && injectionResults[0] && injectionResults[0].result) {
        displayResults(injectionResults[0].result);
      } else {
        showError("No results received");
      }
    });
  });
});

function analyzePage() {
  // This runs in the page context
  console.log("✅ Running analysis in page context");
  
  const selectors = 'p, div, span, li, article, .comment, .post, [class*="comment"], [class*="post"]';
  const elements = Array.from(document.querySelectorAll(selectors));
  
  const results = [];
  
  for (const element of elements) {
    const text = element.textContent.trim();
    if (text.length > 15 && text.length < 400) {
      // Simulate API call with mock data (for testing)
      const mockResult = {
        text: text,
        category: Math.random() > 0.5 ? 'toxic' : 'safe',
        confidence: Math.random(),
        is_toxic: Math.random() > 0.5
      };
      
      // Apply highlight class
      element.classList.add(`safetext-${mockResult.category}`);
      
      results.push(mockResult);
    }
  }
  
  return results;
}

function showError(message) {
  document.getElementById('analysis-results').innerHTML = 
    `<div style="padding: 20px; color: #ff6666; background: #2a2a2a; margin: 10px; border-radius: 5px;">
      ❌ ${message}
    </div>`;
}

function displayResults(results) {
  const container = document.getElementById('analysis-results');
  container.innerHTML = '';
  
  if (results.length === 0) {
    container.innerHTML = '<div style="padding: 20px; color: #aaa;">No text content found to analyze.</div>';
    return;
  }
  
  results.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = `analysis-item ${item.category}`;
    
    const displayText = item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text;
    
    div.innerHTML = `
      <div class="analysis-text">${displayText}</div>
      <div class="confidence">
        Confidence: ${(item.confidence * 100).toFixed(1)}% | 
        <span style="color: ${item.category === 'toxic' ? '#ff4444' : item.category === 'moderate' ? '#ffaa00' : '#44ff44'}">
          ${item.category.toUpperCase()}
        </span>
      </div>
    `;
    
    div.addEventListener('click', () => {
      element.scrollIntoView({behavior: 'smooth', block: 'center'});
    });
    
    container.appendChild(div);
  });
}