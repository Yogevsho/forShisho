// scripts.js

// Elements
const customerText = document.getElementById('customer-text');
const suggestedResponse = document.getElementById('suggested-response');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const historyList = document.getElementById('history-list');
const micIcon = document.getElementById('mic-icon');

// Define Intents and Responses with Enhanced Keywords and Synonyms
const intents = [
  {
    name: 'PricingConcern',
    keywords: new Set(['expensive', 'price', 'cost', 'budget', 'cheap', 'affordable', 'overpriced', 'high price', 'pricing issue', 'pricey']),
    response: "I understand that price is an issue for you. Can I suggest some alternative options that might better fit your budget?"
  },
  {
    name: 'SatisfactionIssue',
    keywords: new Set(['not satisfied', 'bad experience', 'unhappy', 'disappointed', 'frustrated', 'poor service', 'dissatisfied', 'issue', 'problem', 'complaint']),
    response: "I'm sorry to hear that you're not satisfied. Let's see how we can make things right."
  },
  {
    name: 'DeliveryDelay',
    keywords: new Set(['slow delivery', 'late arrival', 'delivery delay', 'shipment', 'shipping', 'delayed', 'hold up', 'holdup', 'not received', 'on the way']),
    response: "I apologize for the delay in your delivery. Let me check the status for you and expedite the process."
  },
  {
    name: 'ProductIssue',
    keywords: new Set(['defective', 'broken', 'damaged', 'faulty', 'issue with product', 'not working', 'malfunction', 'problem with item']),
    response: "I'm sorry to hear that you're experiencing issues with the product. Let's arrange for a replacement or repair."
  },
  {
    name: 'CancellationRequest',
    keywords: new Set(['cancel', 'terminate', 'stop service', 'end subscription', 'unsubscribe', 'withdraw', 'discontinue']),
    response: "I'm sorry to hear that you want to cancel. Could you please share the reason so I can assist you better?"
  }
  // Add more intents as needed
];

// Function to preprocess and extract keywords and phrases
function extractKeywords(text) {
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const adjectives = doc.adjectives().out('array');
  const phrases = doc.match('#Adjective #Noun').out('array'); // Example for adjective-noun phrases
  return [...nouns, ...verbs, ...adjectives, ...phrases];
}

// Function to find the best matching intent
function findIntent(text) {
  const extractedKeywords = extractKeywords(text);
  let maxMatches = 0;
  let matchedIntent = null;
  let matchedKeywords = [];

  for (let intent of intents) {
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

    // Early exit if maximum possible matches are found
    if (maxMatches === intent.keywords.size) {
      break;
    }
  }

  if (maxMatches >= 1) {
    return { intent: matchedIntent, keywords: matchedKeywords };
  } else {
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
