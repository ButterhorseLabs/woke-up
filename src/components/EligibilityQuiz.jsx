import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'category',
    text: 'Does your show cover news, politics, current events, or commentary on them?',
    note: "Maps to Google's category requirement: Politics, World, National, General, Business, etc.",
    failMessage:
      "Google's News Briefing system is limited to news and current events content. Shows focused on true crime, fiction, history, personal growth, or entertainment don't currently qualify — though Google occasionally expands the category list.",
  },
  {
    id: 'frequency',
    text: 'Do you publish new episodes at least a few times a week?',
    note: 'Google requires "timely and regular" updates — hourly or daily preferred. A few times a week is the practical minimum.',
    failMessage:
      "Google requires shows to publish frequently — daily or near-daily is ideal, a few times a week is the minimum. A show that publishes weekly or less won't surface regularly in morning briefings.",
  },
  {
    id: 'language',
    text: 'Is your show primarily in English?',
    note: 'This tool covers English-language shows. Google also supports other languages — see their docs if needed.',
    failMessage:
      "This tool is set up for English-language shows. Google does support other languages (Spanish, French, German, and more) — check Google's News Briefing documentation directly for requirements in your language.",
  },
  {
    id: 'rss',
    text: 'Do you have a public RSS feed? (Spotify for Podcasters, Apple Podcasts, Buzzsprout, Anchor, Transistor, etc. all generate one automatically)',
    note: 'Google pulls your audio directly from your RSS feed.',
    failMessage:
      "You'll need a public RSS feed to participate. Nearly every podcast hosting platform generates one for you — Spotify for Podcasters, Apple Podcasts Connect, Buzzsprout, Anchor, Transistor, Simplecast, and Podbean all do this automatically. Check your hosting platform's settings.",
  },
]

export default function EligibilityQuiz({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)

  const answer = (id, value) => {
    if (answers[id] === value) return
    const newAnswers = { ...answers, [id]: value }
    setAnswers(newAnswers)

    if (value === 'yes' && QUESTIONS.every(q => newAnswers[q.id] === 'yes')) {
      setCompleted(true)
      setTimeout(onComplete, 500)
    }
  }

  const reset = () => {
    setAnswers({})
    setCompleted(false)
  }

  const firstFail = QUESTIONS.find(q => answers[q.id] === 'no')

  if (completed) {
    return (
      <div className="flex items-center gap-4 py-4">
        <span className="text-3xl grad-text">✓</span>
        <div>
          <p className="font-semibold text-emerald-300">Your show looks eligible!</p>
          <p className="text-sm text-gray-500 mt-0.5">Moving on to RSS validation…</p>
        </div>
      </div>
    )
  }

  if (firstFail) {
    return (
      <div className="space-y-4">
        <div className="bg-[#1a1020] border border-yellow-900 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl shrink-0 mt-0.5">⚠</span>
            <div className="space-y-2">
              <p className="font-semibold text-gray-200">This tool might not be able to help right now</p>
              <p className="text-gray-400 text-sm leading-relaxed">{firstFail.failMessage}</p>
              <a
                href="https://support.google.com/assistant/answer/9343892"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block grad-text text-sm mt-1 hover:opacity-80"
              >
                Read Google's eligibility requirements →
              </a>
            </div>
          </div>
        </div>
        <button onClick={reset} className="text-sm text-gray-600 hover:text-gray-300 underline cursor-pointer">
          Start over
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {QUESTIONS.map((q, idx) => {
        const prevAllYes = QUESTIONS.slice(0, idx).every(prev => answers[prev.id] === 'yes')
        const isVisible = idx === 0 || prevAllYes
        if (!isVisible) return null

        const answered = answers[q.id]

        return (
          <div key={q.id} className="space-y-3">
            <p className="text-gray-200 font-medium">{q.text}</p>
            <p className="text-sm text-gray-500">{q.note}</p>
            <div className="flex gap-3">
              <button
                onClick={() => answer(q.id, 'yes')}
                className={`px-6 py-2 rounded-lg font-medium transition-all cursor-pointer border ${
                  answered === 'yes'
                    ? 'grad text-white border-transparent'
                    : 'bg-[#1a1a2e] border-gray-700 text-gray-300 hover:border-purple-800'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => answer(q.id, 'no')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer border ${
                  answered === 'no'
                    ? 'bg-red-950 border-red-700 text-red-300'
                    : 'bg-[#1a1a2e] border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
