import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getGeneration, getStatus, retryGeneration, deleteGeneration } from '../services/api';

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || 'pending';
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function GenerationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gen, setGen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef(null);

  // Fetch generation
  useEffect(() => {
    let mounted = true;

    async function fetchGen() {
      try {
        const data = await getGeneration(id);
        if (mounted) {
          setGen(data);
          setLoading(false);
        }
      } catch {
        toast.error('Generation not found');
        navigate('/history');
      }
    }

    fetchGen();
    return () => { mounted = false; };
  }, [id, navigate]);

  // Polling
  useEffect(() => {
    if (!gen || !gen.requestId) return;
    if (gen.status === 'COMPLETED' || gen.status === 'FAILED') return;

    pollRef.current = setInterval(async () => {
      try {
        const updated = await getStatus(gen.requestId);
        setGen(updated);

        if (updated.status === 'COMPLETED') {
          toast.success('Video generation completed!');
          clearInterval(pollRef.current);
        } else if (updated.status === 'FAILED') {
          toast.error('Video generation failed');
          clearInterval(pollRef.current);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [gen?.requestId, gen?.status]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const updated = await retryGeneration(id);
      setGen(updated);
      toast.success('Retrying generation...');
    } catch {
      toast.error('Failed to retry');
    } finally {
      setRetrying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this generation?')) return;
    try {
      await deleteGeneration(id);
      toast.success('Deleted');
      navigate('/history');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }} />
          <p className="text-dark-400">Loading generation...</p>
        </div>
      </div>
    );
  }

  if (!gen) return null;

  const isActive = gen.status === 'PENDING' || gen.status === 'PROCESSING';
  const imagesList = Array.isArray(gen.imagesList) ? gen.imagesList : [];
  const audioFiles = Array.isArray(gen.audioFiles) ? gen.audioFiles : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/history" className="p-2 rounded-lg bg-dark-800/60 hover:bg-dark-700/60 text-dark-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Generation Details</h1>
            <p className="text-xs text-dark-500 font-mono mt-1">{gen.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={gen.status} />
          {gen.status === 'FAILED' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-warning/15 text-warning border border-warning/30 hover:bg-warning/25 transition-all disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — Video / Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player or loading */}
          <div className="glass-card overflow-hidden">
            {gen.status === 'COMPLETED' && gen.videoPath ? (
              <div>
                <video
                  key={gen.videoPath}
                  controls
                  className="w-full rounded-t-2xl bg-black"
                  preload="metadata"
                >
                  <source src={`/videos/${gen.videoPath}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="p-4 flex items-center justify-between">
                  <p className="text-sm text-dark-300">Video ready</p>
                  <a
                    href={`/videos/${gen.videoPath}`}
                    download
                    className="btn-glow py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            ) : gen.status === 'FAILED' ? (
              <div className="p-10 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-danger/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-danger font-semibold mb-2">Generation Failed</p>
                {gen.error && (
                  <p className="text-sm text-dark-400 max-w-md mx-auto bg-danger/10 rounded-lg p-3 mt-3">
                    {gen.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-dark-700" />
                  <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">
                  {gen.status === 'PENDING' ? 'Queued' : 'Processing'}
                </p>
                <p className="text-sm text-dark-400">
                  {gen.status === 'PENDING'
                    ? 'Your video is in the queue...'
                    : 'AI is generating your video...'}
                </p>
                <p className="text-xs text-dark-500 mt-3">Polling every 5 seconds</p>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-dark-400 mb-2 uppercase tracking-wider">Prompt</h3>
            <p className="text-white leading-relaxed">{gen.prompt}</p>
          </div>
        </div>

        {/* Sidebar — Metadata */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider">Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Aspect Ratio</span>
                <span className="text-sm text-white font-medium bg-dark-700/50 px-3 py-1 rounded-lg">{gen.aspectRatio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Duration</span>
                <span className="text-sm text-white font-medium bg-dark-700/50 px-3 py-1 rounded-lg">{gen.duration}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Request ID</span>
                <span className="text-xs text-dark-300 font-mono truncate max-w-[140px]" title={gen.requestId}>
                  {gen.requestId || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Created</span>
                <span className="text-sm text-dark-300">{new Date(gen.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Image references */}
          {imagesList.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wider">
                Image References ({imagesList.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {imagesList.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={url}
                      alt={`Ref ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-dark-600/50 hover:border-accent/50 transition-colors"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Audio references */}
          {audioFiles.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wider">
                Audio References ({audioFiles.length})
              </h3>
              <div className="space-y-2">
                {audioFiles.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-accent truncate hover:text-accent-light transition-colors"
                  >
                    🎵 Audio {idx + 1}: {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
