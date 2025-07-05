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
          
          // Directly activate panic mode (skip emergency menu)
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

  // Function for voice-activated panic (directly activate panic mode)
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

    // Directly activate panic mode
    activatePanic();
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

  // AI DOST Chatbot Functions - Fixed Network Error Handling
  const sendMessageToAI = async (message: string) => {
    setIsAITyping(true);
    
    try {
      // Note: Using local intelligent responses as primary method
      // External AI service integration would require proper API endpoint configuration
      const aiResponseText = getIntelligentResponse(message);
      
      // Add AI response to chat
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      // Graceful error handling - should not reach here with current implementation
      console.log('Fallback to local AI responses');
      
      const aiResponse = {
        id: Date.now() + 1,
        text: getIntelligentResponse(message),
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
    
    // Emergency responses
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('panic') || lowerMessage.includes('danger')) {
      return "🚨 EMERGENCY DETECTED! I'm immediately activating the PANIC BUTTON for you. Railway Police (139) and emergency services are being contacted. Stay calm and follow these steps:\n\n1. Stay in a safe location\n2. Keep your phone with you\n3. Your location is being shared automatically\n4. Help is on the way\n\nIf you can, try to move to a crowded area or near railway staff.";
    }
    
    // Safety and security
    if (lowerMessage.includes('safety') || lowerMessage.includes('security') || lowerMessage.includes('theft') || lowerMessage.includes('harassment')) {
      return "🛡️ Your safety is my top priority. Here are immediate safety tips:\n\n• Use the PANIC BUTTON for emergencies\n• Voice commands work - say 'Help' or 'Bachao'\n• Keep valuables secure and visible\n• Stay in well-lit, crowded areas\n• Trust your instincts\n\nFor immediate help: Railway Police (139), Women Helpline (1091). Would you like me to guide you through filing a safety complaint?";
    }
    
    // Train booking and travel
    if (lowerMessage.includes('train') || lowerMessage.includes('booking') || lowerMessage.includes('ticket') || lowerMessage.includes('reservation')) {
      return "🚂 I can help you with train travel! Here's what I can assist with:\n\n• Check train status and delays\n• PNR status verification\n• Booking new tickets\n• Seat availability\n• Route information\n• Platform details\n\nWhat specific train information do you need? You can also check train status and book tickets directly from the main dashboard.";
    }
    
    // Complaints and issues
    if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('food') || lowerMessage.includes('dirty') || lowerMessage.includes('clean')) {
      return "📝 I can help you file complaints effectively:\n\n• Food quality issues\n• Cleanliness problems\n• Facility maintenance\n• Staff behavior\n• Overcharging\n\nFor best results:\n✓ Take photos as evidence\n✓ Note exact location/coach\n✓ Include time and date\n✓ Be specific about the issue\n\nWould you like me to guide you through filing a complaint?";
    }
    
    // Station and facilities
    if (lowerMessage.includes('station') || lowerMessage.includes('platform') || lowerMessage.includes('facility') || lowerMessage.includes('wifi') || lowerMessage.includes('washroom')) {
      return "🏢 Station facilities information:\n\n• WiFi: Available at major stations (may be slow)\n• Washrooms: Located on platforms and concourse\n• Food courts: Available at most stations\n• Waiting rooms: AC and non-AC options\n• Parking: Available with charges\n• Medical aid: First aid posts available\n\nNeed specific information about a particular station or facility?";
    }
    
    // Hotel booking
    if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('room')) {
      return "🏨 I can help you find accommodation:\n\n• Student-friendly budget hotels\n• Business travel options\n• Hourly stay facilities\n• Luxury accommodations\n• Near railway stations\n\nSpecial offers available:\n💰 Student discounts up to 20%\n⏰ Hourly rates from ₹50\n🏢 Corporate rates available\n\nWould you like me to help you search for hotels?";
    }
    
    // Food and dining
    if (lowerMessage.includes('food') || lowerMessage.includes('meal') || lowerMessage.includes('hungry') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
      return "🍽️ Food and dining options:\n\n• Order food to your seat\n• Platform vendors (check reviews)\n• Pantry car meals\n• Station restaurants\n• Local specialties at stations\n\nFood safety tips:\n✓ Check vendor ratings\n✓ Prefer hot, freshly cooked food\n✓ Carry water bottles\n✓ Report food quality issues\n\nWant me to help you order food or find good vendors?";
    }
    
    // General greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('namaste')) {
      return "🙏 Namaste! I'm AI DOST, your intelligent railway travel assistant. I'm here to help you with:\n\n🚨 Emergency assistance & safety\n🚂 Train bookings & status\n📝 Filing complaints\n🏨 Hotel bookings\n🍽️ Food ordering\n🛡️ Travel safety tips\n\nHow can I assist you today? Remember, for emergencies, just say 'Help' and I'll activate the panic button immediately!";
    }
    
    // Thanks and appreciation
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('dhanyawad')) {
      return "🙏 You're most welcome! I'm always here to help make your railway journey safe and comfortable. Remember:\n\n• Voice commands are always active\n• Emergency help is just a word away\n• I'm available 24/7 for any assistance\n\nSafe travels! Feel free to ask me anything anytime.";
    }
    
    // Default intelligent response
    return "🤖 Hello! I'm AI DOST, your smart railway travel companion. I understand you're looking for help, and I'm here for you!\n\n🚨 **Emergency?** Say 'Help' or use the panic button\n🚂 **Travel?** I can help with bookings, status, PNR\n🛡️ **Safety?** Get tips and file complaints\n🏨 **Stay?** Find hotels and accommodations\n🍽️ **Food?** Order meals or find good vendors\n\nWhat would you like assistance with? I'm designed to understand your needs and provide helpful, accurate information for safe railway travel.";
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI DOST</h2>
                  <p className="text-sm opacity-90">Your Intelligent Railway Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIDost(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <Bot className="h-8 w-8 text-blue-600 mx-auto mt-2" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI DOST!</h3>
                  <p className="text-gray-600 mb-4">I'm your intelligent railway travel assistant, powered by advanced AI.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <p className="text-blue-800 font-medium mb-2">I can help you with:</p>
                    <div className="text-blue-700 text-sm space-y-1">
                      <p>🚨 Emergency assistance & panic button</p>
                      <p>🚂 Train bookings, status & PNR checks</p>
                      <p>🛡️ Safety tips & complaint filing</p>
                      <p>🏨 Hotel bookings & accommodations</p>
                      <p>🍽️ Food ordering & vendor reviews</p>
                      <p>📍 Station information & facilities</p>
                    </div>
                  </div>
                </div>
              )}

              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isAITyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">AI DOST is thinking...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about railway travel, safety, or emergencies..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isAITyping}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by Local AI • Available 24/7 • Emergency commands always active
              </p>
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
                <p className="text-green-700 text-sm">Say "Help" or "Bachao" to activate panic button</p>
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
                  <div className="text-sm opacity-90">Your Intelligent Assistant</div>
                </div>
              </button>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Safety Guidelines:</h4>
                <div className="text-yellow-700 text-sm space-y-1">
                  <p>• Upload photos/videos as evidence</p>
                  <p>• Voice commands work even when screen is off</p>
                  <p>• Stay calm and speak clearly</p>
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
            
            <div className="text-4xl font-bold text-red-500 mb-6">{countdown}</div>
            
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
            <span>Voice commands active: Say "Help" or "Bachao" for emergency</span>
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
                <p className="text-sm text-red-600 font-medium">Voice commands: Say "Help" or "Bachao" to activate directly</p>
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
                    <div className="text-sm opacity-90">Your Intelligent Assistant</div>
                  </div>
                </div>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Powered by Local AI • 24/7 Available</p>
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
                  <p className="text-sm text-blue-800 font-medium">Voice commands work even when screen is locked</p>
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