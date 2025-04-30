// Toggle chatbot window
document.addEventListener('DOMContentLoaded', function() {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  
  // Toggle chatbot window when the icon is clicked
  if (chatbotToggle) {
      chatbotToggle.addEventListener('click', function() {
          if (chatbotWindow.style.display === 'none') {
              chatbotWindow.style.display = 'flex';
              // Focus on input field when chatbot opens
              userInput.focus();
          } else {
              chatbotWindow.style.display = 'none';
          }
      });
  }
  
  // Close chatbot window when the close button is clicked
  if (chatbotClose) {
      chatbotClose.addEventListener('click', function() {
          chatbotWindow.style.display = 'none';
      });
  }
  
  // Handle form submission
  if (chatForm) {
      chatForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const message = userInput.value.trim();
          if (message) {
              // Display user message
              displayUserMessage(message);
              
              // Clear input field
              userInput.value = '';
              
              // Send message to the chatbot
              sendMessage(message);
          }
      });
  }
  
  // Add welcome message when the page loads
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages && chatMessages.children.length === 0) {
      displayBotMessage('Hello! I\'m your CookEasy assistant. Ask me anything about recipes, cooking techniques, or ingredient substitutions!');
  }
});

// Function to handle sending messages to the chatbot
async function sendMessage(message) {
  try {
      // Show loading indicator
      showTypingIndicator();
      
      // Send the message to the server
      const response = await fetch('http://localhost:5001/ask', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message }),
      });
      
      // Hide loading indicator
      hideTypingIndicator();
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Display the bot's response
      displayBotMessage(data.answer_html);
      
      return data;
  } catch (error) {
      // Hide loading indicator
      hideTypingIndicator();
      
      console.error('Error sending message:', error);
      displayBotMessage('Sorry, I encountered an error. Please try again later.');
  }
}

// Function to display user message in the chat
function displayUserMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'user-message';
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  
  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to display bot message in the chat
function displayBotMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'bot-message';
  
  // If the message is HTML, use innerHTML, otherwise use textContent
  if (message.includes('<div class="recipe-container">')) {
      messageElement.innerHTML = message;
  } else {
      messageElement.textContent = message;
  }
  
  chatMessages.appendChild(messageElement);
  
  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show typing indicator
function showTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.id = 'typing-indicator';
  
  // Create the dots for the typing animation
  for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typingIndicator.appendChild(dot);
  }
  
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to hide typing indicator
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
      typingIndicator.remove();
  }
}

// For backward compatibility with your onclick handler
function sendToChatbot() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  
  if (message) {
      // Display user message
      displayUserMessage(message);
      
      // Clear input field
      userInput.value = '';
      
      // Send message to the chatbot
      sendMessage(message);
  }
}
const chatbotToggle = document.getElementById('chatbot-toggle');
const tooltip = document.getElementById('chatbot-tooltip');

// Function to show and hide the tooltip
function showTooltip(message) {
  tooltip.textContent = message;
  tooltip.classList.add('show');

  // Auto-hide after 3 seconds
  setTimeout(() => {
    tooltip.classList.remove('show');
  }, 3000);
}

// Show tooltip every 40 seconds
setInterval(() => {
  showTooltip('Hi, This is chat assistant. How can I assist you?');
}, 40000);

