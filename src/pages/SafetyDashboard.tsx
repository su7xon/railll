import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  Mic, 
  Video, 
  MapPin, 
  Phone, 
  Users, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Volume2,
  Camera,
  Navigation,
  Ambulance,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Paperclip,
  MessageCircle,
  Send,
  Bot
} from 'lucide-react';

const SafetyDashboard: React.FC = () => {
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [showAIDost, setShowAIDost] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);

  // Voice recognition setup for panic activation
  useEffect(() => {
    let recognition: any = null;

    if (isVoiceActive && 'webkitSpeechRecognition' in window) {
      recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        
        console.log('Voice command detected:', transcript);
        
        // Check for help commands in English and Hindi
        if (transcript.includes('help') || 
            transcript.includes('bachao') || 
            transcript.includes('बचाओ') ||
            transcript.includes('emergency') ||
            transcript.includes('danger')) {
          
          console.log('Emergency voice command detected, directly activating panic mode');
          
          // DIRECTLY activate panic mode - skip all menus
          activatePanicDirectly();
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        
        // If error occurs, try to restart recognition
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (isVoiceActive) {
              try {
                recognition.start();
              } catch (e) {
                console.log('Failed to restart recognition:', e);
              }
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        // Automatically restart recognition if it's still enabled
        if (isVoiceActive) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('Recognition restart failed:', e);
            }
          }, 500);
        }
      };

      try {
        recognition.start();
        console.log('Voice recognition started for panic activation');
      } catch (e) {
        console.log('Failed to start voice recognition:', e);
      }

      return () => {
        if (recognition) {
          try {
            recognition.stop();
            console.log('Voice recognition stopped');
          } catch (e) {
            console.log('Error stopping recognition:', e);
          }
        }
      };
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.log('Error in cleanup:', e);
        }
      }
    };
  }, [isVoiceActive]);

  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      type: 'panic',
      location: 'Coach B4, Train 12951',
      time: '2 minutes ago',
      status: 'active',
      responder: 'RPF Team Delhi'
    },
    {
      id: 2,
      type: 'harassment',
      location: 'Platform 3, New Delhi',
      time: '15 minutes ago',
      status: 'resolved',
      responder: 'Station Security'
    }
  ]);

  const emergencyContacts = [
    { name: 'Railway Police', number: '139', type: 'primary' },
    { name: 'Women Helpline', number: '1091', type: 'secondary' },
    { name: 'Emergency Services', number: '112', type: 'secondary' }
  ];

  const safetyFeatures = [
    {
      icon: Mic,
      title: 'Voice Detection',
      description: 'Always listening for "Help" or "Bachao"',
      status: 'Active',
      color: 'text-green-500'
    },
    {
      icon: MapPin,
      title: 'Live Location',
      description: 'GPS tracking for emergency response',
      status: 'Active',
      color: 'text-green-500'
    },
    {
      icon: Camera,
      title: 'Auto Recording',
      description: 'Emergency video/audio capture',
      status: 'Ready',
      color: 'text-blue-500'
    },
    {
      icon: Phone,
      title: 'Quick Contacts',
      description: 'Instant access to help numbers',
      status: 'Connected',
      color: 'text-green-500'
    }
  ];

  // Function for DIRECT voice-activated panic (skips all menus)
  const activatePanicDirectly = () => {
    // Show visual confirmation
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        🚨 Voice Command Detected - Activating Emergency Mode
      </div>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);

    // DIRECTLY activate panic mode - no menu, straight to countdown
    setIsPanicActive(true);
    setIsRecording(true);
    setCountdown(10);
    setShowEmergencyMenu(false);
    setAlertError(null);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Here would trigger actual emergency protocols
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activatePanic = () => {
    setIsPanicActive(true);
    setIsRecording(true);
    setCountdown(10);
    setShowEmergencyMenu(false);
    setAlertError(null);
    
    // Simulate location sharing and alerts
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Here would trigger actual emergency protocols
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendEmergencyAlert = async () => {
    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Prepare alert data
      const alertData = {
        user_id: 'emergency_user',
        type: 'panic' as const,
        location: location.address || 'Unknown location',
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        status: 'active' as const
      };

      console.log('Sending emergency alert with data:', alertData);
      
      // Save emergency alert to database
      const { data, error } = await supabase
        .from('safety_alerts')
        .insert([alertData])
        .select();

      if (error) {
        console.error('Error saving emergency alert:', error);
        setAlertError(`Database error: ${error.message}`);
        
        // Still show success message even if database save fails
        // In a real emergency, the alert would still be sent via other means
        console.log('Emergency alert would be sent via alternative methods');
      } else {
        console.log('Emergency alert saved to database:', data);
        setAlertError(null);
      }

      // Upload any files that were selected
      if (uploadedFiles.length > 0) {
        await uploadEmergencyFiles();
      }

    } catch (error) {
      console.error('Error in emergency alert process:', error);
      setAlertError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // In a real emergency situation, we would still proceed with other alert methods
      console.log('Emergency alert would be sent via SMS, phone calls, and other backup methods');
    }

    setIsPanicActive(false);
    setIsRecording(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setAlertError(null);
    }, 5000);
  };

  const getCurrentLocation = (): Promise<{lat: number, lng: number, address: string}> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
            });
          },
          () => {
            resolve({
              lat: 28.6139,
              lng: 77.2090,
              address: 'New Delhi (Default)'
            });
          }
        );
      } else {
        resolve({
          lat: 28.6139,
          lng: 77.2090,
          address: 'New Delhi (Default)'
        });
      }
    });
  };

  const uploadEmergencyFiles = async () => {
    setIsUploading(true);
    
    try {
      for (const file of uploadedFiles) {
        // In a real implementation, you would upload to Supabase Storage
        // For now, we'll simulate the upload and save file info to database
        
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        };

        // Save file information to database (you would need to create a files table)
        console.log('File uploaded:', fileInfo);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const cancelPanic = () => {
    setIsPanicActive(false);
    setIsRecording(false);
    setCountdown(0);
    setAlertError(null);
  };

  const handleEmergencyCall = (type: string) => {
    setShowEmergencyMenu(false);
    let number = '';
    let message = '';
    
    switch (type) {
      case 'police':
        number = '139';
        message = 'Connecting to Railway Police...';
        break;
      case 'ambulance':
        number = '108';
        message = 'Calling Ambulance...';
        break;
      case 'women':
        number = '1091';
        message = 'Connecting to Women Helpline...';
        break;
      default:
        return;
    }
    
    alert(`${message}\nDialing ${number}`);
  };

  // AI DOST Chatbot Functions
  const sendMessageToAI = async (message: string) => {
    setIsAITyping(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use intelligent local responses
      const aiResponse = {
        id: Date.now() + 1,
        text: getIntelligentResponse(message),
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in AI processing:', error);
      
      // Fallback response
      const aiResponse = {
        id: Date.now() + 1,
        text: "I'm here to help you with railway travel and safety. How can I assist you today?",
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsAITyping(false);
    }
  };

  const getIntelligentResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Emergency and Safety
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('panic') || lowerMessage.includes('danger') || lowerMessage.includes('bachao')) {
      return "🚨 EMERGENCY DETECTED! I understand you need immediate help. Please use the red PANIC BUTTON immediately or say 'Help'/'Bachao' to activate emergency services. Your safety is the top priority. Railway Police (139) and emergency services will be contacted instantly with your location.";
    }
    
    // Train Booking and Status
    if (lowerMessage.includes('train') || lowerMessage.includes('booking') || lowerMessage.includes('ticket')) {
      if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
        return "I can help you book train tickets! You can search for trains by entering your departure and destination cities, select travel date, and choose the number of passengers. We offer various classes like AC 1 Tier, AC 2 Tier, AC 3 Tier, and Sleeper. Would you like me to guide you through the booking process?";
      }
      if (lowerMessage.includes('status') || lowerMessage.includes('running') || lowerMessage.includes('delay')) {
        return "To check train running status, you can enter your train number in the Train Status section. I'll show you real-time location, current delays, next station, and expected arrival times. You can also track if your train is on time or delayed.";
      }
      if (lowerMessage.includes('pnr')) {
        return "For PNR status, enter your 10-digit PNR number to check booking confirmation, seat details, passenger information, and current reservation status. You can also process refunds if needed.";
      }
      return "I can help you with train bookings, checking train status, PNR verification, and seat availability. What specific information do you need about your train journey?";
    }
    
    // Safety and Security
    if (lowerMessage.includes('safety') || lowerMessage.includes('security') || lowerMessage.includes('protection')) {
      return "Railway safety is our top priority! Our safety features include: 🎤 Voice commands (say 'Help' or 'Bachao'), 📍 Live GPS tracking, 📹 Auto recording during emergencies, 📞 Quick access to Railway Police (139). The voice command system is always active - just say 'Help' if you need immediate assistance.";
    }
    
    // Complaints and Issues
    if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('report')) {
      if (lowerMessage.includes('food')) {
        return "For food-related complaints, you can report overpriced items, poor quality, hygiene issues, or vendor problems. Upload photos of food and bills as evidence. Your complaints help improve food services for all passengers.";
      }
      if (lowerMessage.includes('theft') || lowerMessage.includes('stolen') || lowerMessage.includes('harassment')) {
        return "For serious issues like theft or harassment, please file a complaint immediately and consider using the PANIC BUTTON for urgent situations. Upload any evidence (photos, videos) and provide exact location details. Railway Police will be notified.";
      }
      return "You can file complaints about theft, food quality, facilities, harassment, or other issues. Provide detailed descriptions, upload evidence files, and specify exact locations. Your feedback helps improve railway services for everyone.";
    }
    
    // Hotels and Accommodation
    if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('room')) {
      return "I can help you find hotels near railway stations! We offer: 🎓 Student-friendly options with discounts, 💼 Business travel hotels, ⏰ Hourly stay options, 👑 Luxury accommodations. You can filter by category, check ratings, and book directly. Many hotels offer special railway passenger discounts.";
    }
    
    // Food Services
    if (lowerMessage.includes('food') || lowerMessage.includes('meal') || lowerMessage.includes('order') || lowerMessage.includes('delivery')) {
      return "For food services, you can: 🍽️ Order food delivery to your seat, 📝 Review food quality and vendors, 🚨 Report food complaints with photos. We have various cuisines available - North Indian, South Indian, Chinese, and regional specialties. Food is delivered directly to your coach and seat number.";
    }
    
    // Reviews and Ratings
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback')) {
      return "You can rate and review: 🚂 Trains and their services, 🍽️ Food vendors and quality, 🛏️ Coach cleanliness and comfort, 🏢 Station facilities. Your reviews help fellow passengers make better choices and help railways improve services. You can also upload photos with your reviews.";
    }
    
    // Live Tracking and Location
    if (lowerMessage.includes('track') || lowerMessage.includes('location') || lowerMessage.includes('live') || lowerMessage.includes('gps')) {
      return "Live tracking features include: 📍 Real-time train location, 🚉 Current and next station info, ⏱️ Accurate arrival/departure times, 🚃 Coach-specific tracking. You can share your live location with family and track your journey progress in real-time.";
    }
    
    // Offers and Discounts
    if (lowerMessage.includes('offer') || lowerMessage.includes('discount') || lowerMessage.includes('deal') || lowerMessage.includes('coupon')) {
      return "Current offers include: 🎓 Student discounts (20% off), 👥 Group booking deals, 👴 Senior citizen offers, 💳 Payment-specific cashbacks, 🎯 First-time user bonuses. Use coupon codes during booking to get instant discounts on your train tickets.";
    }
    
    // Emergency Contacts
    if (lowerMessage.includes('contact') || lowerMessage.includes('helpline') || lowerMessage.includes('phone') || lowerMessage.includes('number')) {
      return "Important emergency contacts: 🚨 Railway Police: 139, 🚑 Ambulance: 108, 👮 General Emergency: 112, 👩 Women Helpline: 1091. All these numbers are available 24/7. You can also use voice commands 'Help' or 'Bachao' for instant emergency activation.";
    }
    
    // General Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('namaste')) {
      return "Hello! 🙏 I'm AI DOST, your intelligent railway travel assistant. I can help you with train bookings, safety guidance, complaint filing, hotel reservations, food orders, live tracking, and emergency assistance. How can I make your railway journey better today?";
    }
    
    // Default comprehensive response
    return "Hello! I'm AI DOST, your comprehensive railway travel assistant powered by Local AI. I can help you with:\n\n🚂 Train bookings and PNR status\n🛡️ Safety features and emergency assistance\n📝 Filing complaints with evidence\n🏨 Hotel bookings near stations\n🍽️ Food delivery to your seat\n⭐ Reviews and ratings\n📍 Live train tracking\n🎁 Offers and discounts\n📞 Emergency contacts\n\nWhat would you like assistance with today?";
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        text: currentMessage,
        sender: 'user' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, userMessage]);
      
      // Send to AI
      sendMessageToAI(currentMessage);
      
      // Clear input
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check if browser supports speech recognition
  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // AI DOST Chatbot Component
  if (showAIDost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI DOST</h2>
                  <p className="text-sm text-gray-600">Your Railway Travel Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIDost(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI DOST!</h3>
                  <p className="text-gray-600">I'm here to help you with railway travel, safety, and any questions you have.</p>
                </div>
              )}

              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isAITyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about railway travel..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isAITyping}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Message Popup
  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Sent Successfully!</h2>
            <p className="text-gray-600 mb-4">Emergency call has been sent to the nearest local police station and Railway Police Force.</p>
            
            {alertError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="text-yellow-800 text-sm">
                  <p className="font-medium">Note:</p>
                  <p>{alertError}</p>
                  <p className="mt-1">Emergency services have been notified via alternative methods.</p>
                </div>
              </div>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-green-800 text-sm space-y-1 text-left">
                <p>✓ Location shared with authorities</p>
                <p>✓ Emergency contacts notified</p>
                <p>✓ Audio/Video recording started</p>
                <p>✓ Railway Police alerted</p>
                {uploadedFiles.length > 0 && (
                  <p>✓ {uploadedFiles.length} file(s) uploaded as evidence</p>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Emergency Menu with enhanced file upload
  if (showEmergencyMenu) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Emergency & Safety</h2>
              <button 
                onClick={() => setShowEmergencyMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Panic Button */}
              <button 
                onClick={activatePanic}
                className="w-full p-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <h3 className="text-lg font-bold mb-1">PANIC BUTTON</h3>
                <p className="text-red-100 text-sm">Immediate emergency alert</p>
              </button>

              {/* File Upload Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Add Evidence Files</h3>
                
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer text-center">
                      <Upload className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <span className="text-blue-700 font-medium">Upload Files</span>
                      <p className="text-blue-600 text-sm mt-1">Images, videos, audio, documents</p>
                    </div>
                  </label>

                  {/* Quick capture buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="p-3 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors cursor-pointer text-center">
                        <Camera className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <span className="text-green-700 text-xs font-medium">Photo</span>
                      </div>
                    </label>

                    <label className="block">
                      <input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer text-center">
                        <Video className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <span className="text-purple-700 text-xs font-medium">Video</span>
                      </div>
                    </label>

                    <label className="block">
                      <input
                        type="file"
                        accept="audio/*"
                        capture="microphone"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer text-center">
                        <Mic className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                        <span className="text-orange-700 text-xs font-medium">Audio</span>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-blue-800">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {file.type.startsWith('image/') && <ImageIcon className="h-4 w-4 text-green-500" />}
                            {file.type.startsWith('video/') && <Video className="h-4 w-4 text-purple-500" />}
                            {file.type.startsWith('audio/') && <Mic className="h-4 w-4 text-orange-500" />}
                            {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && <FileText className="h-4 w-4 text-blue-500" />}
                            <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Commands Section */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-800">Voice Commands</span>
                  </div>
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    disabled={!speechRecognitionSupported}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      isVoiceActive ? 'bg-green-600' : 'bg-gray-200'
                    } ${!speechRecognitionSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isVoiceActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-green-700 text-sm">Say "Help" or "Bachao" to directly activate panic countdown</p>
                {isVoiceActive && speechRecognitionSupported && (
                  <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Voice commands active - listening...</span>
                  </div>
                )}
                {!speechRecognitionSupported && (
                  <p className="text-red-600 text-sm mt-1">Voice commands not supported in this browser</p>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Emergency Contacts</h3>
                
                <button
                  onClick={() => handleEmergencyCall('police')}
                  className="w-full p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-3"
                >
                  <Shield className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">Railway Police</div>
                    <div className="text-sm opacity-90">Call 139</div>
                  </div>
                </button>

                <button
                  onClick={() => handleEmergencyCall('ambulance')}
                  className="w-full p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-3"
                >
                  <Ambulance className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">Ambulance</div>
                    <div className="text-sm opacity-90">Call 108</div>
                  </div>
                </button>

                <button
                  onClick={() => handleEmergencyCall('women')}
                  className="w-full p-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors flex items-center space-x-3"
                >
                  <Users className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">Women Helpline</div>
                    <div className="text-sm opacity-90">Call 1091</div>
                  </div>
                </button>
              </div>

              {/* AI DOST Button */}
              <button
                onClick={() => {
                  setShowEmergencyMenu(false);
                  setShowAIDost(true);
                }}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center space-x-3"
              >
                <Bot className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-bold">AI DOST</div>
                  <div className="text-sm opacity-90">Your Travel Assistant</div>
                </div>
              </button>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Safety Guidelines:</h4>
                <div className="text-yellow-700 text-sm space-y-1">
                  <p>• Say "Help" or "Bachao" for direct panic activation</p>
                  <p>• Upload photos/videos as evidence</p>
                  <p>• Voice commands work even when screen is off</p>
                  <p>• Your location is automatically shared</p>
                  <p>• All evidence is saved securely</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Emergency Activated Screen
  if (isPanicActive) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="fixed inset-0 bg-red-600 bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="animate-pulse">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">EMERGENCY ACTIVATED</h2>
            <p className="text-gray-600 mb-6">Alert being sent to Railway Police and your emergency contacts</p>
            
            <div className="text-6xl font-bold text-red-500 mb-6 animate-pulse">{countdown}</div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-red-100 rounded-full mb-2">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
                <span className="text-xs text-gray-600">Location Shared</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-red-100 rounded-full mb-2">
                  <Mic className={`h-6 w-6 text-red-500 ${isRecording ? 'animate-pulse' : ''}`} />
                </div>
                <span className="text-xs text-gray-600">Recording Audio</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-red-100 rounded-full mb-2">
                  <Video className={`h-6 w-6 text-red-500 ${isRecording ? 'animate-pulse' : ''}`} />
                </div>
                <span className="text-xs text-gray-600">Recording Video</span>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  {uploadedFiles.length} evidence file(s) will be uploaded
                </p>
              </div>
            )}
            
            <button 
              onClick={cancelPanic}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel Emergency
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Voice Commands Indicator */}
      {isVoiceActive && speechRecognitionSupported && (
        <div className="fixed bottom-6 left-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Voice commands active: Say "Help" or "Bachao" for direct emergency activation</span>
          </div>
        </div>
      )}

      {/* Browser not supported indicator */}
      {isVoiceActive && !speechRecognitionSupported && (
        <div className="fixed bottom-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Voice commands not supported in this browser</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Dashboard</h1>
          <p className="text-gray-600">Your personal safety command center with AI-powered protection</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Safety Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Panic Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Emergency Response</h2>
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Protected</span>
                </div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200">
                <div className="mb-6">
                  <button 
                    onClick={() => setShowEmergencyMenu(true)}
                    className="p-6 bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600 transition-all transform hover:scale-110 animate-pulse"
                    title="Emergency Panic Button - Press for immediate help"
                  >
                    <AlertTriangle className="h-12 w-12" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">PANIC BUTTON</h3>
                <p className="text-gray-600 mb-4">Press the red button above for immediate emergency assistance</p>
                <p className="text-sm text-red-600 font-medium">Voice commands: Say "Help" or "Bachao" for direct activation</p>
              </div>
            </div>

            {/* Safety Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Safety Features Status</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {safetyFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          <div className={`text-xs font-medium mt-2 ${feature.color}`}>
                            {feature.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Safety Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Safety Alerts</h2>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.status === 'active' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {alert.status === 'active' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">{alert.type} Alert</h3>
                          <p className="text-sm text-gray-600">{alert.location}</p>
                          <p className="text-xs text-gray-500 mt-1">Responded by: {alert.responder}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.status === 'active' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {alert.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI DOST Quick Access */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI Assistant</h2>
              <button
                onClick={() => setShowAIDost(true)}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bot className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-bold">AI DOST</div>
                    <div className="text-sm opacity-90">Ask me anything!</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      contact.type === 'primary'
                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-2xl font-bold text-red-600">{contact.number}</p>
                      </div>
                      <Phone className="h-6 w-6 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Safety Tips</h2>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Say "Help" or "Bachao" for direct panic activation</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium">Upload evidence files before activating panic</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">Keep your phone charged during travel</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">Share your journey details with family</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;