import { useState } from 'react'

const NEWS_CATEGORIES = [
  'Politics', 'World', 'National', 'General', 'Business',
  'Technology', 'Entertainment', 'Sports', 'Science', 'Health',
]

const LANGUAGE_OPTIONS = [
  { value: 'English / United States', label: 'English / United States' },
  { value: 'English / Australia', label: 'English / Australia' },
  { value: 'English / Canada', label: 'English / Canada' },
  { value: 'English / United Kingdom', label: 'English / United Kingdom' },
  { value: 'English / India', label: 'English / India' },
  { value: 'English / Ireland', label: 'English / Ireland' },
  { value: 'English / Philippines', label: 'English / Philippines' },
  { value: 'English / Singapore', label: 'English / Singapore' },
]

export default function SubmissionGuide({ meta }) {
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('English / United States')
  const [synonyms, setSynonyms] = useState('')
  const [copied, setCopied] = useState({})

  const copyField = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [id]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000)
    } catch {}
  }

  const copyAll = async () => {
    const lines = [
      `Show name: ${meta.feedTitle}`,
      `RSS feed URL: ${meta.feedUrl}`,
      `Show description: ${meta.feedDescription}`,
      `Image URL: ${meta.feedImageUrl}`,
      `News category: ${category || '(select a category)'}`,
      `Language / Country: ${language}`,
      synonyms ? `Synonyms: ${synonyms}` : null,
    ].filter(Boolean).join('\n\n')
    try {
      await navigator.clipboard.writeText(lines)
      setCopied(prev => ({ ...prev, all: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, all: false })), 2000)
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="grad-text">You're ready.</span>{' '}
          <span className="text-white">Here's what to bring to Google's form.</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Google's form can't be pre-filled, so we've prepared everything for you to copy-paste.
        </p>
      </div>

      {/* Cheat sheet */}
      <div className="grad-border rounded-xl p-6 space-y-5 bg-[#0f0f1a]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Your submission cheat sheet
        </p>

        <CopyField label="Show name" value={meta.feedTitle}
          copied={copied['name']} onCopy={() => copyField('name', meta.feedTitle)} />
        <CopyField label="RSS feed URL" value={meta.feedUrl} mono
          copied={copied['url']} onCopy={() => copyField('url', meta.feedUrl)} />
        <CopyField label="Show description" value={meta.feedDescription} multiline
          copied={copied['desc']} onCopy={() => copyField('desc', meta.feedDescription)} />
        {meta.feedImageUrl && (
          <CopyField label="Image URL" value={meta.feedImageUrl} mono
            copied={copied['img']} onCopy={() => copyField('img', meta.feedImageUrl)} />
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              News category
            </label>
            {category && <CopyButton copied={copied['cat']} onCopy={() => copyField('cat', category)} />}
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-purple-600 text-sm cursor-pointer">
            <option value="">Select a category…</option>
            {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Language / Country
            </label>
            <CopyButton copied={copied['lang']} onCopy={() => copyField('lang', language)} />
          </div>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-purple-600 text-sm cursor-pointer">
            {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Synonyms{' '}
              <span className="text-gray-600 normal-case font-normal">(optional — up to 5)</span>
            </label>
            {synonyms && <CopyButton copied={copied['syn']} onCopy={() => copyField('syn', synonyms)} />}
          </div>
          <input type="text" value={synonyms} onChange={e => setSynonyms(e.target.value)}
            placeholder="e.g. The Morning Brief, AM Dispatch"
            className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm" />
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="https://support.google.com/faqs/contact/news_briefings_default"
          target="_blank" rel="noopener noreferrer"
          className="btn-grad flex-1 text-center px-6 py-4 text-white font-bold text-base rounded-lg">
          Open Google's submission form →
        </a>
        <button onClick={copyAll}
          className="flex-1 px-6 py-4 bg-[#1a1a2e] hover:bg-[#222240] text-gray-300 font-semibold rounded-lg border border-gray-700 transition-colors cursor-pointer text-base">
          {copied.all ? '✓ Copied!' : 'Copy everything to clipboard'}
        </button>
      </div>

      {/* LUFS callout */}
      <div className="grad-border rounded-lg p-5 space-y-2 bg-[#0f0f1a]">
        <p className="font-semibold text-gray-200 flex items-center gap-2">
          <span>⚠️</span> One thing we can't check automatically
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Google requires your audio to be between -16 and -19 LUFS. Most professionally produced
          podcasts already meet this. Verify yours for free at{' '}
          <a href="https://youlean.co/file-loudness-meter/" target="_blank" rel="noopener noreferrer"
            className="grad-text hover:opacity-80">
            youlean.co/file-loudness-meter
          </a>
          {' '}— just upload a recent episode.
        </p>
      </div>

      {/* What happens next */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">What happens next</h3>
        <ol className="space-y-3">
          {[
            'Google reviews your submission in 5–7 business days.',
            'They may email you at the address you provide with questions or updates.',
            "Once approved, tell your audience: \"Say 'Hey Google, play [your show name]' to add us to your morning alarm.\"",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
              <span className="grad-text font-bold shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-gray-600">
          Questions? Contact Google's audio news team at{' '}
          <a href="mailto:audio-news-support@google.com" className="text-gray-500 hover:text-gray-300 underline">
            audio-news-support@google.com
          </a>
        </p>
      </div>
    </div>
  )
}

function CopyField({ label, value, mono, multiline, copied, onCopy }) {
  if (!value) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
        <CopyButton copied={copied} onCopy={onCopy} />
      </div>
      <div className={`px-3 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg text-sm text-gray-300 ${mono ? 'font-mono break-all' : ''} ${multiline ? 'line-clamp-4 whitespace-pre-wrap' : 'truncate'}`}>
        {value}
      </div>
    </div>
  )
}

function CopyButton({ copied, onCopy }) {
  return (
    <button onClick={onCopy}
      className="text-xs text-gray-600 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
