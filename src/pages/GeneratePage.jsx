import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generateVideo } from '../services/api';

const ASPECT_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'];

function FileUploadZone({ type, files, maxFiles, onAddFiles, onRemoveFile, accept, label, icon }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles) => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} ${type}s allowed`);
      const allowed = newFiles.slice(0, maxFiles - files.length);
      if (allowed.length > 0) onAddFiles(allowed);
    } else {
      onAddFiles(newFiles);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-dark-200">
        <span className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {icon}
            {label}
          </span>
          <span className="text-xs font-medium text-dark-500 bg-dark-800/80 px-2 py-0.5 rounded-md">
            {files.length} / {maxFiles}
          </span>
        </span>
      </label>

      {files.length < maxFiles && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragActive 
              ? 'border-accent bg-accent/10 scale-[1.02]' 
              : 'border-dark-600/50 bg-dark-800/30 hover:border-accent/40 hover:bg-dark-800/60'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={(e) => handleFiles(Array.from(e.target.files))}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
            <div className={`p-3 rounded-full ${isDragActive ? 'bg-accent/20 text-accent-light' : 'bg-dark-700/50 text-dark-400'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Drag & drop or <span className="text-accent underline decoration-accent/30 decoration-dashed">click to browse</span>
              </p>
              <p className="text-xs text-dark-500">Supports {accept}</p>
            </div>
          </div>
        </div>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file, idx) => (
            <div key={idx} className="group relative rounded-lg border border-dark-600/50 bg-dark-800/50 overflow-hidden aspect-[4/3] flex flex-col">
              {type === 'image' ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview ${idx}`}
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                  <svg className="w-8 h-8 text-accent/70 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <span className="text-xs text-dark-300 font-medium truncate w-full px-2" title={file.name}>{file.name}</span>
                </div>
              )}
              {/* Overlay with details and delete */}
              <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-[10px] text-white font-mono bg-black/50 px-2 py-1 rounded mb-2 max-w-[90%] truncate">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-1.5 bg-danger/20 text-danger hover:bg-danger hover:text-white rounded-lg transition-colors border border-danger/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prompt: '',
    images: [],
    videoFiles: [],
    audioFiles: [],
    aspectRatio: '16:9',
    duration: 5,
  });

  const [cursorIndex, setCursorIndex] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePromptChange = (e) => {
    const value = e.target.value;
    updateField('prompt', value);
    const selStart = e.target.selectionStart;
    setCursorIndex(selStart);
    
    const words = value.slice(0, selStart).split(/\s+/);
    const lastWord = words[words.length - 1];
    setShowSuggestions(lastWord.startsWith('@'));
  };

  const handlePromptClickOrKey = (e) => {
    setCursorIndex(e.target.selectionStart);
  };

  // Compute available @ tags based on uploaded files
  const availableTags = [
    ...form.images.map((_, i) => `@image${i+1}`),
    ...form.videoFiles.map((_, i) => `@video${i+1}`),
    ...form.audioFiles.map((_, i) => `@audio${i+1}`)
  ];

  const wordsBeforeCursor = form.prompt.slice(0, cursorIndex || 0).split(/\s+/);
  const activeWord = wordsBeforeCursor[wordsBeforeCursor.length - 1] || '';
  const filteredTags = availableTags.filter(t => t.startsWith(activeWord));

  const insertTag = (tag) => {
    const value = form.prompt;
    const beforeCursor = value.slice(0, cursorIndex);
    const afterCursor = value.slice(cursorIndex);
    const words = beforeCursor.split(/\s+/);
    words.pop(); // remove partial typed tag
    const prefix = words.length > 0 ? words.join(' ') + ' ' : '';
    const newText = prefix + tag + ' ' + afterCursor;
    
    updateField('prompt', newText);
    setShowSuggestions(false);
    
    // Attempt cursor refocus
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = prefix.length + tag.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const generation = await generateVideo({
        prompt: form.prompt.trim(),
        images: form.images,
        videoFiles: form.videoFiles,
        audioFiles: form.audioFiles,
        aspectRatio: form.aspectRatio,
        duration: form.duration,
      });
      toast.success('Video generation started!');
      navigate(`/generation/${generation.id}`);
    } catch (err) {
      let msg = err.response?.data?.error || err.response?.data?.message || 'Failed to start generation';
      if (typeof msg === 'object') {
        msg = msg.message || msg.error || JSON.stringify(msg);
      }
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Generate Video</h1>
        <p className="text-dark-400">Create AI-powered videos from text prompts and media references</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Prompt and Settings */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-card p-6 border-l-4 border-l-accent">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Cinematic Prompt
                </span>
                <span className="text-xs text-dark-500 font-normal bg-dark-800 px-2 py-1 rounded">Required</span>
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={form.prompt}
                  onChange={handlePromptChange}
                  onClick={handlePromptClickOrKey}
                  onKeyUp={handlePromptClickOrKey}
                  rows={5}
                  placeholder="@image1 is the main character. The person walks along a city street at sunset, cinematic lighting..."
                  className="w-full bg-dark-900/50 border border-dark-600/60 rounded-xl px-4 py-3 text-white placeholder-dark-500/80 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all resize-none shadow-inner"
                />
                
                {showSuggestions && filteredTags.length > 0 && (
                  <div className="absolute z-10 left-0 mt-1 max-h-48 overflow-y-auto bg-dark-800 border border-dark-600/50 rounded-lg shadow-xl shadow-black/50 p-1 w-64 backdrop-blur-sm">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-accent/40 hover:text-white rounded-md transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start gap-2 bg-accent/5 border border-accent/10 rounded-lg p-3">
                <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-xs text-accent-light/80 leading-relaxed">
                  Use keywords like <strong className="text-accent-light">@image1</strong> to <strong className="text-accent-light">@image9</strong> to reference uploaded images in your story. 
                  Reference audio automatically anchors to the generated video.
                </p>
              </div>
            </div>

            {/* Video Settings */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 border-b border-dark-700/50 pb-3">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Video Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-3 uppercase tracking-wider">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateField('aspectRatio', r)}
                        className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                          form.aspectRatio === r
                            ? 'bg-accent text-white border-2 border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                            : 'bg-dark-800/80 border-2 border-transparent text-dark-300 hover:bg-dark-700 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-medium text-dark-300 uppercase tracking-wider">Duration</label>
                    <span className="text-sm font-bold text-accent-light bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                      {form.duration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={15}
                    value={form.duration}
                    onChange={(e) => updateField('duration', parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-dark-700 accent-accent cursor-pointer pt-1"
                  />
                  <div className="flex justify-between text-xs text-dark-500 font-mono mt-2 px-1">
                    <span>4s</span>
                    <span>15s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Submit (hidden on large screens) */}
            <div className="xl:hidden">
              <SubmitButton loading={loading} />
            </div>
          </div>

          {/* Right Column: Uploads */}
          <div className="space-y-6 flex flex-col">
            <div className="glass-card p-6 flex-1 flex flex-col gap-8">
              {/* Image Upload */}
              <FileUploadZone
                type="image"
                files={form.images}
                maxFiles={9}
                accept="image/jpeg, image/png, image/webp"
                onAddFiles={(newFiles) => setForm(p => ({ ...p, images: [...p.images, ...newFiles] }))}
                onRemoveFile={(idx) => setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                label="Image References"
                icon={
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                }
              />

              <hr className="border-dark-700/50" />

              {/* Video Upload */}
              <FileUploadZone
                type="video"
                files={form.videoFiles}
                maxFiles={3}
                accept=".mp4, .mov, .webm"
                onAddFiles={(newFiles) => setForm(p => ({ ...p, videoFiles: [...p.videoFiles, ...newFiles] }))}
                onRemoveFile={(idx) => setForm(p => ({ ...p, videoFiles: p.videoFiles.filter((_, i) => i !== idx) }))}
                label="Video References"
                icon={
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                }
              />

              <hr className="border-dark-700/50" />

              {/* Audio Upload */}
              <FileUploadZone
                type="audio"
                files={form.audioFiles}
                maxFiles={3}
                accept=".mp3, .wav, .m4a, .ogg"
                onAddFiles={(newFiles) => setForm(p => ({ ...p, audioFiles: [...p.audioFiles, ...newFiles] }))}
                onRemoveFile={(idx) => setForm(p => ({ ...p, audioFiles: p.audioFiles.filter((_, i) => i !== idx) }))}
                label="Audio References"
                icon={
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                }
              />
            </div>

            {/* Desktop Submit */}
            <div className="hidden xl:block mt-auto">
              <SubmitButton loading={loading} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SubmitButton({ loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent to-purple-500 p-px font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
    >
      <div className="relative flex h-full w-full items-center justify-center gap-3 rounded-xl bg-dark-900/20 py-4 backdrop-blur-sm transition-colors group-hover:bg-transparent">
        {loading ? (
          <>
            <div className="spinner" />
            <span className="tracking-wide">Generating Sequence...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-lg tracking-wide">Generate Video</span>
          </>
        )}
      </div>
    </button>
  );
}
