import { useMemo, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { FiDownload, FiExternalLink, FiCopy } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { HiSparkles } from 'react-icons/hi';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || '/generate';

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
const workflowSteps = [
  'Uploading image',
  'Analyzing image',
  'Generating social content',
  'Calculating performance scores',
  'Enhancing image',
];

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

function LoadingWorkflow({ stepIndex }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-slate-100">Processing Workflow</h3>
      <div className="mt-5 space-y-3">
        {workflowSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 text-sm text-slate-300">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${index <= stepIndex ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300' : 'border-slate-700 text-slate-500'}`}>
              {index <= stepIndex ? '✓' : index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
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
  const [tone, setTone] = useState('Professional & polished');
  const [targetAudience, setTargetAudience] = useState('Tech professionals, remote workers, entrepreneurs');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');
  const [responseData, setResponseData] = useState(initialResponse);
  const [workflowStep, setWorkflowStep] = useState(0);

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

  const handleGenerate = async () => {
    if (!brandName.trim() || !tone.trim() || !targetAudience.trim()) {
      toast.error('Please complete all fields before generating.');
      return;
    }

    setLoading(true);
    setWorkflowStep(0);

    try {
      const formData = new FormData();
      formData.append('brandName', brandName);
      formData.append('tone', tone);
      formData.append('targetAudience', targetAudience);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(WEBHOOK_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const payload = response.data;
      const normalized = {
        ...initialResponse,
        ...(payload.analysis ? payload : payload?.body || payload?.data || {}),
        analysis: {
          ...initialResponse.analysis,
          ...(payload.analysis || payload?.analysis || {}),
        },
        content: {
          ...initialResponse.content,
          ...(payload.content || payload?.content || {}),
        },
        performance: {
          ...initialResponse.performance,
          ...(payload.performance || payload?.performance || {}),
        },
        hashtags: payload.hashtags || payload?.hashtags || initialResponse.hashtags,
        cta: payload.cta || payload?.cta || initialResponse.cta,
        strengths: payload.strengths || payload?.strengths || initialResponse.strengths,
        improvements: payload.improvements || payload?.improvements || initialResponse.improvements,
        imageSuggestions: payload.imageSuggestions || payload?.imageSuggestions || initialResponse.imageSuggestions,
        editedImageUrl: payload.editedImageUrl || payload?.editedImageUrl || initialResponse.editedImageUrl,
      };

      setResponseData(normalized);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Unable to generate content. Please try again.');
    } finally {
      setLoading(false);
      setWorkflowStep(workflowSteps.length - 1);
    }
  };

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
                Tone
                <input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
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
                className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {loading ? 'Generating...' : 'Generate'}
                <HiSparkles />
              </button>
              <p className="text-sm text-slate-400">Upload an image and generate AI-backed social content, performance insights, and image enhancement suggestions.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">Status</p>
              <p className="mt-3 text-slate-200">{loading ? 'Processing webhook response…' : 'Ready for generation'}</p>
              <div className="mt-5 space-y-2">
                <div className="rounded-full bg-slate-800/80 p-4 text-sm text-slate-300">Brand: {brandName}</div>
                <div className="rounded-full bg-slate-800/80 p-4 text-sm text-slate-300">Tone: {tone}</div>
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

            {loading ? <LoadingWorkflow stepIndex={workflowStep} /> : null}

            <AnimatePresence mode="wait">
              {activeTab === 'Content' && !loading && (
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

              {activeTab === 'Analytics' && !loading && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
                  {analyticsPanel}
                </motion.div>
              )}

              {activeTab === 'Image Analysis' && !loading && (
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

              {activeTab === 'Enhanced Image' && !loading && (
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
