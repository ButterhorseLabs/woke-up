import { useState } from 'react'

const NEWS_CATEGORIES = [
  'Business', 'Entertainment', 'General', 'Health', 'National',
  'Politics', 'Science', 'Sports', 'Technology', 'World',
]

const FEED_FREQUENCIES = [
  'Hourly',
  'Multiple times per day',
  'Daily',
  'Multiple times per week',
  'Weekly',
]

const FEED_LENGTHS = [
  'Less than 5 minutes',
  '5 to less than 10 minutes',
  '10 to less than 20 minutes',
  '20 to less than 30 minutes',
  '30 minutes or longer',
]

const LANGUAGE_COUNTRY_OPTIONS = [
  'Arabic / Egypt', 'Arabic / Saudi Arabia', 'Arabic / United Arab Emirates',
  'Dutch / Belgium', 'Dutch / Netherlands',
  'English / Australia', 'English / Canada', 'English / Ghana', 'English / India',
  'English / Ireland', 'English / Kenya', 'English / Nigeria', 'English / Philippines',
  'English / Singapore', 'English / South Africa', 'English / Tanzania',
  'English / Uganda', 'English / United Kingdom', 'English / United States',
  'French / Belgium', 'French / Canada', 'French / France', 'French / Switzerland',
  'German / Austria', 'German / Germany', 'German / Switzerland',
  'Hindi / India',
  'Italian / Italy',
  'Japanese / Japan',
  'Korean / South Korea',
  'Norwegian / Norway',
  'Portuguese / Brazil', 'Portuguese / Portugal',
  'Russian / Russia',
  'Spanish / Argentina', 'Spanish / Colombia', 'Spanish / Mexico', 'Spanish / Spain',
  'Spanish / United States',
  'Swedish / Sweden',
  'Telugu / India',
]

function guessFeedLength(seconds) {
  if (!seconds) return ''
  if (seconds < 300) return 'Less than 5 minutes'
  if (seconds < 600) return '5 to less than 10 minutes'
  if (seconds < 1200) return '10 to less than 20 minutes'
  if (seconds < 1800) return '20 to less than 30 minutes'
  return '30 minutes or longer'
}

function guessLanguageCountry(feedLanguage) {
  const lang = (feedLanguage || '').toLowerCase().replace('_', '-')
  const map = {
    'en': 'English / United States',
    'en-us': 'English / United States',
    'en-gb': 'English / United Kingdom',
    'en-au': 'English / Australia',
    'en-ca': 'English / Canada',
    'en-in': 'English / India',
    'es': 'Spanish / Spain',
    'es-us': 'Spanish / United States',
    'fr': 'French / France',
    'de': 'German / Germany',
    'pt': 'Portuguese / Portugal',
    'pt-br': 'Portuguese / Brazil',
    'ja': 'Japanese / Japan',
    'ko': 'Korean / South Korea',
    'hi': 'Hindi / India',
    'ar': 'Arabic / Egypt',
  }
  return map[lang] || map[lang.split('-')[0]] || 'English / United States'
}

export default function SubmissionGuide({ meta }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [publisherName, setPublisherName] = useState(meta.feedTitle || '')
  const [newsSiteUrl, setNewsSiteUrl] = useState(meta.feedLink || '')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState('')
  const [feedLength, setFeedLength] = useState(guessFeedLength(meta.latestDurationSeconds))
  const [language, setLanguage] = useState(guessLanguageCountry(meta.feedLanguage))
  const [synonyms, setSynonyms] = useState('')
  const [copied, setCopied] = useState({})

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [id]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000)
    } catch {}
  }

  const copyAll = async () => {
    const lines = [
      `First name: ${firstName}`,
      `Last name: ${lastName}`,
      `Email: ${email}`,
      `Publisher name: ${publisherName}`,
      `News site URL: ${newsSiteUrl}`,
      `Feed name: ${meta.feedTitle}`,
      `Audio feed URL: ${meta.feedUrl}`,
      `News category: ${category || '(select)'}`,
      `Feed refresh frequency: ${frequency || '(select)'}`,
      `Feed length: ${feedLength || '(select)'}`,
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
          Google's form can't be pre-filled — fill in the fields below and copy-paste each one.
          We've pre-filled everything we can from your feed.
        </p>
      </div>

      {/* About you */}
      <Section title="About you">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *" id="fn" value={firstName} onChange={setFirstName}
            copied={copied['fn']} onCopy={() => copy('fn', firstName)} />
          <Field label="Last name *" id="ln" value={lastName} onChange={setLastName}
            copied={copied['ln']} onCopy={() => copy('ln', lastName)} />
        </div>
        <Field label="Email address *" id="email" value={email} onChange={setEmail}
          type="email" copied={copied['email']} onCopy={() => copy('email', email)} />
        <Field label="Publisher name *" id="pub" value={publisherName} onChange={setPublisherName}
          copied={copied['pub']} onCopy={() => copy('pub', publisherName)} />
        <Field label="News site URL *" id="site" value={newsSiteUrl} onChange={setNewsSiteUrl}
          mono copied={copied['site']} onCopy={() => copy('site', newsSiteUrl)} />
      </Section>

      {/* Your feed */}
      <Section title="Your feed">
        <ReadOnly label="Feed name *" value={meta.feedTitle}
          copied={copied['name']} onCopy={() => copy('name', meta.feedTitle)} />
        <ReadOnly label="Audio feed URL *" value={meta.feedUrl} mono
          copied={copied['url']} onCopy={() => copy('url', meta.feedUrl)} />

        <SelectField label="News category *" id="cat" value={category} onChange={setCategory}
          options={NEWS_CATEGORIES} placeholder="Select a category…"
          copied={copied['cat']} onCopy={() => copy('cat', category)} />

        <SelectField label="Feed refresh frequency *" id="freq" value={frequency} onChange={setFrequency}
          options={FEED_FREQUENCIES} placeholder="How often do you publish?"
          copied={copied['freq']} onCopy={() => copy('freq', frequency)} />

        <SelectField label="Feed length *" id="len" value={feedLength} onChange={setFeedLength}
          options={FEED_LENGTHS} placeholder="Select average episode length…"
          copied={copied['len']} onCopy={() => copy('len', feedLength)}
          hint={meta.latestDurationSeconds ? `Auto-detected from your latest episode` : null} />

        <SelectField label="Language / Country *" id="lang" value={language} onChange={setLanguage}
          options={LANGUAGE_COUNTRY_OPTIONS} placeholder="Select…"
          copied={copied['lang']} onCopy={() => copy('lang', language)} />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Synonyms <span className="text-gray-600 normal-case font-normal">(optional — up to 5 alternate names for your show)</span>
            </label>
            {synonyms && <CopyButton copied={copied['syn']} onCopy={() => copy('syn', synonyms)} />}
          </div>
          <input type="text" value={synonyms} onChange={e => setSynonyms(e.target.value)}
            placeholder="e.g. The Morning Brief, AM Dispatch"
            className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm" />
        </div>
      </Section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="https://support.google.com/faqs/contact/news_briefings_default"
          target="_blank" rel="noopener noreferrer"
          className="btn-grad flex-1 text-center px-6 py-4 text-white font-bold text-base rounded-lg">
          Open Google's form →
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
          Questions?{' '}
          <a href="mailto:audio-news-support@google.com" className="text-gray-500 hover:text-gray-300 underline">
            audio-news-support@google.com
          </a>
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">
        {title}
      </p>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, id, value, onChange, type = 'text', mono, copied, onCopy }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
        {value && <CopyButton copied={copied} onCopy={onCopy} />}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm ${mono ? 'font-mono' : ''}`}
      />
    </div>
  )
}

function ReadOnly({ label, value, mono, copied, onCopy }) {
  if (!value) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
        <CopyButton copied={copied} onCopy={onCopy} />
      </div>
      <div className={`px-3 py-2.5 bg-[#0f0f1a] border border-gray-800 rounded-lg text-sm text-gray-300 truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function SelectField({ label, id, value, onChange, options, placeholder, copied, onCopy, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
          {hint && <span className="text-xs text-purple-500 ml-2">✓ {hint}</span>}
        </div>
        {value && <CopyButton copied={copied} onCopy={onCopy} />}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-purple-600 text-sm cursor-pointer">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CopyButton({ copied, onCopy }) {
  return (
    <button onClick={onCopy}
      className="text-xs text-gray-600 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800 cursor-pointer shrink-0">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
