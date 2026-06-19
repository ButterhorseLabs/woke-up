import { useState } from 'react'
import { fetchFeed, validateFeed } from '../lib/rssChecks.js'

export default function RSSValidator({ onComplete }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = async () => {
    const trimmed = url.trim()
    if (!trimmed) return

    if (!trimmed.startsWith('http')) {
      setError('Please enter a full URL starting with http:// or https://')
      return
    }

    setLoading(true)
    setError('')

    try {
      const xml = await fetchFeed(trimmed)
      const result = validateFeed(xml, trimmed)
      onComplete(result.checks, result.meta, trimmed)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') validate()
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm leading-relaxed">
        Paste your podcast RSS feed URL below. Usually something like{' '}
        <code className="font-mono text-gray-300 bg-[#1a1a2e] px-1.5 py-0.5 rounded text-xs">
          https://feeds.buzzsprout.com/…
        </code>
        {' '}— find it in your podcast host's settings or distribution page.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://your-feed-url.com/rss"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors font-mono text-sm disabled:opacity-50"
        />
        <button
          onClick={validate}
          disabled={loading || !url.trim()}
          className="btn-grad px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Validating…
            </span>
          ) : (
            'Validate'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-800 rounded-lg">
          <span className="text-red-400 shrink-0 mt-0.5">✕</span>
          <p className="text-red-300 text-sm leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )
}
