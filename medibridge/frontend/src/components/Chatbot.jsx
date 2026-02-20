import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import './Chatbot.css';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// MediBridge Medical Assistant System Prompt
const MEDIBRIDGE_PROMPT = `You are Medron, a helpful AI medical assistant. Provide small, precise, and point-based answers.

GUIDELINES:
- Be extremely concise and precise. No long stories or unnecessary fillers.
- Use bullet points for clarity. Focus ONLY on important medical points.
- Only answer medical/health questions
- For non-medical questions, say: "I can only assist with medical and health-related queries."
- Provide accurate medical information
- Always include a disclaimer at the end
- Use emojis to be "amusing" and friendly.

HOW TO ANSWER:

1. For SYMPTOMS (e.g., "I have fever and headache"):
   - Identify possible conditions/diseases
   - Explain what each condition is
   - Suggest urgency level
   - Recommend what to do
   - Give general precautions

2. For TABLET/MEDICINE questions (e.g., "What is Dolo 650?"):
   - Explain what the medicine is
   - What it's used for (which diseases/conditions)
   - How it works
   - Common side effects
   - Important precautions
   - When to consult a doctor

3. For GENERAL health questions:
   - Give direct, helpful answers
   - Explain in simple terms
   - Provide practical advice

4. For EMERGENCY symptoms (chest pain, stroke, severe bleeding, breathing difficulty):
   - Immediately say: "🚨 This may be a medical emergency. Seek immediate medical attention."

DISCLAIMER TO INCLUDE:
"This information is for educational purposes only and is not a medical diagnosis. Please consult a qualified healthcare professional."`;

// --- NEW INTRO ANIMATION COMPONENTS ---

// --- NEW INTRO ANIMATION COMPONENTS ---

// --- REFINED INTRO ANIMATION COMPONENTS ---

// Scene 1: Neon Ball Entry
const BouncingBall = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="neon-ball-entry">
      <div className="ball-glow"></div>
      <div className="ball-core"></div>
      <div className="glow-trail"></div>
    </div>
  );
};

// Scene 2: Hurricane Swirl
const HurricaneSwirl = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="hurricane-swirl atomic-mode">
      <div className="atomic-core"></div>
      <div className="atomic-orbit orbit-1"></div>
      <div className="atomic-orbit orbit-2"></div>
      <div className="atomic-orbit orbit-3"></div>
      <div className="atomic-orbit orbit-4"></div>
      <div className="atomic-orbit orbit-5"></div>
      <div className="atomic-orbit orbit-6"></div>
    </div>
  );
};

// Scene 3: Refined Robot Design with Sparks
const RobotAvatar = ({ isActive, showSpeechBubble, onAnimationComplete }) => {
  useEffect(() => {
    if (isActive && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onAnimationComplete]);

  if (!isActive) return null;

  return (
    <div className="robot-container intro-mode">

      <div className="css-robot-avatar landing-animation">
        <svg viewBox="0 0 100 100" className="robot-svg">
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Body */}
          <rect x="34" y="62" width="32" height="40" rx="10" fill="white" />

          {/* Head */}
          <rect x="22" y="15" width="56" height="45" rx="14" fill="white" className="robot-head-motion" />

          {/* Face Screen */}
          <rect x="28" y="22" width="44" height="32" rx="10" fill="#0C1B33" className="robot-face-motion" />

          {/* Eyes */}
          <g className="robot-eyes-group">
            <circle cx="40" cy="38" r="4.5" fill="#00d4aa" filter="url(#glow)" className="eye-blink" />
            <circle cx="60" cy="38" r="4.5" fill="#00d4aa" filter="url(#glow)" className="eye-blink" />
          </g>

          {/* Left Arm */}
          <rect x="18" y="64" width="10" height="30" rx="5" fill="white" transform="rotate(8 18 64)" />

          {/* Right Arm - Static during intro */}
          <rect x="72" y="64" width="10" height="30" rx="5" fill="white" transform="rotate(-8 82 64)" />
        </svg>
      </div>

      {showSpeechBubble && (
        <div className="simple-greeting intro-greeting">
          <span className="greeting-text">hi 👋 need help?</span>
        </div>
      )}
    </div>
  );
};

const IntroAnimation = ({ onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  // Continuous Sequence - Overlapping transitions for better flow
  useEffect(() => {
    const timers = [];

    // Ball → Swirl immediately after bounce (0.9s)
    timers.push(setTimeout(() => {
      setCurrentScene(1);
    }, 650));

    // Swirl → Morph → Robot (1.5s total)
    timers.push(setTimeout(() => {
      setCurrentScene(2);
    }, 1050));

    timers.push(setTimeout(() => {
      setCurrentScene(3);
      setShowSpeechBubble(true);
    }, 1200));

    // Finish animation
    timers.push(setTimeout(onComplete, 1750));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);
  return (
    <div className="intro-animation-container">
      <div className="animation-stage">
        {currentScene === 0 && <BouncingBall isActive={true} />}
        {currentScene === 1 && <HurricaneSwirl isActive={true} />}
        {currentScene === 2 && <div className="morph-spiral"></div>}
        <RobotAvatar
          isActive={currentScene >= 3}
          showSpeechBubble={showSpeechBubble}
        />
      </div>
    </div>
  );
};

// Square Robot for chat button (Matches new design)
const SquareRobot = ({ isHovered, showGreeting, hideHoverGreeting }) => (
  <div className={`square-robot-container ${isHovered ? 'hovered' : ''}`}>
    <div className={`css-robot-avatar-small ${isHovered ? 'floating' : ''}`}>
      <svg viewBox="0 0 100 100" className="robot-svg-small">
        <rect x="34" y="62" width="32" height="40" rx="10" fill="white" />
        <rect x="22" y="15" width="56" height="45" rx="14" fill="white" />
        <rect x="28" y="22" width="44" height="32" rx="10" fill="#0C1B33" />
        <circle cx="40" cy="38" r="4.5" fill="#00d4aa" />
        <circle cx="60" cy="38" r="4.5" fill="#00d4aa" />
        <rect x="18" y="64" width="10" height="30" rx="5" fill="white" transform="rotate(8 18 64)" />
        <rect x="72" y="64" width="10" height="30" rx="5" fill="white" transform="rotate(-8 82 64)" />
      </svg>
    </div>

    {(showGreeting || (isHovered && !hideHoverGreeting)) && (
      <div className="simple-greeting">
        <span className="greeting-text">
          {showGreeting ? "hi 👋 need help?" : "ask medron"}
        </span>
      </div>
    )}
  </div>
);

const Chatbot = () => {
  const [isIntroCompleted, setIsIntroCompleted] = useState(() => {
    return sessionStorage.getItem('introCompleted') === 'true';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasSeen, setHasSeen] = useState(() => {
    // For debugging - set to false to always show the greeting
    return sessionStorage.getItem('botHasSeen') === 'true';
    // return false; // Uncomment this line to always show greeting
  });
  const [showGreeting, setShowGreeting] = useState(false);
  const [headerHover, setHeaderHover] = useState(false);
  const { getToken, isAuthenticated } = useAuth();
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const saveChatToSupabase = async (userMsg, aiMsg) => {
    if (!isAuthenticated) return;
    try {
      const token = getToken();
      await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/chat` : '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_message: userMsg,
          ai_response: aiMsg,
          conversation_id: conversationId
        })
      });
    } catch (err) {
      console.error('Failed to save chat to history:', err);
    }
  };

  const [messages, setMessages] = useState([
    { type: 'bot', text: '', isTyping: true, fullText: "👋 Hello! I'm Medron, your AI Medical Assistant.\n\nI can help you with:\n• Symptom analysis 🤒\n• Medication info 💊\n• General health advice 🧘‍♀️" }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Show greeting animation on first load (after intro is complete)
  useEffect(() => {
    if (!isIntroCompleted) {
      // Show intro animation only if not already completed
      return;
    }

    // Show greeting on first load (after intro is complete)
    if (!hasSeen && isIntroCompleted) {
      const greetingTimer = setTimeout(() => {
        setShowGreeting(true);
        setHasSeen(true);
        sessionStorage.setItem('botHasSeen', 'true');

        // Hide auto-greeting after 4 seconds
        setTimeout(() => setShowGreeting(false), 4000);
      }, 500); // 0.5s delay as requested
      return () => clearTimeout(greetingTimer);
    }
  }, [hasSeen, isIntroCompleted, isIntroCompleted]);

  // Handler for when intro animation completes
  const handleIntroComplete = () => {
    setIsIntroCompleted(true);
    setHasSeen(true);
    sessionStorage.setItem('introCompleted', 'true');
    sessionStorage.setItem('botHasSeen', 'true');
  };

  // Type first message
  useEffect(() => {
    const firstMsg = messages[0];
    if (firstMsg.isTyping) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= firstMsg.fullText.length) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[0] = {
              ...newMessages[0],
              text: firstMsg.fullText.slice(0, index)
            };
            return newMessages;
          });
          index++;
        } else {
          clearInterval(interval);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[0] = {
              ...newMessages[0],
              isTyping: false
            };
            return newMessages;
          });
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [messages[0].isTyping]); // Depend on isTyping to trigger replay

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        const toggleBtn = document.querySelector('.chat-toggle');
        if (!toggleBtn?.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const analyzeWithMediBridge = async (userInput) => {
    const models = [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'openai/gpt-oss-20b:free',
      'arcee-ai/trinity-mini:free'
    ];

    const currentMessages = [
      { role: "system", content: MEDIBRIDGE_PROMPT },
      ...messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
        ...(msg.reasoning_details ? { reasoning_details: msg.reasoning_details } : {})
      })),
      { role: "user", content: userInput }
    ];

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": model,
            "messages": currentMessages,
            "temperature": 0.3,
            "max_tokens": 400,
            "top_p": 0.9,
            "reasoning": { "enabled": true }
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const msg = data.choices[0].message;

        return {
          text: msg.content,
          reasoning_details: msg.reasoning_details || null,
          model: model
        };
      } catch (error) {
        console.warn(`Model ${model} failed, trying next...`);
      }
    }

    return {
      text: "I apologize, but I'm having trouble connecting right now. Please try again or consult a doctor directly. 👨‍⚕️"
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    // Use MediBridge analysis
    const responseData = await analyzeWithMediBridge(userMessage);

    setMessages(prev => [...prev, {
      type: 'bot',
      text: responseData.text,
      reasoning_details: responseData.reasoning_details
    }]);

    saveChatToSupabase(userMessage, responseData.text);

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRobotClick = () => {
    setIsOpen(true);
    setShowGreeting(false);
    // Reset typing animation for the welcome message
    setMessages(prev => {
      // Keep existing history but reset the welcome message if it's the first one?
      // Actually user probably wants to see the welcome message type out again?
      // Or just if the chat was cleared/fresh?
      // Let's assume re-typing the welcome message is desired if it's there.
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[0].type === 'bot') {
        newMessages[0] = {
          ...newMessages[0],
          text: '',
          isTyping: true
        };
      }
      return newMessages;
    });
  };

  const clearChat = () => {
    setMessages([{
      type: 'bot',
      text: "👋 Hello! I'm Medron, your AI Medical Assistant.\n\nI can help you with:\n• Symptom analysis 🤒\n• Medication info 💊\n• General health advice 🧘‍♀️",
      isTyping: false
    }]);
  };

  // Reset greeting animation for testing
  const resetGreetingAnimation = () => {
    sessionStorage.removeItem('botHasSeen');
    sessionStorage.removeItem('introCompleted');
    setHasSeen(false);
    setIsIntroCompleted(false);
    setShowGreeting(true);
    window.location.reload();
  };

  // Add keyboard shortcut to reset (Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetGreetingAnimation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Intro Animation - First Time Only */}
      {!isIntroCompleted && !isOpen && (
        <div className="intro-animation-wrapper">
          <IntroAnimation onComplete={handleIntroComplete} />
        </div>
      )}

      {/* Square Robot Button - Always shown after intro */}
      {!isOpen && isIntroCompleted && (
        <button
          className="chat-toggle"
          onClick={handleRobotClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Open chat"
        >
          <SquareRobot isHovered={isHovered} showGreeting={showGreeting} />
        </button>
      )}

      {/* NEW GLASSMORPHISM CHAT WINDOW */}
      {isOpen && (
        <div className="chat-windowglass" ref={chatWindowRef}>
          <div className="chat-header-glass">
            <div className="header-left">
              <div
                className="chat-avatar-glass"
                onMouseEnter={() => setHeaderHover(true)}
                onMouseLeave={() => setHeaderHover(false)}
              >
                <SquareRobot isHovered={headerHover} showGreeting={false} hideHoverGreeting={true} />
              </div>
              <div className="chat-info-glass">
                <h4>Medron</h4>
                <div className="status-badge">
                  <span className="status-dot-glass"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={clearChat} title="Clear Chat">
                <FiTrash2 />
              </button>
              <button className="icon-btn close-btn" onClick={() => setIsOpen(false)} title="Close">
                <FiX />
              </button>
            </div>
          </div>

          <div className="chat-messages-glass">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.type === 'user' ? 'user-row' : 'bot-row'}`}
              >
                <div className={`message-bubble ${message.type === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-row bot-row">
                <div className="message-bubble bot-bubble thinking-bubble">
                  <span className="thinking-text">🤔 Thinking...</span>
                  <div className="typing-dots inline-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area-glass">
            <div className="input-glass-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms, meds..."
                disabled={isLoading}
              />
              <button
                className={`send-btn-glass ${!inputValue.trim() ? 'disabled' : ''}`}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                <FiSend />
              </button>
            </div>
            <div className="legal-text-glass">
              <FiAlertTriangle className="warning-icon" />
              <span>AI can make mistakes. Consult a doctor.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;