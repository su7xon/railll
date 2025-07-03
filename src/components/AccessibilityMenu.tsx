import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Eye, Volume2, Type, Contrast, MousePointer, X, Moon, Sun, Mic } from 'lucide-react';

const AccessibilityMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    voiceOver: false,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    darkMode: false,
    voiceCommands: false
  });

  // Voice recognition setup
  useEffect(() => {
    let recognition: any = null;

    if (settings.voiceCommands && 'webkitSpeechRecognition' in window) {
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
          
          console.log('Emergency voice command detected, navigating to safety dashboard');
          
          // Navigate to safety dashboard
          navigate('/safety');
          
          // Optional: Show a visual confirmation
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
              🚨 Voice Command Detected - Opening Safety Dashboard
            </div>
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        
        // If error occurs, try to restart recognition
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (settings.voiceCommands) {
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
        if (settings.voiceCommands) {
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
        console.log('Voice recognition started');
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
  }, [settings.voiceCommands, navigate]);

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;
    
    if (settings.fontSize === 'large') {
      root.style.fontSize = '120%';
    } else if (settings.fontSize === 'xlarge') {
      root.style.fontSize = '140%';
    } else {
      root.style.fontSize = '100%';
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Check if browser supports speech recognition
  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-1/2 transform -translate-y-1/2 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-50"
        aria-label="Open accessibility menu"
      >
        <Eye className="h-5 w-5" />
      </button>

      {/* Voice Commands Indicator */}
      {settings.voiceCommands && speechRecognitionSupported && (
        <div className="fixed bottom-6 left-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Voice commands active: Say "Help" or "Bachao"</span>
          </div>
        </div>
      )}

      {/* Browser not supported indicator */}
      {settings.voiceCommands && !speechRecognitionSupported && (
        <div className="fixed bottom-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Voice commands not supported in this browser</span>
          </div>
        </div>
      )}

      {/* Accessibility Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto transform transition-all duration-200 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accessibility Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Type className="h-4 w-4 inline mr-2" />
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['normal', 'large', 'xlarge'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`p-2 border rounded-lg text-sm transition-all duration-200 ${
                        settings.fontSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'X-Large'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Commands */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mic className="h-4 w-4 inline mr-2" />
                    Voice Commands
                  </span>
                  <button
                    onClick={() => updateSetting('voiceCommands', !settings.voiceCommands)}
                    disabled={!speechRecognitionSupported}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      settings.voiceCommands ? 'bg-green-600' : 'bg-gray-200'
                    } ${!speechRecognitionSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        settings.voiceCommands ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                {settings.voiceCommands && speechRecognitionSupported && (
                  <p className="text-xs text-green-600 mt-1">Say "Help" or "Bachao" to go to safety dashboard</p>
                )}
                {!speechRecognitionSupported && (
                  <p className="text-xs text-red-600 mt-1">Voice commands not supported in this browser</p>
                )}
              </div>

              {/* Dark Mode */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {settings.darkMode ? <Moon className="h-4 w-4 inline mr-2" /> : <Sun className="h-4 w-4 inline mr-2" />}
                    Dark Mode
                  </span>
                  <button
                    onClick={() => updateSetting('darkMode', !settings.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* High Contrast */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Contrast className="h-4 w-4 inline mr-2" />
                    High Contrast
                  </span>
                  <button
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Reduced Motion */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MousePointer className="h-4 w-4 inline mr-2" />
                    Reduce Motion
                  </span>
                  <button
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Voice Over */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Volume2 className="h-4 w-4 inline mr-2" />
                    Voice Announcements
                  </span>
                  <button
                    onClick={() => updateSetting('voiceOver', !settings.voiceOver)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      settings.voiceOver ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        settings.voiceOver ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setSettings({
                  fontSize: 'normal',
                  contrast: 'normal',
                  voiceOver: false,
                  reducedMotion: false,
                  highContrast: false,
                  largeText: false,
                  darkMode: false,
                  voiceCommands: false
                })}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityMenu;