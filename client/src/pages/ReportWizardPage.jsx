import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  MapPin, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon,
  X,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../api/client.js';
import { CATEGORIES, LOCATIONS } from '../components/ItemFilters.jsx';

export default function ReportWizardPage({ navigate, defaultType = 'lost' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: defaultType,
    title: '',
    category: 'Electronics',
    location: 'Main Library',
    incident_date: new Date().toISOString().slice(0, 16),
    description: '',
    image_url: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [resultItem, setResultItem] = useState(null);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    // Validate format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setError('Invalid format: Please upload a JPEG, PNG, or WEBP image.');
      return;
    }
    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB size limit. Please upload an image under 5MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleUrl) => {
    setImageFile(null);
    setImagePreview(sampleUrl);
    setFormData({ ...formData, image_url: sampleUrl });
  };

  const sampleImages = [
    { label: 'MacBook Air', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
    { label: 'AirPods / Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Jacket / Apparel', url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Student ID / Badge', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      setStep(1);
      return;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      setLoadingStage('Transmitting payload & preparing vision model...');

      const payload = new FormData();
      payload.append('type', formData.type);
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('location', formData.location);
      payload.append('incident_date', new Date(formData.incident_date).toISOString());

      if (imageFile) {
        payload.append('image', imageFile);
      } else if (formData.image_url) {
        payload.append('image_url', formData.image_url);
      }

      setLoadingStage('Gemini 2.5 Flash analyzing visual attributes...');
      const res = await api.createItem(payload);

      setLoadingStage('Evaluating cross-matching algorithm against campus repository...');
      setResultItem(res.item);
      setStep(5); // Success step
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please review fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/items')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery Feed</span>
      </button>

      {/* Main Form Container */}
      <div className="glass-panel p-6 sm:p-8 border-slate-700/80 shadow-2xl">
        
        {/* Progress Bar & Steps Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {step} of 4: {
              step === 1 ? 'Report Classification' :
              step === 2 ? 'Location & Context' :
              step === 3 ? 'Visual Evidence' :
              step === 4 ? 'Review & Confirmation' : 'AI Processing Complete'
            }</span>
            <span className="text-teal-400 font-bold">{Math.min(100, Math.round((step / 4) * 100))}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (step / 4) * 100)}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Classification & Basic Details */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'lost' })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.type === 'lost'
                      ? 'border-amber-500/80 bg-amber-500/10 shadow-glow-amber'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-sm text-amber-400 mb-1">I Lost an Item</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    File a report for a belonging you misplaced on campus.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'found' })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.type === 'found'
                      ? 'border-teal-500/80 bg-teal-500/10 shadow-glow-teal'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-sm text-teal-400 mb-1">I Found an Item</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Report an unattended item you discovered or handed to custody.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Item Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Space Gray MacBook Air M2 13-inch"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="glass-input w-full text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Be specific: include make, model, or identifying keywords.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="glass-input w-full text-xs"
                >
                  {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Approximate Date &amp; Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (formData.title.trim().length < 3) {
                    setError('Please provide a title with at least 3 characters.');
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="btn-primary text-xs"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Description */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Campus Location <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="glass-input w-full text-xs"
              >
                {LOCATIONS.filter(l => l !== 'All').map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe distinguishing visual marks, brand labels, condition, case, stickers, exact desk or room number, or contents..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input w-full text-xs resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                At least 10 characters required. The more details you provide, the higher the AI matching confidence.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.description.trim().length < 10) {
                    setError('Please provide at least 10 characters of description.');
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                className="btn-primary text-xs"
              >
                <span>Continue to Photo Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Photo Upload with Drag & Drop */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Item Photo (Mandatory for Multimodal Vision)
              </label>
              
              {/* Drag and Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-56 rounded-xl border border-slate-700 shadow-xl object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setFormData({ ...formData, image_url: '' });
                      }}
                      className="absolute -top-3 -right-3 p-1.5 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drag and drop your photo here, or{' '}
                        <label className="text-teal-400 hover:underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supported: JPEG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Photo Presets */}
            {!imagePreview && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Or select a demo photo preset:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s.url)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left transition-all group"
                    >
                      <img src={s.url} alt={s.label} className="w-full h-16 object-cover rounded-lg mb-1.5" />
                      <div className="text-[11px] font-medium text-slate-300 truncate group-hover:text-teal-300">
                        {s.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-primary text-xs"
              >
                <span>Review Submission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Final Review & Submit */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Verify Report Information
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Report Type:</span>
                  <div className="font-bold text-slate-200 uppercase mt-0.5">
                    {formData.type === 'lost' ? 'Lost Item' : 'Found Item'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>
                  <div className="font-bold text-teal-400 mt-0.5">{formData.category}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Item Title:</span>
                <div className="font-semibold text-slate-200 mt-0.5">{formData.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Campus Location:</span>
                  <div className="font-semibold text-slate-200 mt-0.5">{formData.location}</div>
                </div>
                <div>
                  <span className="text-slate-500">Incident Timestamp:</span>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {new Date(formData.incident_date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Description:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {formData.description}
                </p>
              </div>

              {imagePreview && (
                <div>
                  <span className="text-slate-500">Attached Visual Evidence:</span>
                  <img src={imagePreview} alt="Preview" className="h-28 rounded-xl object-cover mt-1.5 border border-slate-800" />
                </div>
              )}
            </div>

            {/* AI Automated Pipeline Advisory */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-indigo-200">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Automated AI Pipeline on Submission
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Upon filing, Gemini 2.5 Flash will automatically index visual attributes and cross-reference active opposing records. Matches exceeding the 60% threshold will be surfaced immediately.
              </p>
            </div>

            {/* Submission loading indicator */}
            {loading && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-3">
                <Cpu className="w-5 h-5 animate-spin text-teal-400 shrink-0" />
                <span>{loadingStage}</span>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(3)}
                className="btn-secondary text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="btn-primary text-xs px-6 py-2.5 disabled:opacity-50"
              >
                {loading ? 'Processing with Gemini...' : 'Submit Report & Match'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Success & Immediate AI Matches */}
        {step === 5 && (
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Item Report Filed Successfully</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Gemini has extracted visual tags and executed background matching against the campus repository.
              </p>
            </div>

            {/* Extracted AI Tags Display */}
            {resultItem?.ai_tags && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs max-w-md mx-auto space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Extracted Structural Tags</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div><span className="text-slate-500">Color:</span> {resultItem.ai_tags.extracted_color || 'N/A'}</div>
                  <div><span className="text-slate-500">Brand:</span> {resultItem.ai_tags.brand || 'N/A'}</div>
                  <div><span className="text-slate-500">Condition:</span> {resultItem.ai_tags.condition || 'N/A'}</div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/items/${resultItem?.id}`)}
                className="btn-primary text-xs"
              >
                View Detailed Item &amp; Matches
              </button>
              <button
                onClick={() => navigate('/items')}
                className="btn-secondary text-xs"
              >
                Back to Discovery Feed
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
