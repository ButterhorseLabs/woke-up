export default function Hero({ onStart }) {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold leading-tight text-white">
        Your morning show could wake up America.
      </h1>

      <p className="text-lg text-gray-400 leading-relaxed">
        Android phones play short news and podcast clips when people dismiss their morning alarm.
        The channel is dominated by CNN, Fox, and NPR — because most independent creators don't
        know it exists. This tool changes that.
      </p>

      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Google runs a system called{' '}
          <strong className="text-white">Google Assistant News Briefings</strong> that automatically
          queues up short audio clips for Android users. When your alarm goes off, Google plays a
          personalized feed of news and podcast clips based on the sources you follow.
        </p>
        <p>
          Getting your show into this system requires submitting a short form to Google — but first
          your RSS feed has to meet specific technical requirements that most hosting platforms
          handle automatically. The tricky part is knowing what those requirements are.
        </p>
        <p>
          This tool walks you through eligibility, validates your feed against Google's checklist,
          and hands you off to Google's submission form with everything pre-summarized so you can
          submit in under five minutes.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          What this tool does
        </p>
        <ul className="space-y-2">
          {[
            "Checks if your show qualifies for Google's News Briefing channel",
            'Validates your RSS feed against Google\'s technical requirements',
            'Prepares everything you need for the 5-minute submission form',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <span className="text-[#e53e3e] mt-0.5 shrink-0">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="w-full sm:w-auto px-8 py-4 bg-[#e53e3e] hover:bg-[#c53030] text-white font-bold text-lg rounded-lg transition-colors cursor-pointer"
      >
        Check my show →
      </button>
    </div>
  )
}
