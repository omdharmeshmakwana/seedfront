import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getHistory, deleteGeneration } from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || 'pending';
  return <span className={`badge badge-${s}`}>{status}</span>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HistoryPage() {
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getHistory({ page, limit: 12, status: status || undefined, search: search || undefined });
      setData(result);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this generation?')) return;
    try {
      await deleteGeneration(id);
      toast.success('Deleted');
      fetchHistory();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const { pagination } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">History</h1>
          <p className="text-dark-400">{pagination.total} total generation{pagination.total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search prompts..."
            className="flex-1 bg-dark-800/60 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
          <button type="submit" className="px-4 py-2 bg-accent/20 text-accent-light rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors">
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-dark-800/60 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : data.data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-2.625 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25c0 .621.504 1.125 1.125 1.125M18 12h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125M18 12c.621 0 1.125-.504 1.125-1.125m1.5 1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M19.125 12H20.25" />
          </svg>
          <p className="text-dark-400 text-lg">No generations yet</p>
          <Link to="/" className="mt-4 inline-block text-accent hover:text-accent-light font-medium">
            Create your first video →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((gen) => (
            <Link
              key={gen.id}
              to={`/generation/${gen.id}`}
              className="glass-card p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-glow/10 group animate-slide-up"
            >
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={gen.status} />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-dark-500">{timeAgo(gen.createdAt)}</span>
                  <button
                    onClick={(e) => handleDelete(gen.id, e)}
                    className="p-1 ml-1 text-dark-500 hover:text-danger rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-200 line-clamp-2 mb-3 group-hover:text-white transition-colors">
                {gen.prompt}
              </p>
              <div className="flex items-center gap-3 text-xs text-dark-500">
                <span>{gen.aspectRatio}</span>
                <span>•</span>
                <span>{gen.duration}s</span>
                {gen.imagesList && JSON.parse(JSON.stringify(gen.imagesList)).length > 0 && (
                  <>
                    <span>•</span>
                    <span>{Array.isArray(gen.imagesList) ? gen.imagesList.length : 0} img</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-800/60 text-dark-300 border border-dark-600/50 hover:bg-dark-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400 px-4">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-800/60 text-dark-300 border border-dark-600/50 hover:bg-dark-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
