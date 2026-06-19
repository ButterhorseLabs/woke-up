import { useState } from 'react'
import Hero from './components/Hero.jsx'
import EligibilityQuiz from './components/EligibilityQuiz.jsx'
import RSSValidator from './components/RSSValidator.jsx'
import ValidationResults from './components/ValidationResults.jsx'
import SubmissionGuide from './components/SubmissionGuide.jsx'

export default function App() {
  const [maxStep, setMaxStep] = useState(1)
  const [expandedStep, setExpandedStep] = useState(1)
  const [feedUrl, setFeedUrl] = useState('')
  const [validationResult, setValidationResult] = useState(null)

  const revealStep = (step) => {
    setMaxStep(prev => Math.max(prev, step))
    setExpandedStep(step)
    setTimeout(() => {
      document.getElementById(`step-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const toggleStep = (step) => {
    setExpandedStep(prev => (prev === step ? null : step))
  }

  const failCount = validationResult
    ? validationResult.checks.filter(c => c.status === 'fail').length
    : 0
  const passCount = validationResult
    ? validationResult.checks.filter(c => c.status === 'pass').length
    : 0

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-24">

        <StepWrapper
          step={1}
          title="What is this?"
          summary="Get your show into Android morning alarms"
          isExpanded={expandedStep === 1}
          isComplete={maxStep > 1}
          onToggle={() => toggleStep(1)}
        >
          <Hero onStart={() => revealStep(2)} />
        </StepWrapper>

        {maxStep >= 2 && (
          <StepWrapper
            step={2}
            title="Check eligibility"
            summary="Eligibility: ✓ Passed"
            isExpanded={expandedStep === 2}
            isComplete={maxStep > 2}
            onToggle={() => toggleStep(2)}
          >
            <EligibilityQuiz onComplete={() => revealStep(3)} />
          </StepWrapper>
        )}

        {maxStep >= 3 && (
          <StepWrapper
            step={3}
            title="Validate your RSS feed"
            summary={feedUrl ? `Feed: ${feedUrl}` : 'RSS validation'}
            isExpanded={expandedStep === 3}
            isComplete={maxStep > 3}
            onToggle={() => toggleStep(3)}
          >
            <RSSValidator
              onComplete={(checks, meta, url) => {
                setFeedUrl(url)
                setValidationResult({ checks, meta })
                revealStep(4)
              }}
            />
          </StepWrapper>
        )}

        {maxStep >= 4 && validationResult && (
          <StepWrapper
            step={4}
            title="Validation results"
            summary={`${passCount} passed · ${failCount} failed`}
            isExpanded={expandedStep === 4}
            isComplete={maxStep > 4}
            onToggle={() => toggleStep(4)}
          >
            <ValidationResults
              checks={validationResult.checks}
              meta={validationResult.meta}
              onReadyToSubmit={() => revealStep(5)}
            />
          </StepWrapper>
        )}

        {maxStep >= 5 && validationResult && (
          <StepWrapper
            step={5}
            title="Submit to Google"
            summary="Submission guide"
            isExpanded={expandedStep === 5}
            isComplete={false}
            onToggle={() => toggleStep(5)}
          >
            <SubmissionGuide meta={validationResult.meta} />
          </StepWrapper>
        )}
      </div>
    </div>
  )
}

function StepWrapper({ step, title, summary, isExpanded, isComplete, onToggle, children }) {
  const stepNum = String(step).padStart(2, '0')

  return (
    <div id={`step-${step}`} className="scroll-mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-5 text-left group cursor-pointer"
        aria-expanded={isExpanded}
      >
        <span
          className="text-3xl font-bold font-mono min-w-[3rem] leading-none transition-colors"
          style={{ color: isExpanded ? '#e53e3e' : '#7f1d1d' }}
        >
          {stepNum}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-100">{title}</span>
            {isComplete && <span className="text-green-500 text-sm">✓</span>}
          </div>
          {!isExpanded && isComplete && (
            <p className="text-sm text-gray-600 mt-0.5 truncate">{summary}</p>
          )}
        </div>
        <span className="text-gray-700 group-hover:text-gray-400 transition-colors text-lg select-none">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-16 pb-10">
          {children}
        </div>
      )}

      <div className="border-b border-gray-900" />
    </div>
  )
}
