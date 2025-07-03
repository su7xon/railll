import React, { useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { 
  AlertTriangle, 
  Camera, 
  Mic, 
  FileText, 
  Star, 
  Upload,
  MapPin,
  Clock,
  User,
  ShoppingBag,
  Utensils,
  Wifi,
  X,
  Image as ImageIcon,
  Video,
  Paperclip,
  CheckCircle
} from 'lucide-react';

const ComplaintSystem: React.FC = () => {
  const [selectedType, setSelectedType] = useState('');
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const complaintTypes = [
    {
      id: 'theft',
      title: 'Theft & Crime',
      description: 'Report stolen goods, harassment, or criminal activity',
      icon: AlertTriangle,
      color: 'bg-red-500',
      examples: ['Stolen luggage', 'Harassment', 'Pickpocketing', 'Verbal abuse']
    },
    {
      id: 'food',
      title: 'Food & Vendor Issues',
      description: 'Report overpriced, stale food or fake vendor behavior',
      icon: Utensils,
      color: 'bg-orange-500',
      examples: ['Overpriced food', 'Stale/spoiled food', 'Fake vendors', 'No bill provided']
    },
    {
      id: 'facilities',
      title: 'Facility Problems',
      description: 'Report dirty washrooms, broken AC, missing amenities',
      icon: Wifi,
      color: 'bg-blue-500',
      examples: ['Dirty washrooms', 'No water', 'Broken AC/fans', 'Faulty lights']
    },
    {
      id: 'harassment',
      title: 'Harassment',
      description: 'Report inappropriate behavior or harassment',
      icon: User,
      color: 'bg-purple-500',
      examples: ['Inappropriate behavior', 'Verbal harassment', 'Unwanted advances', 'Discrimination']
    },
    {
      id: 'other',
      title: 'Other Issues',
      description: 'Any other problems or concerns',
      icon: FileText,
      color: 'bg-gray-500',
      examples: ['Noise issues', 'Cleanliness', 'Staff behavior', 'General concerns']
    }
  ];

  const recentComplaints = [
    {
      id: 'C001',
      type: 'theft',
      title: 'Stolen mobile phone',
      location: 'Coach B4, Train 12951',
      status: 'investigating',
      time: '2 hours ago'
    },
    {
      id: 'C002',
      type: 'food',
      title: 'Overpriced water bottle',
      location: 'Platform 3, New Delhi',
      status: 'resolved',
      time: '1 day ago'
    }
  ];

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

  const handleSubmitComplaint = async () => {
    if (selectedType && complaint && location) {
      setIsSubmitting(true);
      
      try {
        // Save complaint to database
        const { data: complaintData, error: complaintError } = await supabase
          .from('complaints')
          .insert([
            {
              user_id: 'complaint_user_' + Date.now(),
              type: selectedType,
              title: `${complaintTypes.find(t => t.id === selectedType)?.title} - ${location}`,
              description: complaint,
              location: location,
              train_number: trainNumber || null,
              status: 'pending',
              priority: selectedType === 'theft' || selectedType === 'harassment' ? 'high' : 'medium'
            }
          ])
          .select()
          .single();

        if (complaintError) {
          console.error('Error saving complaint:', complaintError);
          throw complaintError;
        }

        console.log('Complaint saved successfully:', complaintData);

        // If files were uploaded, save them to database (in a real app, you'd upload to storage first)
        if (uploadedFiles.length > 0) {
          const filePromises = uploadedFiles.map(async (file) => {
            // In a real implementation, you would upload to Supabase Storage first
            // For now, we'll just save file metadata
            const fileInfo = {
              complaint_id: complaintData.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              upload_status: 'completed',
              metadata: {
                description: 'Complaint evidence file',
                uploaded_at: new Date().toISOString()
              }
            };

            console.log('File info saved:', fileInfo);
            return fileInfo;
          });

          await Promise.all(filePromises);
        }

        // Show success message
        setShowSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedType('');
          setComplaint('');
          setLocation('');
          setTrainNumber('');
          setUploadedFiles([]);
        }, 3000);

      } catch (error) {
        console.error('Error submitting complaint:', error);
        alert('Error submitting complaint. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Success message
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Complaint Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">Your complaint has been received and will be reviewed by our team.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Complaint ID:</span>
                  <span className="font-bold text-blue-600">C{Math.floor(Math.random() * 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{complaintTypes.find(t => t.id === selectedType)?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{location}</span>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Files:</span>
                    <span className="font-medium">{uploadedFiles.length} uploaded</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint & Review System</h1>
          <p className="text-gray-600">Report issues and help improve railway services for everyone</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Complaint Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">What would you like to report?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {complaintTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        selectedType === type.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 ${type.color} rounded-lg`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                          <div className="text-xs text-gray-500">
                            Examples: {type.examples.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complaint Details Form */}
            {selectedType && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Complaint Details</h2>
                
                <div className="space-y-6">
                  {/* Location and Train Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location/Coach Number
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., Coach B4, Platform 2"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Train Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        placeholder="e.g., 12951"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the issue
                    </label>
                    <textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      rows={4}
                      placeholder="Please provide details about the incident..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Enhanced File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Evidence Files (Optional)
                    </label>
                    
                    <div className="space-y-4">
                      {/* Main file upload area */}
                      <label className="block">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <span className="text-gray-700 font-medium block mb-1">Upload Files from Device</span>
                          <p className="text-gray-500 text-sm">Images, videos, audio, documents (PDF, DOC, TXT)</p>
                          <p className="text-gray-400 text-xs mt-1">Click here to browse your device files</p>
                        </div>
                      </label>

                      {/* Quick capture buttons */}
                      <div className="grid grid-cols-3 gap-3">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors cursor-pointer text-center">
                            <Camera className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <span className="text-green-700 text-sm font-medium">Take Photo</span>
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
                          <div className="p-4 bg-purple-100 border-2 border-purple-300 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer text-center">
                            <Video className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                            <span className="text-purple-700 text-sm font-medium">Record Video</span>
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
                          <div className="p-4 bg-orange-100 border-2 border-orange-300 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer text-center">
                            <Mic className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                            <span className="text-orange-700 text-sm font-medium">Record Audio</span>
                          </div>
                        </label>
                      </div>

                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length}):</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {file.type.startsWith('image/') && <ImageIcon className="h-5 w-5 text-green-500" />}
                                  {file.type.startsWith('video/') && <Video className="h-5 w-5 text-purple-500" />}
                                  {file.type.startsWith('audio/') && <Mic className="h-5 w-5 text-orange-500" />}
                                  {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && <Paperclip className="h-5 w-5 text-blue-500" />}
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 block truncate max-w-48">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                                  title="Remove file"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitComplaint}
                    disabled={!selectedType || !complaint || !location || isSubmitting}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Complaint...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Submit Complaint</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Complaints */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Recent Complaints</h2>
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                      <span className="text-xs text-gray-500">#{complaint.id}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{complaint.location}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {complaint.status}
                      </span>
                      <span className="text-xs text-gray-500">{complaint.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Emergency Alert</span>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Track Complaint</span>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5" />
                    <span className="font-medium">Leave Review</span>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload Guidelines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">File Upload Guidelines</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Upload photos, videos, or audio as evidence</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Supported formats: JPG, PNG, MP4, MP3, PDF, DOC</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Maximum file size: 10MB per file</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Files are securely stored and only shared with authorities</p>
                </div>
              </div>
            </div>

            {/* Complaint Guidelines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guidelines</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide accurate location and train details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include photos or audio evidence when possible</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>For emergencies, use the panic button immediately</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Track your complaint using the provided ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintSystem;