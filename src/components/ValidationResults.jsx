import { useState } from 'react'

const FIX_GUIDANCE = {
  'rss-version':
    'Your feed host should handle this. Contact their support or check their RSS settings.',
  'itunes-namespace':
    'Add xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" to the opening <rss> tag in your feed. Most modern podcast hosts do this automatically — if yours doesn\'t, switch hosts or manually edit your feed template.',
  'channel-title':
    'Add a <title> tag inside your <channel> block.',
  'channel-link':
    "Add a <link> tag with your show's homepage URL inside <channel>.",
  'channel-description':
    'Add a <description> tag inside <channel>. This is usually your show description.',
  'channel-image':
    'Add an <image> block with <url>, <title>, and <link> sub-tags. Most podcast hosts generate this from your show artwork.',
  'item-exists':
    'Publish at least one episode before submitting.',
  'item-title':
    'Your latest episode is missing a title. Edit it in your podcast host dashboard.',
  'item-description':
    'Your latest episode is missing a description. Add one in your podcast host dashboard.',
  'item-enclosure':
    "The <enclosure> tag points Google to your actual audio file. Your podcast host generates this automatically for every episode — if it's missing, something is wrong with your feed. Contact your host's support.",
  'item-enclosure-type':
    "Update your enclosure's type attribute to a supported MIME type. audio/mpeg (MP3) is the safest choice.",
  'item-enclosure-url':
    'The enclosure URL must start with http:// or https://. Contact your podcast host if the audio URL looks wrong.',
  'item-guid':
    'Each episode needs a unique GUID. Your podcast host should generate this automatically.',
  'item-pubdate':
    'Add a <pubDate> in RFC 822 format, e.g. Thu, 22 Sep 2016 21:11:46 GMT. Your podcast host should handle this.',
  'item-duration':
    'Add <itunes:duration> to your episode\'s <item> block. Format: HH:MM:SS or total seconds. Example: <itunes:duration>600</itunes:duration>. Your podcast host usually adds this automatically.',
}

export default function ValidationResults({ checks, meta, onReadyToSubmit }) {
  const [expandedFix, setExpandedFix] = useState(null)
  const [showPassed, setShowPassed] = useState(false)

  const failures = checks.filter(c => c.status === 'fail')
  const warnings = checks.filter(c => c.status === 'warn')
  const passes = checks.filter(c => c.status === 'pass')
  const canSubmit = failures.length === 0

  return (
    <div className="space-y-5">

      {/* Status banner */}
      {canSubmit ? (
        <div className="p-4 bg-green-950/30 border border-green-800/60 rounded-lg">
          <p className="text-green-300 font-semibold">
            {warnings.length > 0
              ? '✓ Feed meets requirements — a few things to review'
              : '✓ Feed passes all checks!'}
          </p>
          {warnings.length > 0 && (
            <p className="text-green-500/60 text-sm mt-1">
              Warnings won't block submission but are worth addressing.
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="text-red-300 font-semibold">
              {failures.length} issue{failures.length !== 1 ? 's' : ''} to fix before submitting
            </p>
            <p className="text-red-400/60 text-sm mt-0.5">
              Expand each one for instructions.
            </p>
          </div>
          <span className="text-2xl font-bold text-red-400 shrink-0">{failures.length}</span>
        </div>
      )}

      {/* Failures */}
      {failures.length > 0 && (
        <CheckGroup checks={failures} expandedFix={expandedFix} setExpandedFix={setExpandedFix} />
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.length > 0 && failures.length > 0 && (
            <p className="text-xs text-gray-600 uppercase tracking-wider pt-1">
              Warnings
            </p>
          )}
          <CheckGroup checks={warnings} expandedFix={expandedFix} setExpandedFix={setExpandedFix} />
        </div>
      )}

      {/* Passed — collapsed by default */}
      {passes.length > 0 && (
        <button
          onClick={() => setShowPassed(p => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-800 hover:border-purple-900 text-sm text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {passes.length} check{passes.length !== 1 ? 's' : ''} passed
          </span>
          <span className="text-gray-700">{showPassed ? '▲' : '▼'}</span>
        </button>
      )}

      {showPassed && (
        <div className="space-y-1.5">
          <CheckGroup checks={passes} expandedFix={expandedFix} setExpandedFix={setExpandedFix} />
        </div>
      )}

      {/* CTA */}
      {canSubmit && (
        <div className="pt-1">
          <button
            onClick={onReadyToSubmit}
            className="btn-grad w-full sm:w-auto px-8 py-4 text-white font-bold text-lg rounded-lg cursor-pointer"
          >
            Prepare my submission →
          </button>
        </div>
      )}
    </div>
  )
}

function CheckGroup({ checks, expandedFix, setExpandedFix }) {
  return (
    <div className="space-y-1.5">
      {checks.map(check => {
        const hasFix = check.status === 'fail' && FIX_GUIDANCE[check.id]
        const isOpen = expandedFix === check.id

        const borderClass =
          check.status === 'fail' ? 'border-red-900 bg-red-950/20' :
          check.status === 'warn' ? 'border-yellow-900/50 bg-yellow-950/10' :
          'border-gray-800'

        const icon =
          check.status === 'fail' ? '❌' :
          check.status === 'warn' ? '⚠️' : '✅'

        return (
          <div key={check.id} className={`border rounded-lg overflow-hidden ${borderClass}`}>
            <div
              className={`flex items-start gap-3 p-3 ${hasFix ? 'cursor-pointer hover:bg-white/5' : ''}`}
              onClick={hasFix ? () => setExpandedFix(isOpen ? null : check.id) : undefined}
            >
              <span className="text-base shrink-0 mt-0.5 select-none">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">{check.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-mono leading-snug break-all">
                  {check.detail}
                </p>
              </div>
              {hasFix && (
                <span className="text-gray-700 text-xs self-center shrink-0 ml-2">
                  {isOpen ? 'hide ↑' : 'fix ↓'}
                </span>
              )}
            </div>

            {hasFix && isOpen && (
              <div className="px-4 pb-4 pt-2 ml-8 border-t border-red-900/40">
                <p className="text-sm text-gray-300 leading-relaxed">{FIX_GUIDANCE[check.id]}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
