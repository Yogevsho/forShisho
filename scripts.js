// scripts.js

// Elements
const customerText = document.getElementById('customer-text');
const suggestedResponse = document.getElementById('suggested-response');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const historyList = document.getElementById('history-list');
const micIcon = document.getElementById('mic-icon');

// Context to store the last matched intent
let context = {
  lastIntent: null
};

// Define Intents and Responses with Enhanced Keywords and Synonyms
const intents = [
    {
      name: 'PricingConcern',
      keywords: new Set(['expensive', 'price', 'cost', 'budget', 'cheap', 'affordable', 'overpriced', 'high price', 'pricing issue', 'pricey']),
      response: "I completely understand how important budgeting is for your business. Tailor Brands offers flexible pricing because we believe every brand deserves to look its best, regardless of budget. Let me walk you through some options that might align with your needs and show how even our basic plans provide tremendous value. Would you be open to exploring some cost-effective solutions?"
    },
    {
      name: 'SatisfactionIssue',
      keywords: new Set(['not satisfied', 'bad experience', 'unhappy', 'disappointed', 'frustrated', 'poor service', 'dissatisfied', 'issue', 'problem', 'complaint']),
      response: "I'm truly sorry to hear about your experience. At Tailor Brands, customer satisfaction is our top priority, and it sounds like we may have fallen short. Let’s explore together what happened so I can make things right. Could I offer you additional guidance or resources? Many of our clients have benefited from tailored support, and I'd love to ensure your experience reflects the quality you deserve."
    },
    {
      name: 'TechnicalIssue',
      keywords: new Set(['technical issue', 'error', 'not working', 'glitch', 'bug']),
      response: "I understand how frustrating technical issues can be, especially when you’re building something as important as your brand. We’re here to support you at every step. Let me troubleshoot with you right now. Our goal is to make this process as smooth as possible, so please bear with me as I walk you through each step. If needed, I’ll make sure this gets elevated to our technical team, and I’ll personally follow up to ensure it's resolved."
    },
    {
      name: 'AccountSubscriptionInquiry',
      keywords: new Set(['account', 'subscription', 'plan change', 'upgrade', 'downgrade', 'billing']),
      response: "I’d be delighted to help you get the most out of your Tailor Brands subscription. If there’s a specific feature or tool you’re looking for, we can explore which plan best aligns with your goals. Many of our clients find the Pro Plan adds extra flexibility and reach for growing brands. I can assist with any adjustments you need, or if you'd like to hear more about what our advanced plans offer, I’d be happy to guide you."
    },
    {
      name: 'BrandingDesignGuidance',
      keywords: new Set(['branding', 'logo', 'design', 'customization', 'brand identity']),
      response: "It’s so exciting to be part of your branding journey! Tailor Brands is designed to help you create a look that truly reflects your unique vision. I'd be happy to show you how our tools work and provide tips on crafting a design that resonates with your audience. Whether you’re building a logo or refining your brand’s look, we’re here to support every step. By the way, have you explored our design templates? They might help bring even more personality to your brand!"
    },
  
    // Follow-Up Intents with Expanded Keywords
    {
      name: 'PricingConcern_FollowUp_Exploring',
      keywords: new Set(['just exploring', 'not sure', 'considering', 'thinking about it']),
      response: "That’s great! Tailor Brands is designed to grow with you, so even if you're not ready to commit, I’d love to give you a clear idea of how we can support your journey. Let’s look at our options—there’s no obligation.",
      parent: 'PricingConcern'
    },
    {
      name: 'PricingConcern_FollowUp_CheaperElsewhere',
      keywords: new Set(['found cheaper', 'lower price', 'better price', 'cheaper option']),
      response: "I understand price comparisons are important. We work hard to balance cost and quality, offering tools and features that streamline branding while providing real value. Many customers find that our all-in-one platform ultimately saves them time and money in the long run. Could I show you some unique benefits of our platform?",
      parent: 'PricingConcern'
    },
    {
      name: 'SatisfactionIssue_FollowUp_WorthIt',
      keywords: new Set(['not worth it', 'waste of money', 'not valuable', 'not seeing benefit']),
      response: "I hear you, and your satisfaction is essential to us. While I completely understand how you feel, I’d love to make this right and provide some additional support to address your specific needs. Tailor Brands is committed to continuous improvement, so let’s work together to ensure you get the value you’re looking for.",
      parent: 'SatisfactionIssue'
    },
    {
      name: 'SatisfactionIssue_FollowUp_MultipleIssues',
      keywords: new Set(['multiple issues', 'many problems', 'more than one issue', 'frustrated with issues']),
      response: "I apologize for the repeated issues you've experienced. Your feedback helps us improve, so thank you for sharing. I’d be happy to personally follow up to ensure everything is working smoothly for you moving forward, and I can provide some tips to optimize your experience.",
      parent: 'SatisfactionIssue'
    },
    {
      name: 'TechnicalIssue_FollowUp_NotTechSavvy',
      keywords: new Set(['not tech savvy', 'not good with tech', 'need help with tech', 'struggling with tech']),
      response: "No worries! Our platform is designed to be user-friendly, but I’m here to make things even easier for you. I’ll guide you through each step and ensure that you feel confident moving forward. If it’s easier, I can also send a step-by-step guide for reference.",
      parent: 'TechnicalIssue'
    },
    {
      name: 'TechnicalIssue_FollowUp_TriedEverything',
      keywords: new Set(['tried everything', 'done everything', 'nothing works', 'still not working']),
      response: "I understand how frustrating that must be, especially after trying so hard to get it resolved. Let’s look into this together, and if it’s still unresolved, I’ll escalate this to our top-tier support. I’ll personally follow up to make sure we get this sorted for you.",
      parent: 'TechnicalIssue'
    },
    {
      name: 'AccountSubscriptionInquiry_FollowUp_Downgrade',
      keywords: new Set(['downgrade', 'reduce plan', 'switch to lower plan', 'lower subscription']),
      response: "Of course, we want to make sure your plan aligns with your needs. I’ll help you adjust to a plan that best fits your current requirements. If your needs grow in the future, you’re always welcome to upgrade. Tailor Brands is here to support your journey at every stage.",
      parent: 'AccountSubscriptionInquiry'
    },
    {
      name: 'AccountSubscriptionInquiry_FollowUp_UpgradeBenefits',
      keywords: new Set(['upgrade benefits', 'why upgrade', 'features of higher plan', 'advantages of upgrade']),
      response: "Great question! Our advanced plans offer added features like enhanced design tools and more storage. Many clients find these tools invaluable as their branding grows. I can walk you through these features to see if they might enhance your brand’s reach.",
      parent: 'AccountSubscriptionInquiry'
    },
    {
      name: 'BrandingDesignGuidance_FollowUp_Unsure',
      keywords: new Set(['not sure', 'need ideas', 'don’t know what I want', 'unsure about design']),
      response: "That’s totally normal! Building a brand is a creative journey. I’d suggest exploring our inspiration gallery to see what resonates with you. I’m here to help translate your vision into a design that feels right for your brand, and we can adjust as you gain clarity.",
      parent: 'BrandingDesignGuidance'
    },
    {
      name: 'BrandingDesignGuidance_FollowUp_Customization',
      keywords: new Set(['more customization', 'extra design options', 'additional features', 'enhance design']),
      response: "Absolutely. Our platform offers several customization options, and I can show you how to access even more advanced tools. If there’s something specific you’re looking to achieve, let me know—I’d love to help you bring it to life.",
      parent: 'BrandingDesignGuidance'
    }
    // Additional follow-up intents can be added as needed
];

// Function to preprocess and extract keywords and phrases
function extractKeywords(text) {
    const doc = nlp(text);
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    const adjectives = doc.adjectives().out('array');
    const phrases = doc.match('#Adjective #Noun').out('array');
    return [...nouns, ...verbs, ...adjectives, ...phrases];
  }
  
  // Function to find the best matching intent
  function findIntent(text) {
    const extractedKeywords = extractKeywords(text);
    let maxMatches = 0;
    let matchedIntent = null;
    let matchedKeywords = [];
  
    for (let intent of intents) {
      // Prioritize follow-up intents if they match the context
      if (intent.parent && context.lastIntent && intent.parent === context.lastIntent.name) {
        let matches = 0;
        let currentMatchedKeywords = [];
  
        for (let keyword of intent.keywords) {
          if (text.includes(keyword.toLowerCase())) {
            matches += 1;
            currentMatchedKeywords.push(keyword);
          }
        }
  
        if (matches > maxMatches) {
          maxMatches = matches;
          matchedIntent = intent;
          matchedKeywords = currentMatchedKeywords;
        }
      } else if (!intent.parent) {
        // Check main intents if no follow-up intent matched
        let matches = 0;
        let currentMatchedKeywords = [];
  
        for (let keyword of intent.keywords) {
          if (text.includes(keyword.toLowerCase())) {
            matches += 1;
            currentMatchedKeywords.push(keyword);
          }
        }
  
        if (matches > maxMatches) {
          maxMatches = matches;
          matchedIntent = intent;
          matchedKeywords = currentMatchedKeywords;
        }
      }
    }
  
    if (maxMatches >= 1) {
      context.lastIntent = matchedIntent; // Update context with the last matched intent
      return { intent: matchedIntent, keywords: matchedKeywords };
    } else {
      context.lastIntent = null; // Reset context if no intent is matched
      return null;
    }
  }
  
  // Function to append to conversation history
  function appendToHistory(customer, response) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>Customer:</strong> ${customer}<br><strong>Response:</strong> ${response}`;
    historyList.prepend(listItem); // Prepend to show the latest at the top
  }
  
  // Function to highlight matched keywords in the transcription
  function highlightKeywords(text, keywords) {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    return highlightedText;
  }
  
  // Utility function to escape RegExp special characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

// Debounce Setup
let debounceTimeout;

// Function to process final transcript with debounce
function processTranscriptDebounced(text) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    processTranscript(text);
  }, 300); // Adjust debounce delay as needed
}

// Function to process final transcript
function processTranscript(text) {
  const intentData = findIntent(text);
  
  if (intentData) {
    const { intent, keywords } = intentData;
    customerText.innerHTML = highlightKeywords(text, keywords);
    suggestedResponse.textContent = intent.response;
    appendToHistory(text, intent.response);
  } else {
    customerText.textContent = text;
    suggestedResponse.textContent = "No suggestion available.";
    appendToHistory(text, "No suggestion available.");
  }
}

// Function to extract matched keywords from interim transcript
function extractMatchedKeywords(text) {
  const extractedKeywords = extractKeywords(text);
  let matchedKeywords = [];
  
  intents.forEach(intent => {
    intent.keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase()) && !matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    });
  });
  
  return matchedKeywords;
}

// Speech Recognition Setup
let recognition;
let isListening = false;

// Check for browser support
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  alert('Your browser does not support Speech Recognition. Please try Chrome or Edge.');
} else {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true; // Enable interim results
  recognition.lang = 'en-US'; // Adjust if necessary, e.g., 'en-GB'

  recognition.onstart = () => {
    isListening = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    micIcon.classList.add('active');
    console.log('Speech recognition started.');
  };

  recognition.onend = () => {
    isListening = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    micIcon.classList.remove('active');
    console.log('Speech recognition ended.');
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    suggestedResponse.textContent = `Error: ${event.error}`;
    
    // Optionally, attempt to restart recognition or alert the user
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      alert('Please check your microphone and try again.');
    }
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }

    if (event.results[event.results.length - 1].isFinal) {
      // Final result with debounce
      processTranscriptDebounced(transcript.toLowerCase());
    } else {
      // Interim result
      const matchedKeywords = extractMatchedKeywords(transcript.toLowerCase());
      customerText.innerHTML = highlightKeywords(transcript.toLowerCase(), matchedKeywords);
      suggestedResponse.textContent = "Listening...";
    }
  };
}

// Start listening
startButton.addEventListener('click', () => {
  if (!isListening) {
    recognition.start();
  }
});

// Stop listening
stopButton.addEventListener('click', () => {
  if (isListening) {
    recognition.stop();
  }
});

// Function to suggest a response based on intent
function suggestResponse(text) {
  const intentData = findIntent(text);
  if (intentData) {
    const { intent, keywords } = intentData;
    // Highlight keywords in the transcript
    const highlightedText = highlightKeywords(text, keywords);
    customerText.innerHTML = highlightedText;
    suggestedResponse.textContent = intent.response;
    appendToHistory(text, intent.response);
  } else {
    customerText.textContent = text;
    suggestedResponse.textContent = "No suggestion available.";
    appendToHistory(text, "No suggestion available.");
  }
}
