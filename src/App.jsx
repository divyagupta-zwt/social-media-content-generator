import { useMemo, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { FiDownload, FiExternalLink, FiCopy, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { HiSparkles } from 'react-icons/hi';

const GENERATE_URL = import.meta.env.VITE_WEBHOOK_URL || '/generate-content';
const STATUS_URL_TEMPLATE = import.meta.env.VITE_STATUS_URL || GENERATE_URL.replace('generate-content', 'status/${executionId}');

const STATUS_STEPS = [
  { key: "uploading_image", label: "Uploading Image", msg: "Uploading your image..." },
  { key: "analyzing_image", label: "Analyzing Image", msg: "Analyzing image content and marketing opportunities..." },
  { key: "generating_content", label: "Generating Content", msg: "Generating platform-specific content..." },
  { key: "calculating_scores", label: "Calculating Scores", msg: "Evaluating engagement and audience fit..." },
  { key: "enhancing_image", label: "Enhancing Image", msg: "Creating optimized social media visuals..." },
  { key: "completed", label: "Complete", msg: "Results ready!" }
];

const initialResponse = {
  analysis: {
    subject: 'A man',
    scene: 'Indoor, office or modern living space',
    objects: ['Laptop', 'table/desk'],
    colors: 'Dark blue, metallic gold/silver, dark background with blue accents',
    emotion: 'Focused, concentrated, serious',
    marketing_angle: 'Marketing technology, productivity tools, remote work solutions, or a sophisticated lifestyle.',
    target_audience: 'Professionals, tech-savvy individuals, remote workers, entrepreneurs, students',
    image_quality_score: 8,
  },
  content: {
    instagram: 'Unlock your full potential with the latest tech tools!',
    linkedin: 'Elevate your work experience with innovative solutions and stay ahead of the curve!',
    twitter: 'Get ready to boost your productivity and take your work to the next level! #tech #productivity',
  },
  hashtags: [
    'productivityhacks',
    'remotework',
    'tech',
    'innovation',
    'lifestyle',
    'entrepreneur',
    'focus',
    'success',
    'motivation',
    'inspiration',
  ],
  cta: ['Learn More', 'Get Started Today', 'Discover Now'],
  performance: {
    engagement_score: 8,
    audience_fit_score: 9,
    best_platform: 'LinkedIn',
  },
  strengths: ['Relevant hashtags', 'Clear and concise messaging'],
  improvements: [
    {
      issue: 'Lack of visual elements',
      reason: `The generated content is text-only, which may not grab the audience's attention`,
      fix: 'Add relevant images or videos to the posts',
      severity: 'medium',
    },
  ],
  imageSuggestions: 'Preserve the original image and refine the composition with subtle brand accents and professional lifestyle cues.',
  editedImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
};

const tabList = ['Content', 'Analytics', 'Image Analysis', 'Enhanced Image'];

const platformIcon = {
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
  Twitter: FaTwitter,
  X: FaTwitter,
};

const severityMap = {
  high: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
  medium: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  low: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-100',
};

function copyText(value, label) {
  navigator.clipboard.writeText(value).then(() => {
    toast.success(`${label} copied!`);
  });
}

function Chip({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-700/70 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.18em] text-slate-400">{title}</span>
        {icon}
      </div>
      <p className={`mt-5 text-4xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function ProgressStatCard({ title, score, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{score}/10</p>
        </div>
        <div className="w-28">
          <CircularProgressbar
            value={score}
            maxValue={10}
            text={`${score}/10`}
            styles={buildStyles({
              pathColor: accent,
              textColor: '#cbd5e1',
              trailColor: '#334155',
              backgroundColor: '#0f172a',
            })}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl"> 
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ImageAnalysisAccordion({ content }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-slate-100"
      >
        <span className="text-base font-semibold">Image Enhancement Suggestions</span>
        <span className="text-slate-400">{open ? 'Hide' : 'Show'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden text-sm leading-6 text-slate-300"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkflowTimeline({ currentStatus, isFailed }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="mt-6 space-y-4">
      {STATUS_STEPS.map((step, index) => {
        let isCompleted = index < activeIndex || currentStatus === 'completed';
        let isActive = index === activeIndex && !isFailed && currentStatus !== 'completed';
        let isPending = index > activeIndex;
        let isStepFailed = isFailed && index === activeIndex;

        return (
          <div key={step.key} className="flex items-center gap-4 text-sm text-slate-300">
            <span className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isCompleted ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300' : isActive ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-slate-800 text-cyan-400 scale-110 z-10' : isStepFailed ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 text-slate-500'}`}>
              {isCompleted ? '✓' : isStepFailed ? '✗' : index + 1}
              {isActive && (
                <span className="absolute inset-0 rounded-full animate-ping border border-cyan-400 opacity-50"></span>
              )}
            </span>
            <span className={isCompleted ? 'text-cyan-100 font-medium' : isActive ? 'text-white font-semibold' : isStepFailed ? 'text-rose-200' : 'text-slate-500'}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WorkflowTracker({ status, progress, message }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-xl font-semibold text-slate-100">{message || 'Processing...'}</h3>
        <span className="text-cyan-400 font-semibold">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <WorkflowTimeline currentStatus={status} isFailed={false} />
    </div>
  );
}

function FailureCard({ error, onRetry, onStartOver }) {
  return (
    <div className="rounded-[2rem] border border-rose-500/30 bg-rose-950/20 p-8 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-rose-400 mb-6 text-center sm:text-left">
        <FiAlertCircle size={32} />
        <h3 className="text-2xl font-semibold text-white">Content Generation Failed</h3>
      </div>
      <div className="text-rose-200/80 mb-8 bg-rose-950/40 p-4 rounded-xl border border-rose-500/20">
        <span className="font-semibold block mb-1">Reason:</span>
        {error || 'Unknown error occurred.'}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex justify-center items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          <FiRefreshCw /> Retry
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex justify-center items-center gap-2 rounded-full border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

function ContentCard({ label, icon, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 shadow-sm">{icon}</span>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">{label}</p>
        </div>
      </div>
      <p className="min-h-[88px] text-sm leading-7 text-slate-200">{text}</p>
      <button
        type="button"
        onClick={() => copyText(text, label)}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-cyan-400/15"
      >
        <FiCopy /> Copy
      </button>
    </div>
  );
}

function AnalysisChip({ label }) {
  return <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-200">{label}</span>;
}

function ImprovementCard({ item }) {
  return (
    <div className={`rounded-3xl border p-5 ${severityMap[item.severity]}`}>
      <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-100">
        <span>⚠</span>
        <span>{item.issue}</span>
      </div>
      <div className="space-y-3 text-sm leading-6 text-slate-200">
        <div>
          <span className="font-semibold text-slate-300">Reason:</span>
          <p>{item.reason}</p>
        </div>
        <div>
          <span className="font-semibold text-slate-300">Suggested Fix:</span>
          <p>{item.fix}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [brandName, setBrandName] = useState('Apex Studio');
  const [mood, setmood] = useState('Professional & polished');
  const [targetAudience, setTargetAudience] = useState('Tech professionals, remote workers, entrepreneurs');
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('Content');
  const [responseData, setResponseData] = useState(initialResponse);
  
  // Workflow State
  const [status, setStatus] = useState('idle'); // 'idle' | uploading_image | ... | 'completed' | 'failed'
  const [progress, setProgress] = useState(0);
  const [executionId, setExecutionId] = useState(null);
  const [error, setError] = useState(null);
  
  const pollTimerRef = useRef(null);
  const timeoutRef = useRef(null);

  const platform = responseData.performance.best_platform || 'LinkedIn';
  const PlatformIcon = platformIcon[platform] || FaLinkedin;

  const progressStyles = buildStyles({
    pathColor: '#38bdf8',
    textColor: '#cbd5e1',
    trailColor: '#334155',
    backgroundColor: '#0f172a',
  });

  const imageUrl = responseData.editedImageUrl;

  const handleFileChange = (event) => {
    setImageFile(event.target.files?.[0] || null);
  };

  const clearTimers = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const resetState = () => {
    setStatus('idle');
    setProgress(0);
    setExecutionId(null);
    setError(null);
    clearTimers();
  };

  const startPolling = (execId) => {
    clearTimers();
    setExecutionId(execId);
    
    // 3 minute timeout
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setStatus('failed');
      setError('Processing is taking longer than expected. Please try again.');
    }, 180000);

    pollTimerRef.current = setInterval(async () => {
      try {
        const url = STATUS_URL_TEMPLATE.replace(':executionId', execId);
        const res = await axios.get(url);
        const data = res.data;
        
        if (data.status === 'completed') {
          clearTimers();
          setStatus('completed');
          setProgress(100);
          
          const payload = data.result || {};
          const normalized = {
            ...initialResponse,
            ...(payload.analysis ? payload : payload?.body || payload?.data || {}),
            analysis: { ...initialResponse.analysis, ...(payload.analysis || payload?.analysis || {}) },
            content: { ...initialResponse.content, ...(payload.content || payload?.content || {}) },
            performance: { ...initialResponse.performance, ...(payload.performance || payload?.performance || {}) },
            hashtags: payload.hashtags || payload?.hashtags || initialResponse.hashtags,
            cta: payload.cta || payload?.cta || initialResponse.cta,
            strengths: payload.strengths || payload?.strengths || initialResponse.strengths,
            improvements: payload.improvements || payload?.improvements || initialResponse.improvements,
            imageSuggestions: payload.imageSuggestions || payload?.imageSuggestions || initialResponse.imageSuggestions,
            editedImageUrl: payload.editedImageUrl || payload?.editedImageUrl || initialResponse.editedImageUrl,
          };
          setResponseData(normalized);
          toast.success('Results ready!');
        } else if (data.status === 'failed') {
          clearTimers();
          setStatus('failed');
          setError(data.error || data.result?.error || 'Unknown workflow error occurred.');
        } else {
          setStatus(data.status);
          setProgress(data.progress || 0);
        }
      } catch (err) {
        console.error(err);
        clearTimers();
        setStatus('failed');
        setError('Network error while tracking progress. Please check your connection.');
      }
    }, 2000);
  };

  const handleGenerate = async () => {
    if (!brandName.trim() || !mood.trim() || !targetAudience.trim()) {
      toast.error('Please complete all fields before generating.');
      return;
    }

    resetState();
    setStatus('uploading_image');
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('brandName', brandName);
      formData.append('mood', mood);
      formData.append('targetAudience', targetAudience);
      if (imageFile) formData.append('image', imageFile);

      const response = await axios.post(GENERATE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.executionId) {
        startPolling(response.data.executionId);
      } else {
        throw new Error('No execution ID returned from server.');
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
      setError(err.message || 'Unable to start generation. Please try again.');
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const analyticsPanel = useMemo(() => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <ProgressStatCard title="Engagement Score" score={responseData.performance.engagement_score} accent="#38bdf8" />
        <ProgressStatCard title="Audience Fit" score={responseData.performance.audience_fit_score} accent="#34d399" />
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
          <div className="flex items-center gap-3 text-slate-200">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 shadow-sm"><PlatformIcon size={24} /></span>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Recommended Platform</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{platform}</p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
            Predicted to achieve the highest engagement.
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {responseData.strengths.map((strength) => (
          <div key={strength} className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-slate-100 shadow-glow">
            <p className="text-sm text-emerald-200">✓ {strength}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6">
        {responseData.improvements.map((item) => (
          <ImprovementCard key={item.issue} item={item} />
        ))}
      </div>
    </div>
  ), [responseData, platform, PlatformIcon]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),transparent_25%),#0f172a] pb-16 pt-8 text-slate-100">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-[1640px] px-6">
        <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-glow backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">AI SaaS Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Social Media Content Generator</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Generate premium social posts, analytics, and enhanced image suggestions from your webhook response in a sleek dark interface.</p>
          </div>
          <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-max sm:items-center">
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-inner">Live Webhook Data</div>
            <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-inner">Dark SaaS UI</div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl"
          >
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">Input Panel</p>
              <h2 className="text-2xl font-semibold text-white">Brand settings</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-slate-300">
                Brand Name
                <input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700/70 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/60"
                  placeholder="Enter your brand name"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Mood
                <input
                  value={mood}
                  onChange={(e) => setmood(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700/70 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/60"
                  placeholder="Professional, friendly, bold"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Target Audience
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700/70 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/60"
                  placeholder="Who are you targeting?"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Image Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 w-full rounded-3xl border border-slate-700/70 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none file:cursor-pointer file:rounded-full file:border-0 file:bg-cyan-400/10 file:px-4 file:text-cyan-200"
                />
              </label>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={status !== 'idle' && status !== 'completed' && status !== 'failed'}
                className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(status !== 'idle' && status !== 'completed' && status !== 'failed') ? 'Generating...' : 'Generate'}
                <HiSparkles />
              </button>
              <p className="text-sm text-slate-400">Upload an image and generate AI-backed social content, performance insights, and image enhancement suggestions.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">Status</p>
              <p className="mt-3 text-slate-200 capitalize">{(status === 'idle' || status === 'completed') ? 'Ready for generation' : status?.replace('_', ' ') || ""}</p>
              <div className="mt-5 space-y-2">
                <div className="rounded-full bg-slate-800/80 p-4 text-sm text-slate-300">Brand: {brandName}</div>
                <div className="rounded-full bg-slate-800/80 p-4 text-sm text-slate-300">Mood: {mood}</div>
                <div className="rounded-full bg-slate-800/80 p-4 text-sm text-slate-300">Audience: {targetAudience}</div>
              </div>
            </div>
          </motion.aside>

          <motion.main initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-7">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">Results Dashboard</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Generated outcome overview</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabList.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActiveTab(item)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === item ? 'bg-cyan-400 text-slate-950' : 'border border-slate-700/70 text-slate-300 hover:border-cyan-400/50 hover:text-white'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {status !== 'idle' && status !== 'completed' && status !== 'failed' && (
               <WorkflowTracker status={status} progress={progress} message={STATUS_STEPS.find(s => s.key === status)?.msg || 'Processing...'} />
            )}

            {status === 'failed' && (
               <FailureCard error={error} onRetry={handleGenerate} onStartOver={resetState} />
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'Content' && status === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <ContentCard label="Instagram" icon={<FaInstagram size={20} />} text={responseData.content.instagram} />
                    <ContentCard label="LinkedIn" icon={<FaLinkedin size={20} />} text={responseData.content.linkedin} />
                    <ContentCard label="X / Twitter" icon={<FaTwitter size={20} />} text={responseData.content.twitter} />
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
                      <h3 className="text-lg font-semibold text-white">Hashtags</h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {responseData.hashtags.map((hashtag) => (
                          <Chip key={hashtag} label={`#${hashtag}`} onClick={() => copyText(`#${hashtag}`, 'Hashtag')} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
                      <h3 className="text-lg font-semibold text-white">CTA Suggestions</h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {responseData.cta.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => copyText(item, 'CTA')}
                            className="rounded-full border border-slate-700/70 bg-cyan-400/10 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300 hover:bg-cyan-300/15"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Analytics' && status === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
                  {analyticsPanel}
                </motion.div>
              )}

              {activeTab === 'Image Analysis' && status === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr]">
                  <div className="grid gap-6">
                    <DashboardCard title="Subject">
                      <p className="text-lg text-slate-100">{responseData.analysis.subject}</p>
                    </DashboardCard>
                    <DashboardCard title="Scene">
                      <p className="text-lg text-slate-100">{responseData.analysis.scene}</p>
                    </DashboardCard>
                    <DashboardCard title="Emotion">
                      <p className="text-lg text-slate-100">{responseData.analysis.emotion}</p>
                    </DashboardCard>
                    <DashboardCard title="Marketing Angle">
                      <p className="text-lg text-slate-100">{responseData.analysis.marketing_angle}</p>
                    </DashboardCard>
                  </div>
                  <div className="grid gap-6">
                    <DashboardCard title="Objects">
                      <div className="mt-3 flex flex-wrap gap-3">
                        {responseData.analysis.objects.map((item) => <AnalysisChip key={item} label={item} />)}
                      </div>
                    </DashboardCard>
                    <DashboardCard title="Target Audience">
                      <div className="mt-3 flex flex-wrap gap-3">
                        {responseData.analysis.target_audience.split(',').map((item) => <AnalysisChip key={item.trim()} label={item.trim()} />)}
                      </div>
                    </DashboardCard>
                    <DashboardCard title="Image Quality">
                      <div className="flex items-center justify-between gap-6">
                        <div className="w-32">
                          <CircularProgressbar
                            value={responseData.analysis.image_quality_score}
                            maxValue={10}
                            text={`${responseData.analysis.image_quality_score}/10`}
                            styles={progressStyles}
                          />
                        </div>
                        <p className="max-w-xs text-sm leading-6 text-slate-300">Quality score derived from the image composition, color palette, and brand fit for a premium social media campaign.</p>
                      </div>
                    </DashboardCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Enhanced Image' && status === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_0.5fr]">
                    <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-slate-950/80 shadow-glow">
                      <img src={imageUrl} alt="Enhanced preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
                      <h3 className="text-lg font-semibold text-white">Enhanced Image</h3>
                      <p className="text-slate-300">A high-fidelity visual preview with premium photography styling and branding-ready composition.</p>
                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={() => copyText(imageUrl, 'Image URL')}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-700/70 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                        >
                          <FiCopy /> Copy image URL
                        </button>
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-700/70 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                        >
                          <FiExternalLink /> Open in new tab
                        </a>
                        <a
                          href={imageUrl}
                          download="enhanced-image.jpg"
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          <FiDownload /> Download image
                        </a>
                      </div>
                    </div>
                  </div>
                  <ImageAnalysisAccordion content={responseData.imageSuggestions} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default App;
