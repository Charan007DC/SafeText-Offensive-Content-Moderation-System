let pageTextElements = [];
let analysisResults = [];

// Listen for messages from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePage") {
    analyzeCurrentPage().then(results => {
      sendResponse({results: results});
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "highlightElement" && request.index !== undefined) {
    if (pageTextElements[request.index]) {
      pageTextElements[request.index].scrollIntoView({behavior: 'smooth', block: 'center'});
      pageTextElements[request.index].style.boxShadow = '0 0 15px rgba(255,255,255,0.8)';
      setTimeout(() => {
        if (pageTextElements[request.index]) {
          pageTextElements[request.index].style.boxShadow = '';
        }
      }, 2000);
    }
  }
});

async function analyzeCurrentPage() {
  // Clear previous highlights
  document.querySelectorAll('.safetext-toxic, .safetext-moderate, .safetext-safe').forEach(el => {
    el.classList.remove('safetext-toxic', 'safetext-moderate', 'safetext-safe');
  });
  
  // Find all text elements
  const selectors = 'p, div, span, li, article, .comment, .post, [class*="comment"], [class*="post"]';
  const elements = Array.from(document.querySelectorAll(selectors));
  
  pageTextElements = elements.filter(el => {
    const text = el.textContent.trim();
    return text.length > 15 && text.length < 400 && 
           window.getComputedStyle(el).display !== 'none' &&
           !el.closest('script, style, noscript, iframe');
  });
  
  analysisResults = [];
  
  // Analyze each text element
  for (const element of pageTextElements) {
    const text = element.textContent.trim();
    
    try {
      const response = await fetch('http://127.0.0.1:8080/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.confidence === 'number') {
          // Categorize based on confidence and prediction
          let category = 'safe';
          if (data.is_toxic) {
            if (data.confidence > 0.85) {
              category = 'toxic';
            } else if (data.confidence > 0.6) {
              category = 'moderate';
            }
          } else {
            if (data.confidence < 0.6) {
              category = 'moderate';
            }
          }
          
          // Apply highlight class
          element.classList.add(`safetext-${category}`);
          
          analysisResults.push({
            text: text,
            category: category,
            confidence: data.confidence,
            is_toxic: data.is_toxic
          });
        }
      }
    } catch (err) {
      console.log("SafeText: API error", err);
    }
  }
  
  return analysisResults;
}

// Auto-analyze when popup opens (optional)
// analyzeCurrentPage();