# SafeText – News Safety Browser Extension

A lightweight browser extension that **analyzes news articles in real time** and displays a **toxicity rating + confidence score** directly on the page.

> 🔍 "Is this article safe or toxic?" — Now you know at a glance.

Built for the **Cognifyz Hackathon (Problem 6)**, this tool helps readers quickly assess the tone of online news without leaving the page.

---

## 🌐 How It Works

1. **Detects** news article content on the current tab
2. **Sends text** to a free hosted AI moderation API (powered by fine-tuned BERT)
3. **Receives** a toxicity score (0.0 = safe, 1.0 = toxic) and model confidence
4. **Displays** a subtle colored badge in the top-right corner:

   - 🟢 **Green**: Safe (score < 0.3)
   - 🟡 **Yellow**: Moderate (0.3–0.6)
   - 🔴 **Red**: Toxic (score > 0.6)

---

## 🛠️ Tech Stack

- **Extension**: Vanilla JavaScript (Manifest V3)
- **AI Model**: Fine-tuned BERT (from SafeText project)
- **Backend API**: Flask + Hugging Face Transformers (hosted free on Render)
- **No tracking, no ads, open-source**

---

## 📥 Installation

### Option A: Load Unpacked (Dev)
1. Clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `/extension` folder

### Option B: Install from Web Store (Coming Soon)

---

## 🖥️ Extension Structure
