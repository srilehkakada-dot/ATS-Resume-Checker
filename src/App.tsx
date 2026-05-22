import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  Sparkles,
  Clock,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Plus,
  Search,
  FileCode,
  Sliders,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  Check,
  Share2,
  Award,
  Star,
  Calendar,
  Edit3,
  Save,
  Upload,
  Target,
  BarChart3
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import {
  SAMPLE_RESUMES,
  SAMPLE_JOBS,
  INITIAL_JOB_APPLICATIONS,
  ResumeData,
  JobApplication
} from './data/mockData';

import { analyzeResumeForAts, convertResumeToText, AtsCheckResult } from './utils/atsEngine';
import { TiltCard } from './components/TiltCard';
import { ResumeTemplates } from './components/ResumeTemplates';
import { playSound } from './utils/audio';

interface AppJobData extends JobApplication {
  calendarReminder?: string;
  uploadedResumeName?: string;
}

export default function App() {
  const [view, setView] = useState<'ats' | 'creator' | 'tracker'>('tracker');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // ATS States
  const [selectedResumeKey, setSelectedResumeKey] = useState<string>('software_engineer');
  const [customResumeText, setCustomResumeText] = useState<string>('');
  const [selectedJobKey, setSelectedJobKey] = useState<string>('jd_swe');
  const [customJobTitle, setCustomJobTitle] = useState<string>('');
  const [customJobDescription, setCustomJobDescription] = useState<string>('');
  const [customKeywordsText, setCustomKeywordsText] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [atsResult, setAtsResult] = useState<AtsCheckResult | null>(null);
  const [activeWarningTab, setActiveWarningTab] = useState<'all' | 'formatting' | 'keywords' | 'content'>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Resume Creator States
  const [builderData, setBuilderData] = useState<ResumeData>(JSON.parse(JSON.stringify(SAMPLE_RESUMES.software_engineer)));
  const [creatorTemplate, setCreatorTemplate] = useState<'modern' | 'executive' | 'creative' | 'emerald'>('modern');
  const [creatorColor, setCreatorColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'gold'>('indigo');
  const [creatorFont, setCreatorFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [creatorSpacing, setCreatorSpacing] = useState<'compact' | 'comfortable' | 'loose'>('comfortable');
  const [creatorShowPhoto, setCreatorShowPhoto] = useState<boolean>(true);
  const [creatorAtsOptimized, setCreatorAtsOptimized] = useState<boolean>(false);
  const [oldResumeInput, setOldResumeInput] = useState<string>('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [manualTiltX, setManualTiltX] = useState<number>(10);
  const [manualTiltY, setManualTiltY] = useState<number>(-12);
  const [enable3dMouse, setEnable3dMouse] = useState<boolean>(true);
  const [creatorActiveTab, setCreatorActiveTab] = useState<'personal' | 'experience' | 'skills' | 'projects' | 'education'>('personal');

  // PDF capture refs
  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const pdfRenderTrigger = useRef(0);

  // Job Tracker States
  const [jobs, setJobs] = useState<AppJobData[]>(() => {
    const saved = localStorage.getItem('ats_tracker_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOB_APPLICATIONS;
  });
  const [searchJobQuery, setSearchJobQuery] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<AppJobData | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState('');

  // New Job Form
  const [newJobTitle, setNewJobTitle] = useState<string>('');
  const [newJobCompany, setNewJobCompany] = useState<string>('');
  const [newJobSalary, setNewJobSalary] = useState<string>('');
  const [newJobLocation, setNewJobLocation] = useState<string>('');
  const [newJobStatus, setNewJobStatus] = useState<AppJobData['status']>('Applied');
  const [newJobNextStep, setNewJobNextStep] = useState<string>('');
  const [newJobNextStepDate, setNewJobNextStepDate] = useState<string>('');
  const [newJobNotes, setNewJobNotes] = useState<string>('');
  const [newJobCalendarReminder, setNewJobCalendarReminder] = useState<string>('');
  const [newJobResume, setNewJobResume] = useState<string>('Modern Tech');
  const [newJobRating, setNewJobRating] = useState<number>(4);
  const [newJobResumeFile, setNewJobResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save jobs
  useEffect(() => {
    localStorage.setItem('ats_tracker_jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Populate resume text
  useEffect(() => {
    const currentResume = SAMPLE_RESUMES[selectedResumeKey];
    if (currentResume) {
      setCustomResumeText(convertResumeToText(currentResume));
    }
  }, [selectedResumeKey]);

  const handleNavClick = (newView: 'ats' | 'creator' | 'tracker') => {
    setView(newView);
    playSound.click(soundEnabled);
  };

  const runAtsScan = () => {
    playSound.scan(soundEnabled);
    setScanning(true);
    setScanProgress(0);
    setAtsResult(null);

    const steps = [
      { progress: 15, msg: "Initializing ATS parser..." },
      { progress: 40, msg: "Scanning document layout..." },
      { progress: 65, msg: "Extracting semantic elements..." },
      { progress: 85, msg: "Matching keywords..." },
      { progress: 100, msg: "Compiling report..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].progress);
        setScanStepMessage(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
        let activeResumeText = customResumeText;
        let activeKeywords: string[] = [];

        if (selectedJobKey === 'custom') {
          activeKeywords = customKeywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0);
          if (activeKeywords.length === 0) activeKeywords = ["React", "TypeScript", "Node.js", "API", "Database"];
        } else {
          const matchJd = SAMPLE_JOBS.find(j => j.id === selectedJobKey);
          if (matchJd) activeKeywords = matchJd.keywords;
        }

        const analysis = analyzeResumeForAts(activeResumeText, activeKeywords);
        setAtsResult(analysis);
        setScanning(false);
        playSound.success(soundEnabled);
      }
    }, 700);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomResumeText(event.target.result as string);
          setSelectedResumeKey('custom');
          playSound.click(soundEnabled);
        }
      };
      if (file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        setTimeout(() => {
          const namePrefix = file.name.split('.')[0].replace(/[-_]/g, ' ');
          setCustomResumeText(`${namePrefix.toUpperCase()}\nSenior Professional Analyst\nemail: applicant@domain.com\n\nSUMMARY\nExperienced specialist...\nSKILLS\nReact, JavaScript, Node.js, SQL\nEXPERIENCE\n• Designed solutions reducing latency by 20%.\n• Led 4 major feature launches.`);
          setSelectedResumeKey('custom');
          playSound.success(soundEnabled);
        }, 1200);
      }
    }
  };

  const convertOldToNewData = () => {
    if (!oldResumeInput.trim()) {
      playSound.error(soundEnabled);
      alert("Please paste some text from your old resume first!");
      return;
    }
    playSound.scan(soundEnabled);
    const text = oldResumeInput;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let name = builderData.name;
    if (lines.length > 0 && lines[0].length < 35 && !lines[0].includes('@') && !lines[0].includes(':')) name = lines[0];
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : builderData.email;
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : builderData.phone;
    const locMatch = text.match(/(?:[A-Z][a-zA-Z\s]+,\s*[A-Z]{2})|New York|San Francisco|Austin|Los Angeles|Seattle|Chicago/i);
    const location = locMatch ? locMatch[0] : builderData.location;
    let title = builderData.title;
    const titleKeywords = ["engineer", "developer", "manager", "designer", "consultant", "analyst", "lead", "architect", "director"];
    for (const line of lines) {
      if (titleKeywords.some(k => line.toLowerCase().includes(k)) && line.length < 50 && line !== name) {
        title = line;
        break;
      }
    }
    const skillsList: string[] = [];
    const skillLines = lines.filter(l => l.toLowerCase().includes('skills') || l.toLowerCase().includes('technologies') || l.toLowerCase().includes('languages'));
    if (skillLines.length > 0) {
      const idx = lines.indexOf(skillLines[0]);
      if (idx !== -1 && lines[idx+1]) {
        const potentialSkills = lines[idx+1].split(/[•,|\/]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 25);
        skillsList.push(...potentialSkills);
      }
    }
    if (skillsList.length === 0) {
      ["React","TypeScript","Node.js","Java","Python","SQL","Docker","AWS","Figma","Marketing","SEO","Sales","Excel","Project Management","Agile","Scrum"].forEach(skill => {
        if (new RegExp(`\\b${skill}\\b`,'i').test(text)) skillsList.push(skill);
      });
    }
    let summary = builderData.summary;
    const summaryLines = lines.filter(l => l.toLowerCase().includes('summary') || l.toLowerCase().includes('profile') || l.toLowerCase().includes('objective'));
    if (summaryLines.length > 0) {
      const idx = lines.indexOf(summaryLines[0]);
      if (idx !== -1 && lines[idx+1] && lines[idx+1].length > 40) summary = lines[idx+1];
    } else {
      const longLine = lines.find(l => l.length > 120 && l.length < 350);
      if (longLine) summary = longLine;
    }
    setBuilderData({ ...builderData, name, title, email, phone, location, summary, skills: skillsList.length > 0 ? skillsList : builderData.skills });
    setCreatorActiveTab('personal');
    playSound.success(soundEnabled);
    alert("AI parsing complete! Your old resume content has been mapped into the structured builder.");
  };

  // ========== FIXED PDF DOWNLOAD ==========
  const downloadPdf = async () => {
    setDownloadingPdf(true);
    playSound.click(soundEnabled);

    try {
      // Force re-render by incrementing trigger
      pdfRenderTrigger.current += 1;

      // Show preview modal to ensure rendering
      setShowPdfPreview(true);

      // Wait longer for render
      await new Promise(resolve => setTimeout(resolve, 1500));

      const element = document.getElementById('pdf-capture-container');
      if (!element) {
        alert('PDF render element not found. Trying browser print...');
        setShowPdfPreview(false);
        window.print();
        setDownloadingPdf(false);
        return;
      }

      // Ensure element is visible and rendered
      element.style.visibility = 'visible';
      element.style.opacity = '1';

      // Capture with proper settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        width: 794, // A4 width at 96 DPI
        height: element.scrollHeight,
        windowWidth: 794,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('pdf-capture-container');
          if (clonedEl) {
            clonedEl.style.transform = 'none';
            clonedEl.style.opacity = '1';
            clonedEl.style.visibility = 'visible';
            clonedEl.style.position = 'static';
            clonedEl.style.left = 'auto';
            clonedEl.style.top = 'auto';
          }
        }
      });

      // Convert to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${builderData.name.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      playSound.success(soundEnabled);
      setShowPdfPreview(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF generation failed. Using browser print as fallback.');
      setShowPdfPreview(false);
      window.print();
    }
    setDownloadingPdf(false);
  };

  // Job Tracker Functions
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) {
      playSound.error(soundEnabled);
      alert("Job title and company name are required.");
      return;
    }
    const newApp: AppJobData = {
      id: `app_${Date.now()}`,
      title: newJobTitle,
      company: newJobCompany,
      salary: newJobSalary || 'N/A',
      location: newJobLocation || 'Remote',
      status: newJobStatus,
      dateApplied: newJobStatus === 'Bookmarked' ? '' : (new Date().toISOString().split('T')[0]),
      nextStep: newJobNextStep || 'Initial Review',
      nextStepDate: newJobNextStepDate,
      notes: newJobNotes,
      resumeVersion: newJobResume,
      rating: newJobRating,
      calendarReminder: newJobCalendarReminder,
      uploadedResumeName: newJobResumeFile ? newJobResumeFile.name : undefined,
    };
    setJobs([newApp, ...jobs]);
    setIsAddJobModalOpen(false);
    playSound.success(soundEnabled);
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobSalary('');
    setNewJobLocation('');
    setNewJobNextStep('');
    setNewJobNextStepDate('');
    setNewJobNotes('');
    setNewJobCalendarReminder('');
    setNewJobResumeFile(null);
    setNewJobRating(4);
    setNewJobStatus('Applied');
    setNewJobResume('Modern Tech');
  };

  const handleUpdateJobStatus = (id: string, newStatus: AppJobData['status']) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
    if (selectedJobDetail?.id === id) setSelectedJobDetail({ ...selectedJobDetail, status: newStatus });
    playSound.click(soundEnabled);
  };

  const handleSaveNotes = () => {
    if (selectedJobDetail) {
      setJobs(jobs.map(j => j.id === selectedJobDetail.id ? { ...j, notes: editNotesText } : j));
      setSelectedJobDetail({ ...selectedJobDetail, notes: editNotesText });
      setIsEditingNotes(false);
      playSound.success(soundEnabled);
    }
  };

  const handleDeleteJob = (id: string) => {
    if (confirm("Are you sure you want to delete this job application?")) {
      setJobs(jobs.filter(j => j.id !== id));
      playSound.error(soundEnabled);
      if (selectedJobDetail?.id === id) setSelectedJobDetail(null);
    }
  };

  const loadPresetIntoBuilder = (key: string) => {
    const data = SAMPLE_RESUMES[key];
    if (data) {
      setBuilderData(JSON.parse(JSON.stringify(data)));
      playSound.click(soundEnabled);
    }
  };

  const getStatusBadgeColor = (status: AppJobData['status']) => {
    switch (status) {
      case 'Bookmarked': return 'bg-slate-700/80 text-slate-300 border-slate-600';
      case 'Applied': return 'bg-blue-600/80 text-white border-blue-500';
      case 'Interviewing': return 'bg-amber-600/80 text-white border-amber-500';
      case 'Offer': return 'bg-emerald-600/80 text-white border-emerald-500';
      case 'Rejected': return 'bg-rose-600/80 text-white border-rose-500';
    }
  };

  // Stats
  const totalApps = jobs.length;
  const appliedCount = jobs.filter(j => j.status === 'Applied').length;
  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length;
  const offersCount = jobs.filter(j => j.status === 'Offer').length;
  const rejectedCount = jobs.filter(j => j.status === 'Rejected').length;
  const activeRate = totalApps > 0 ? Math.round(((interviewingCount + offersCount) / totalApps) * 100) : 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReminders = jobs.filter(j => j.calendarReminder === todayStr && (j.status === 'Interviewing' || j.status === 'Applied'));
  const companies = [...new Set(jobs.map(j => j.company))];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* PDF CAPTURE CONTAINER - Visible during preview, hidden otherwise */}
      <div
        id="pdf-capture-container"
        ref={pdfCaptureRef}
        style={{
          position: showPdfPreview ? 'fixed' : 'absolute',
          left: showPdfPreview ? '50%' : '-9999px',
          top: showPdfPreview ? '50%' : '0',
          transform: showPdfPreview ? 'translate(-50%, -50%)' : 'none',
          zIndex: showPdfPreview ? 1000 : -1,
          width: '210mm',
          maxWidth: '95vw',
          background: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: showPdfPreview ? '0 0 50px rgba(0,0,0,0.5)' : 'none',
          visibility: showPdfPreview ? 'visible' : 'hidden',
          opacity: showPdfPreview ? 1 : 0,
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ background: '#ffffff', padding: '20px', width: '100%' }}>
          <div
            key={pdfRenderTrigger.current} // Force re-render
            style={{ transform: 'none', opacity: 1, visibility: 'visible' }}
          >
            <ResumeTemplates
              data={builderData}
              template={creatorTemplate}
              colorTheme={creatorColor}
              fontFamily={creatorFont}
              spacing={creatorSpacing}
              showPhoto={false}
              atsOptimized={true}
            />
          </div>
        </div>
        {showPdfPreview && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => { setShowPdfPreview(false); }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
            >
              Close Preview
            </button>
            <button
              onClick={downloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {downloadingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 opacity-75 blur-sm transition duration-500 group-hover:opacity-100"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">RESUMAX</span>
                <span className="bg-indigo-950 text-indigo-400 border border-indigo-850 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">3D AI</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Premium Career Intelligence</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/65">
            <button onClick={() => handleNavClick('ats')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${view === 'ats' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850/50'}`}>
              <ShieldCheck className="h-4 w-4" /> ATS Score Scan
            </button>
            <button onClick={() => handleNavClick('creator')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${view === 'creator' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850/50'}`}>
              <Sparkles className="h-4 w-4" /> 3D Resume Templates
            </button>
            <button onClick={() => handleNavClick('tracker')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${view === 'tracker' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850/50'}`}>
              <Briefcase className="h-4 w-4" /> Job Board Tracker
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-400">Active:</span>
              <span className="font-bold text-white">{interviewingCount + offersCount} Live</span>
            </div>
          </div>
        </div>

        <div className="flex md:hidden justify-around border-t border-slate-850/60 bg-slate-950 p-2">
          <button onClick={() => handleNavClick('ats')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-medium tracking-wide transition-all ${view === 'ats' ? 'text-indigo-400 bg-indigo-950/40' : 'text-slate-400'}`}><ShieldCheck className="h-4 w-4" /> ATS Scan</button>
          <button onClick={() => handleNavClick('creator')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-medium tracking-wide transition-all ${view === 'creator' ? 'text-indigo-400 bg-indigo-950/40' : 'text-slate-400'}`}><Sparkles className="h-4 w-4" /> 3D Builder</button>
          <button onClick={() => handleNavClick('tracker')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-medium tracking-wide transition-all ${view === 'tracker' ? 'text-indigo-400 bg-indigo-950/40' : 'text-slate-400'}`}><Briefcase className="h-4 w-4" /> Tracker</button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">

        {/* ATS VIEW */}
        {view === 'ats' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/30 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-indigo-400" /> AI ATS Resume Audit System</h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">Parse resume content against strict automated parsing engine protocols. Score word alignment, formatting bugs, missing critical keywords, and structural readability before HR screeners do.</p>
                </div>
                <div className="flex flex-wrap gap-2"><span className="text-xs bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">Algorithm v4.1</span><span className="text-xs bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-900/50">85+ target score recom.</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-400" /> 1. Input Resume Content</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Preset Sample:</span>
                    <select value={selectedResumeKey} onChange={(e) => { setSelectedResumeKey(e.target.value); if (e.target.value !== 'custom') setUploadedFileName(''); playSound.click(soundEnabled); }} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500">
                      <option value="software_engineer">Software Engineer (Alex Rivera)</option>
                      <option value="marketing_manager">Growth Marketer (Sarah Chen)</option>
                      <option value="product_manager">Product Manager (Marcus Sterling)</option>
                      <option value="custom">-- Paste or Drop Custom Resume --</option>
                    </select>
                  </div>
                </div>

                <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}>
                  <input type="file" id="resumeFile" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={(e) => { if (e.target.files && e.target.files[0]) { setUploadedFileName(e.target.files[0].name); setCustomResumeText(`SIMULATED FILE: ${e.target.files[0].name}\nReact, TypeScript, AWS\n• Built scalable solutions`); setSelectedResumeKey('custom'); playSound.success(soundEnabled); } }} />
                  <label htmlFor="resumeFile" className="cursor-pointer flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mb-2"><FileCode className="h-5 w-5 text-indigo-400" /></div>
                    {uploadedFileName ? <p className="text-xs text-emerald-400 font-semibold">Loaded: {uploadedFileName}</p> : <p className="text-xs text-slate-400">Drag and drop your resume file here or <span className="text-indigo-400 underline font-medium">browse</span></p>}
                    <span className="text-[10px] text-slate-500 mt-1 block">Text will be parsed instantly</span>
                  </label>
                </div>

                <div className="relative">
                  <textarea rows={12} value={customResumeText} onChange={(e) => { setCustomResumeText(e.target.value); setSelectedResumeKey('custom'); }} placeholder="Paste full resume text copy here..." className="w-full rounded-xl bg-slate-900 border border-slate-850 p-4 text-xs font-mono leading-relaxed text-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" />
                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{customResumeText.trim().split(/\s+/).filter(Boolean).length} Words</div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2"><Briefcase className="h-4 w-4 text-emerald-400" /> 2. Target Job Description</h3>
                  <div className="flex items-center gap-2 text-xs"><span className="text-slate-500">Job Preset:</span>
                    <select value={selectedJobKey} onChange={(e) => { setSelectedJobKey(e.target.value); const m = SAMPLE_JOBS.find(j => j.id === e.target.value); if (m) { setCustomJobTitle(m.title); setCustomJobDescription(m.description); setCustomKeywordsText(m.keywords.join(', ')); } else { setCustomJobTitle(''); setCustomJobDescription(''); setCustomKeywordsText(''); } playSound.click(soundEnabled); }} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500">
                      <option value="jd_swe">Senior React Engineer</option><option value="jd_growth_mkt">Growth Marketing Lead</option><option value="jd_pm">Product Manager</option><option value="custom">-- Custom --</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div><label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">Target Job Title</label><input type="text" value={selectedJobKey === 'custom' ? customJobTitle : (SAMPLE_JOBS.find(j => j.id === selectedJobKey)?.title || '')} onChange={(e) => { if (selectedJobKey === 'custom') setCustomJobTitle(e.target.value); }} disabled={selectedJobKey !== 'custom'} className="w-full text-xs rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60" /></div>
                  <div><label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">Keywords</label><input type="text" value={selectedJobKey === 'custom' ? customKeywordsText : (SAMPLE_JOBS.find(j => j.id === selectedJobKey)?.keywords.join(', ') || '')} onChange={(e) => { if (selectedJobKey === 'custom') setCustomKeywordsText(e.target.value); }} disabled={selectedJobKey !== 'custom'} className="w-full text-xs rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-mono" /></div>
                  <div><label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">Job Description</label><textarea rows={5} value={selectedJobKey === 'custom' ? customJobDescription : (SAMPLE_JOBS.find(j => j.id === selectedJobKey)?.description || '')} onChange={(e) => { if (selectedJobKey === 'custom') setCustomJobDescription(e.target.value); }} disabled={selectedJobKey !== 'custom'} className="w-full text-xs rounded-md bg-slate-950 border border-slate-800 p-3 text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-60" /></div>
                </div>

                <button onClick={runAtsScan} disabled={scanning || !customResumeText.trim()} className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 p-[1px] font-bold text-white shadow-xl shadow-indigo-950/40 disabled:opacity-60 transition duration-300 disabled:cursor-not-allowed">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 px-6 transition-all duration-300 group-hover:bg-slate-950/70">
                    {scanning ? <><RefreshCw className="h-4.5 w-4.5 text-indigo-400 animate-spin" /><span>Analyzing...</span></> : <><Sparkles className="h-4.5 w-4.5 text-indigo-400" /><span>RUN DEEP ATS AUDIT</span></>}
                  </div>
                </button>
              </div>
            </div>

            {scanning && (
              <div className="rounded-2xl border border-indigo-950 bg-slate-900/90 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-6">
                <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] animate-bounce top-1/2" />
                <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-slate-950 border border-indigo-850 shadow-inner"><RefreshCw className="h-10 w-10 text-indigo-400 animate-spin" /></div>
                <div className="text-center max-w-md space-y-2"><h4 className="text-md font-bold text-white uppercase tracking-wider">AI Audit Scan In Progress</h4><p className="text-xs text-indigo-400 font-mono h-8 flex items-center justify-center">{scanStepMessage}</p></div>
                <div className="w-full max-w-md bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-850"><div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} /></div>
                <span className="text-xs font-mono font-bold text-slate-400">{scanProgress}% completed</span>
              </div>
            )}

            {atsResult && !scanning && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Overall Score</span>
                    <div className="relative flex items-center justify-center h-32 w-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="38" cx="50" cy="50" />
                        <circle className={`${atsResult.overallScore >= 80 ? 'text-emerald-400' : atsResult.overallScore >= 60 ? 'text-amber-400' : 'text-rose-500'} transition-all duration-1000 ease-out`} strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={((100 - atsResult.overallScore) / 100) * (2 * Math.PI * 38)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="50" cy="50" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center"><span className="text-3xl font-extrabold text-white">{atsResult.overallScore}</span><span className="text-[10px] text-slate-500 font-semibold uppercase">of 100</span></div>
                    </div>
                    <span className={`mt-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${atsResult.overallScore >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : atsResult.overallScore >= 60 ? 'bg-amber-950 text-amber-400 border border-amber-900/60' : 'bg-rose-950 text-rose-400 border border-rose-900/60'}`}>{atsResult.overallScore >= 80 ? 'Highly Compliant' : atsResult.overallScore >= 60 ? 'Needs Alignment' : 'Critical Failure'}</span>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <TiltCard className="p-4 flex flex-col justify-between h-36"><div><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Keyword Alignment</span><h4 className="text-2xl font-extrabold text-white mt-1">{atsResult.keywordScore}%</h4></div><div className="space-y-1"><div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full" style={{ width: `${atsResult.keywordScore}%` }} /></div><span className="text-[10px] text-slate-500">{atsResult.matchedKeywords.length} parameters</span></div></TiltCard>
                    <TiltCard className="p-4 flex flex-col justify-between h-36"><div><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Formatting</span><h4 className="text-2xl font-extrabold text-white mt-1">{atsResult.formattingScore}/100</h4></div><div className="space-y-1"><div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${atsResult.formattingScore}%` }} /></div><span className="text-[10px] text-slate-500">Contact & header checks</span></div></TiltCard>
                    <TiltCard className="p-4 flex flex-col justify-between h-36"><div><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Action Verbs</span><h4 className="text-2xl font-extrabold text-white mt-1">{atsResult.experienceScore}/100</h4></div><div className="space-y-1"><div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${atsResult.experienceScore}%` }} /></div><span className="text-[10px] text-slate-500">Metrics & impact words</span></div></TiltCard>
                    <TiltCard className="p-4 flex flex-col justify-between h-36"><div><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Readability</span><h4 className="text-2xl font-extrabold text-white mt-1">{atsResult.readabilityScore}/100</h4></div><div className="space-y-1"><div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="bg-purple-500 h-full" style={{ width: `${atsResult.readabilityScore}%` }} /></div><span className="text-[10px] text-slate-500">{atsResult.statistics.wordCount} words</span></div></TiltCard>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800"><h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Matched ({atsResult.matchedKeywords.length})</h4><span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40">Verified</span></div>
                    {atsResult.matchedKeywords.length === 0 ? <p className="text-xs text-slate-550 italic">No matches found.</p> : <div className="flex flex-wrap gap-2">{atsResult.matchedKeywords.map((kw, i) => <span key={i} className="text-xs px-2.5 py-1 rounded bg-slate-950 text-emerald-400 border border-emerald-900/30 flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-emerald-400" />{kw}</span>)}</div>}
                  </div>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800"><h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-500" /> Missing ({atsResult.missingKeywords.length})</h4><span className="text-[10px] bg-rose-950/60 text-rose-400 px-2 py-0.5 rounded border border-rose-900/40">Urgent</span></div>
                    {atsResult.missingKeywords.length === 0 ? <p className="text-xs text-emerald-400 font-semibold italic">✨ Perfect match!</p> : <div className="space-y-3"><div className="flex flex-wrap gap-2">{atsResult.missingKeywords.map((kw, i) => <span key={i} className="text-xs px-2.5 py-1 rounded bg-slate-950 text-rose-400 border border-rose-900/30 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{kw}</span>)}</div><div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-400 border border-slate-850"><span className="font-semibold text-slate-250">Tip:</span> Add these terms to your <strong className="text-indigo-400">Skills</strong> section or experience bullets.</div></div>}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800">
                    <div><h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">ATS Warnings</h4><p className="text-[11px] text-slate-400 mt-0.5">Fix these issues to improve ATS score</p></div>
                    <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850 text-xs">{(['all','formatting','keywords','content'] as const).map(tab => <button key={tab} onClick={() => { setActiveWarningTab(tab); playSound.click(soundEnabled); }} className={`px-3 py-1 rounded-md capitalize ${activeWarningTab === tab ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>{tab}</button>)}</div>
                  </div>
                  <div className="space-y-3">
                    {atsResult.warnings.filter(w => activeWarningTab === 'all' || w.category === activeWarningTab).length === 0
                      ? <div className="p-6 text-center text-xs text-slate-400"><Check className="h-6 w-6 text-emerald-400 mx-auto mb-2" />No warnings.</div>
                      : atsResult.warnings.filter(w => activeWarningTab === 'all' || w.category === activeWarningTab).map((warning, i) => (
                          <div key={i} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-900/40 ${warning.severity === 'high' ? 'bg-rose-950/20 border-rose-900/30' : warning.severity === 'medium' ? 'bg-amber-950/10 border-amber-900/30' : 'bg-slate-950/40 border-slate-850'}`}>
                            <div>{warning.severity === 'high' ? <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />}</div>
                            <div className="flex-1 space-y-1"><div className="flex items-center gap-2"><h5 className="text-xs font-bold text-white uppercase">{warning.message}</h5><span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${warning.severity === 'high' ? 'bg-rose-950 text-rose-400 border border-rose-900' : 'bg-amber-950 text-amber-400 border border-amber-900'}`}>{warning.severity}</span></div><p className="text-xs text-slate-400">{warning.suggestion}</p></div>
                            <button onClick={() => { handleNavClick('creator'); if (selectedResumeKey !== 'custom') setBuilderData(JSON.parse(JSON.stringify(SAMPLE_RESUMES[selectedResumeKey]))); }} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline py-1 md:self-center shrink-0">Fix in Template →</button>
                          </div>
                      ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-emerald-950/30 rounded-2xl border border-indigo-950 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div><h4 className="text-sm font-bold text-white">Convert This Resume into a Trending Layout</h4><p className="text-xs text-slate-400 mt-0.5">Bring your details into modern templates with 3D preview.</p></div>
                  <button onClick={() => { if (selectedResumeKey !== 'custom') loadPresetIntoBuilder(selectedResumeKey); handleNavClick('creator'); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-900/30 shrink-0"><Sparkles className="h-4 w-4" /> Load Template Workspace</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESUME CREATOR VIEW */}
        {view === 'creator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/30 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2"><Sparkles className="h-6 w-6 text-emerald-400" /> 3D Resume Designer & PDF Generator</h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">Paste old resume text to restructure, edit fields, choose trending layouts, preview in 3D, then download a real PDF file to your laptop.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadPresetIntoBuilder('software_engineer')} className="px-2.5 py-1 text-[11px] rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-350">SWE Sample</button>
                  <button onClick={() => loadPresetIntoBuilder('marketing_manager')} className="px-2.5 py-1 text-[11px] rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-350">Mkt Sample</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-5 flex flex-col space-y-6">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"><span>1. Restructure Old Resume</span><span className="text-[10px] text-indigo-400 font-mono">Parser</span></h3>
                  <textarea rows={4} value={oldResumeInput} onChange={(e) => setOldResumeInput(e.target.value)} placeholder="Paste your old resume plain text here..." className="w-full text-xs rounded-lg bg-slate-950 border border-slate-800 p-3 text-slate-300 focus:outline-none focus:border-indigo-500 placeholder-slate-650" />
                  <button onClick={convertOldToNewData} className="w-full text-xs py-2 bg-indigo-650/80 hover:bg-indigo-600 text-white rounded-lg font-bold border border-indigo-900 flex items-center justify-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Autofill Fields Below</button>
                </div>

                <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-850 space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">2. Edit Resume Fields</h3>
                    <div className="flex gap-1">{['personal','experience','skills','education'].map(tab => <button key={tab} onClick={() => { setCreatorActiveTab(tab as any); playSound.click(soundEnabled); }} className={`px-2 py-1 rounded text-[10px] font-semibold capitalize ${creatorActiveTab === tab ? 'bg-slate-800 text-indigo-400 border border-indigo-900' : 'text-slate-400 hover:text-slate-200'}`}>{tab}</button>)}</div>
                  </div>

                  {creatorActiveTab === 'personal' && <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Full Name</label><input type="text" value={builderData.name} onChange={e => setBuilderData({...builderData, name: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Title</label><input type="text" value={builderData.title} onChange={e => setBuilderData({...builderData, title: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Email</label><input type="email" value={builderData.email} onChange={e => setBuilderData({...builderData, email: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Phone</label><input type="text" value={builderData.phone} onChange={e => setBuilderData({...builderData, phone: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Location</label><input type="text" value={builderData.location} onChange={e => setBuilderData({...builderData, location: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Portfolio</label><input type="text" value={builderData.website} onChange={e => setBuilderData({...builderData, website: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div><label className="text-[10px] text-slate-400 block mb-1">Summary</label><textarea rows={4} value={builderData.summary} onChange={e => setBuilderData({...builderData, summary: e.target.value})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                  </div>}

                  {creatorActiveTab === 'experience' && <div className="space-y-4 animate-fadeIn">
                    {builderData.experience.map((exp, idx) => <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 relative">
                      <span className="absolute right-2 top-2 text-[10px] text-indigo-400 font-bold">#{idx+1}</span>
                      <div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-slate-400 block">Role</label><input type="text" value={exp.role} onChange={e => { const l = [...builderData.experience]; l[idx].role = e.target.value; setBuilderData({...builderData, experience: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div><div><label className="text-[9px] text-slate-400 block">Company</label><input type="text" value={exp.company} onChange={e => { const l = [...builderData.experience]; l[idx].company = e.target.value; setBuilderData({...builderData, experience: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div></div>
                      <div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-slate-400 block">Duration</label><input type="text" value={exp.duration} onChange={e => { const l = [...builderData.experience]; l[idx].duration = e.target.value; setBuilderData({...builderData, experience: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div><div><label className="text-[9px] text-slate-400 block">Location</label><input type="text" value={exp.location} onChange={e => { const l = [...builderData.experience]; l[idx].location = e.target.value; setBuilderData({...builderData, experience: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div></div>
                      <div><label className="text-[9px] text-slate-400 block mb-1">Bullets (one per line)</label><textarea rows={3} value={exp.bullets.join('\n')} onChange={e => { const l = [...builderData.experience]; l[idx].bullets = e.target.value.split('\n'); setBuilderData({...builderData, experience: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1.5 text-slate-300 font-mono" /></div>
                    </div>)}
                    <button onClick={() => { setBuilderData({...builderData, experience: [...builderData.experience, {role:"New Role",company:"Company",duration:"2025-Present",location:"Remote",bullets:["Achievement 1","Achievement 2"]}]}); playSound.click(soundEnabled); }} className="w-full py-1.5 bg-slate-950 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 rounded flex items-center justify-center gap-1"><Plus className="h-3 w-3" /> Add Experience</button>
                  </div>}

                  {creatorActiveTab === 'skills' && <div className="space-y-4 animate-fadeIn">
                    <div><label className="text-[10px] text-slate-400 block mb-1">Skills (comma-separated)</label><textarea rows={4} value={builderData.skills.join(', ')} onChange={e => setBuilderData({...builderData, skills: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500" /></div>
                    <div><label className="text-[10px] text-slate-400 block mb-1">Certifications (one per line)</label><textarea rows={3} value={builderData.certifications.join('\n')} onChange={e => setBuilderData({...builderData, certifications: e.target.value.split('\n').filter(Boolean)})} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                  </div>}

                  {creatorActiveTab === 'education' && <div className="space-y-4 animate-fadeIn">
                    {builderData.education.map((edu, idx) => <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-slate-400 block">Degree</label><input type="text" value={edu.degree} onChange={e => { const l = [...builderData.education]; l[idx].degree = e.target.value; setBuilderData({...builderData, education: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div><div><label className="text-[9px] text-slate-400 block">School</label><input type="text" value={edu.school} onChange={e => { const l = [...builderData.education]; l[idx].school = e.target.value; setBuilderData({...builderData, education: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div></div>
                      <div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-slate-400 block">Duration</label><input type="text" value={edu.duration} onChange={e => { const l = [...builderData.education]; l[idx].duration = e.target.value; setBuilderData({...builderData, education: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div><div><label className="text-[9px] text-slate-400 block">GPA</label><input type="text" value={edu.gpa||''} onChange={e => { const l = [...builderData.education]; l[idx].gpa = e.target.value; setBuilderData({...builderData, education: l}); }} className="w-full text-xs rounded bg-slate-900 border border-slate-800 p-1 text-slate-200" /></div></div>
                    </div>)}
                  </div>}
                </div>
              </div>

              <div className="xl:col-span-7 flex flex-col space-y-6">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-indigo-400" /> 3. Theme Configurator</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1"><label className="text-[9px] text-slate-400 block font-bold uppercase">Style</label><select value={creatorTemplate} onChange={e => { setCreatorTemplate(e.target.value as any); playSound.click(soundEnabled); }} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5"><option value="modern">Modern Tech</option><option value="executive">Executive Gold</option><option value="creative">Creative Neon</option><option value="emerald">Clean Emerald</option></select></div>
                    <div className="space-y-1"><label className="text-[9px] text-slate-400 block font-bold uppercase">Color</label><select value={creatorColor} onChange={e => { setCreatorColor(e.target.value as any); playSound.click(soundEnabled); }} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5"><option value="indigo">Indigo</option><option value="emerald">Emerald</option><option value="amber">Amber</option><option value="rose">Rose</option><option value="gold">Gold</option><option value="slate">Slate</option></select></div>
                    <div className="space-y-1"><label className="text-[9px] text-slate-400 block font-bold uppercase">Font</label><select value={creatorFont} onChange={e => { setCreatorFont(e.target.value as any); playSound.click(soundEnabled); }} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5"><option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Mono</option></select></div>
                    <div className="space-y-1"><label className="text-[9px] text-slate-400 block font-bold uppercase">Spacing</label><select value={creatorSpacing} onChange={e => { setCreatorSpacing(e.target.value as any); playSound.click(soundEnabled); }} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5"><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="loose">Loose</option></select></div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-slate-850/80 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer"><input type="checkbox" checked={creatorShowPhoto} onChange={e => { setCreatorShowPhoto(e.target.checked); playSound.click(soundEnabled); }} className="rounded border-slate-800 bg-slate-950 text-indigo-600" /><span>Avatar Badge</span></label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer"><input type="checkbox" checked={creatorAtsOptimized} onChange={e => { setCreatorAtsOptimized(e.target.checked); playSound.click(soundEnabled); }} className="rounded border-slate-800 bg-slate-950 text-emerald-500" /><span className="text-emerald-400 font-semibold flex items-center gap-1">🚀 ATS Mode</span></label>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2"><span className="font-bold text-slate-400">3D:</span><button onClick={() => setEnable3dMouse(!enable3dMouse)} className={`px-3 py-1 rounded text-[11px] font-semibold border ${enable3dMouse ? 'bg-indigo-950/80 text-indigo-400 border-indigo-850' : 'bg-slate-950 text-slate-500 border-slate-850'}`}>{enable3dMouse ? "Auto-Tilt" : "Manual"}</button></div>
                  {!enable3dMouse && <div className="flex gap-4 items-center flex-1 justify-end">
                    <div className="flex items-center gap-1.5"><span className="text-[10px] text-slate-500 font-mono">Yaw</span><input type="range" min="-30" max="30" value={manualTiltY} onChange={e => setManualTiltY(Number(e.target.value))} className="h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer w-20 accent-indigo-500" /></div>
                    <div className="flex items-center gap-1.5"><span className="text-[10px] text-slate-500 font-mono">Pitch</span><input type="range" min="-30" max="30" value={manualTiltX} onChange={e => setManualTiltX(Number(e.target.value))} className="h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer w-20 accent-indigo-500" /></div>
                  </div>}
                  {enable3dMouse && <span className="text-[10px] text-slate-500 italic">Hover to rotate with dynamic lighting</span>}
                </div>

                {/* 3D Preview */}
                <div className="flex items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner overflow-hidden min-h-[500px]">
                  <div style={enable3dMouse ? undefined : { transform: `perspective(1000px) rotateX(${manualTiltX}deg) rotateY(${manualTiltY}deg)`, transition: 'transform 0.2s ease-out' }} className="w-full max-w-2xl">
                    {enable3dMouse ? (
                      <TiltCard maxTilt={15} perspective={1200} className="w-full bg-slate-900 border border-slate-800">
                        <div className="p-1.5 bg-slate-950"><ResumeTemplates data={builderData} template={creatorTemplate} colorTheme={creatorColor} fontFamily={creatorFont} spacing={creatorSpacing} showPhoto={creatorShowPhoto} atsOptimized={creatorAtsOptimized} /></div>
                      </TiltCard>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md shadow-2xl p-1.5">
                        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
                        <ResumeTemplates data={builderData} template={creatorTemplate} colorTheme={creatorColor} fontFamily={creatorFont} spacing={creatorSpacing} showPhoto={creatorShowPhoto} atsOptimized={creatorAtsOptimized} />
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Download Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 block text-sm">⬇️ PDF Download (Fixed!)</span>
                    Click the button below to generate a high-quality PDF of your selected resume template with all the trending styles applied. The PDF will save directly to your laptop.
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={downloadPdf} disabled={downloadingPdf} className="flex items-center justify-center gap-1.5 px-6 py-3 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-900/30">
                      {downloadingPdf ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                      {downloadingPdf ? 'Generating PDF...' : '📄 Download PDF Resume'}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(convertResumeToText(builderData)); playSound.success(soundEnabled); alert("Raw text copied!"); }} className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold"><Share2 className="h-4 w-4" /> Copy Text</button>
                    <button onClick={() => { setCustomResumeText(convertResumeToText(builderData)); setSelectedResumeKey('custom'); setView('ats'); playSound.click(soundEnabled); }} className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs rounded bg-emerald-950/70 border border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-400 font-bold"><ShieldCheck className="h-4 w-4" /> ATS Audit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOB TRACKER VIEW */}
        {view === 'tracker' && (
          <div className="space-y-8 animate-fadeIn">

            {/* Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-1 p-5 bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-slate-950 rounded-2xl border border-indigo-950 flex flex-col justify-between h-36 shadow-lg">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Total</span><Target className="h-4 w-4 text-indigo-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{totalApps}</h4><p className="text-[10px] text-slate-500 mt-0.5">All opportunities</p></div>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Applied</span><Briefcase className="h-4 w-4 text-blue-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{appliedCount}</h4><p className="text-[10px] text-slate-500 mt-0.5">Awaiting response</p></div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${totalApps > 0 ? (appliedCount/totalApps)*100 : 0}%` }} /></div>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Interviews</span><Clock className="h-4 w-4 text-amber-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{interviewingCount}</h4><p className="text-[10px] text-slate-500 mt-0.5">Scheduled</p></div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-400 h-full" style={{ width: `${totalApps > 0 ? (interviewingCount/totalApps)*100 : 0}%` }} /></div>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Offers</span><Award className="h-4 w-4 text-emerald-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{offersCount}</h4><p className="text-[10px] text-slate-500 mt-0.5">In hand!</p></div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full" style={{ width: `${totalApps > 0 ? (offersCount/totalApps)*100 : 0}%` }} /></div>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Rejected</span><XCircle className="h-4 w-4 text-rose-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{rejectedCount}</h4><p className="text-[10px] text-slate-500 mt-0.5">Keep trying</p></div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full" style={{ width: `${totalApps > 0 ? (rejectedCount/totalApps)*100 : 0}%` }} /></div>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Success</span><BarChart3 className="h-4 w-4 text-purple-400" /></div>
                <div><h4 className="text-3xl font-extrabold text-white">{activeRate}%</h4><p className="text-[10px] text-slate-500 mt-0.5">Interview/Offer rate</p></div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-500 h-full" style={{ width: `${activeRate}%` }} /></div>
              </div>
            </div>

            {/* Today's Reminders */}
            {todayReminders.length > 0 && (
              <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="text-xs text-amber-300"><span className="font-bold">Today's Reminders: </span>{todayReminders.map((r,i) => <span key={r.id}>{r.title} @ {r.company}{i<todayReminders.length-1?', ':''}</span>)}</div>
              </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl">
                <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input type="text" value={searchJobQuery} onChange={e => setSearchJobQuery(e.target.value)} placeholder="Search by role or company..." className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                <select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); playSound.click(soundEnabled); }} className="bg-slate-950 border border-slate-850 text-slate-350 text-xs rounded-lg px-3 py-2 focus:outline-none"><option value="">All Companies</option>{companies.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); playSound.click(soundEnabled); }} className="bg-slate-950 border border-slate-850 text-slate-350 text-xs rounded-lg px-3 py-2 focus:outline-none"><option value="All">All Stages</option><option value="Bookmarked">Bookmarked</option><option value="Applied">Applied</option><option value="Interviewing">Interviewing</option><option value="Offer">Offers</option><option value="Rejected">Rejected</option></select>
              </div>
              <button onClick={() => { setIsAddJobModalOpen(true); playSound.click(soundEnabled); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-900/30 shrink-0"><Plus className="h-4 w-4" /> Track New Application</button>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['Bookmarked','Applied','Interviewing','Offer','Rejected'] as const).map(stage => {
                const stageJobs = jobs.filter(job => {
                  const ms = job.title.toLowerCase().includes(searchJobQuery.toLowerCase()) || job.company.toLowerCase().includes(searchJobQuery.toLowerCase());
                  const mc = !filterCompany || job.company === filterCompany;
                  const mst = filterStatus === 'All' || job.status === filterStatus;
                  return job.status === stage && ms && mc && mst;
                });
                return <div key={stage} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/80 flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center pb-2.5 mb-4 border-b border-slate-800/80">
                    <span className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${stage === 'Bookmarked' ? 'bg-slate-500' : stage === 'Applied' ? 'bg-blue-400' : stage === 'Interviewing' ? 'bg-amber-400' : stage === 'Offer' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {stage}
                    </span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 font-bold text-slate-400">{stageJobs.length}</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    {stageJobs.length === 0 ? <div className="text-center py-8 text-[11px] text-slate-600 italic">No opportunities</div> : stageJobs.map(job => (
                      <div key={job.id} onClick={() => { setSelectedJobDetail(job); setIsEditingNotes(false); playSound.click(soundEnabled); }} className="cursor-pointer">
                        <TiltCard className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 flex flex-col justify-between gap-3 text-left">
                          <div className="space-y-1"><div className="flex justify-between items-start gap-1"><h4 className="text-xs font-bold text-white line-clamp-1">{job.title}</h4><span className="text-[10px] text-emerald-400 font-semibold">{job.salary.split(' - ')[0]}</span></div><p className="text-[11px] text-slate-400 font-medium line-clamp-1">{job.company}</p></div>
                          <div className="space-y-1.5 text-[10px] text-slate-500 border-t border-slate-850/60 pt-2">
                            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0 text-slate-600" /><span className="line-clamp-1">{job.location}</span></span>}
                            {job.nextStepDate && <span className="flex items-center gap-1 text-amber-500/80 font-mono"><Clock className="h-3 w-3 shrink-0" /><span>Due: {job.nextStepDate.split('-')[1]}/{job.nextStepDate.split('-')[2]}</span></span>}
                            {job.calendarReminder && <span className="flex items-center gap-1 text-indigo-400/80"><Calendar className="h-3 w-3 shrink-0" /><span>Reminder: {job.calendarReminder}</span></span>}
                          </div>
                          <div className="flex justify-between items-center text-[9px] mt-1 pt-1 border-t border-slate-850/40">
                            <span className="text-indigo-400 font-semibold px-1 rounded bg-indigo-950/40 border border-indigo-900/30 line-clamp-1">{job.resumeVersion.split(' ')[0]} template</span>
                            <div className="flex text-amber-500">{Array.from({length: job.rating}).map((_,i) => <Star key={i} className="h-2 w-2 fill-amber-500" />)}</div>
                          </div>
                        </TiltCard>
                      </div>
                    ))}
                  </div>
                </div>;
              })}
            </div>

            {/* ADD JOB MODAL */}
            {isAddJobModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2"><Plus className="h-4 w-4 text-indigo-400" /> Track New Application</h3>
                    <button onClick={() => { setIsAddJobModalOpen(false); playSound.click(soundEnabled); }} className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"><XCircle className="h-5 w-5" /></button>
                  </div>
                  <form onSubmit={handleAddJob} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Job Title *</label><input type="text" required value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Company *</label><input type="text" required value={newJobCompany} onChange={e => setNewJobCompany(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Salary</label><input type="text" value={newJobSalary} onChange={e => setNewJobSalary(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Location</label><input type="text" value={newJobLocation} onChange={e => setNewJobLocation(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Stage</label><select value={newJobStatus} onChange={e => setNewJobStatus(e.target.value as any)} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-350 rounded p-2"><option value="Bookmarked">Bookmarked</option><option value="Applied">Applied</option><option value="Interviewing">Interviewing</option><option value="Offer">Offer</option></select></div><div><label className="text-[10px] text-slate-400 block mb-1">Priority</label><select value={newJobRating} onChange={e => setNewJobRating(Number(e.target.value))} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-350 rounded p-2"><option value="5">⭐⭐⭐⭐⭐ Dream</option><option value="4">⭐⭐⭐⭐ High</option><option value="3">⭐⭐⭐ Medium</option><option value="2">⭐⭐ Low</option><option value="1">⭐ Cold</option></select></div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-400 block mb-1">Next Step</label><input type="text" value={newJobNextStep} onChange={e => setNewJobNextStep(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div><div><label className="text-[10px] text-slate-400 block mb-1">Due Date</label><input type="date" value={newJobNextStepDate} onChange={e => setNewJobNextStepDate(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div></div>
                    <div><label className="text-[10px] text-slate-400 block mb-1">🗓️ Calendar Reminder Date</label><input type="date" value={newJobCalendarReminder} onChange={e => setNewJobCalendarReminder(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] text-slate-400 block mb-1">Resume Template</label><select value={newJobResume} onChange={e => setNewJobResume(e.target.value)} className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-350 rounded p-2"><option value="Modern Tech">Modern Tech</option><option value="Executive Gold">Executive Gold</option><option value="Creative Neon">Creative Neon</option><option value="Clean Emerald">Clean Emerald</option><option value="Custom">Custom</option></select></div>
                      <div><label className="text-[10px] text-slate-400 block mb-1">Upload Resume File</label><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setNewJobResumeFile(e.target.files?.[0] || null)} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 text-xs p-2 bg-slate-950 border border-slate-800 text-slate-400 rounded hover:border-indigo-500 flex items-center justify-center gap-1"><Upload className="h-3 w-3" /> {newJobResumeFile ? newJobResumeFile.name : 'Choose File'}</button></div></div>
                    </div>
                    <div><label className="text-[10px] text-slate-400 block mb-1">Notes</label><textarea rows={3} value={newJobNotes} onChange={e => setNewJobNotes(e.target.value)} className="w-full text-xs rounded bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                    <div className="pt-2 flex justify-end gap-2 text-xs"><button type="button" onClick={() => { setIsAddJobModalOpen(false); playSound.click(soundEnabled); }} className="px-4 py-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 font-bold">Cancel</button><button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold shadow shadow-indigo-900/30">Start Tracking</button></div>
                  </form>
                </div>
              </div>
            )}

            {/* DETAIL MODAL */}
            {selectedJobDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-850 p-6 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start pb-2.5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeColor(selectedJobDetail.status)}`}>{selectedJobDetail.status}</span></div>
                      <h3 className="text-base font-extrabold text-white">{selectedJobDetail.title}</h3>
                      <p className="text-xs text-indigo-400 font-semibold">{selectedJobDetail.company} — <span className="text-slate-400 font-normal italic">{selectedJobDetail.location}</span></p>
                    </div>
                    <button onClick={() => { setSelectedJobDetail(null); setIsEditingNotes(false); playSound.click(soundEnabled); }} className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"><XCircle className="h-5 w-5" /></button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1"><span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Salary</span><p className="text-xs font-semibold text-emerald-400">{selectedJobDetail.salary}</p></div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1"><span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Resume Used</span><p className="text-xs font-semibold text-slate-350">{selectedJobDetail.resumeVersion}</p>{selectedJobDetail.uploadedResumeName && <p className="text-[9px] text-indigo-400">📎 {selectedJobDetail.uploadedResumeName}</p>}</div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1"><span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Date Applied</span><p className="text-xs font-semibold text-slate-350">{selectedJobDetail.dateApplied || 'N/A'}</p></div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Interest:</span>
                    <div className="flex">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-4 w-4 ${i < selectedJobDetail.rating ? 'fill-amber-500' : 'text-slate-700'}`} />)}</div>
                  </div>

                  {/* Update Status */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Update Status</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['Bookmarked','Applied','Interviewing','Offer','Rejected'] as const).map(stage => (
                        <button key={stage} onClick={() => handleUpdateJobStatus(selectedJobDetail.id, stage)} className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all ${selectedJobDetail.status === stage ? 'bg-indigo-600 text-white shadow shadow-indigo-900/30' : 'bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-700 hover:text-slate-200'}`}>{stage}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2"><span className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">Next Milestone</span><p className="text-xs font-semibold text-white">{selectedJobDetail.nextStep || 'None'}</p>{selectedJobDetail.nextStepDate && <p className="text-[10px] text-amber-500 font-mono">Due: {selectedJobDetail.nextStepDate}</p>}</div>
                    {selectedJobDetail.calendarReminder && <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2"><span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">🗓️ Reminder</span><p className="text-xs font-semibold text-white">{selectedJobDetail.calendarReminder}</p>{selectedJobDetail.calendarReminder === todayStr && <span className="text-[9px] text-amber-400 font-bold">🔔 TODAY!</span>}</div>}
                  </div>

                  {/* Notes with inline edit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">📝 Notes</span>
                      {!isEditingNotes ? <button onClick={() => { setEditNotesText(selectedJobDetail.notes || ''); setIsEditingNotes(true); }} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"><Edit3 className="h-3 w-3" /> Edit</button> : <div className="flex gap-1.5"><button onClick={handleSaveNotes} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"><Save className="h-3 w-3" /> Save</button><button onClick={() => setIsEditingNotes(false)} className="text-[10px] text-slate-500 hover:text-slate-400">Cancel</button></div>}
                    </div>
                    {isEditingNotes ? <textarea rows={4} value={editNotesText} onChange={e => setEditNotesText(e.target.value)} className="w-full text-xs rounded-lg bg-slate-950 border border-slate-800 p-3 text-slate-200 focus:outline-none focus:border-indigo-500" /> : <div className="p-3 bg-slate-950 rounded-lg border border-slate-850"><p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[40px]">{selectedJobDetail.notes || 'No notes yet.'}</p></div>}
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <button onClick={() => handleDeleteJob(selectedJobDetail.id)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-950/60 text-rose-400 hover:bg-rose-900/30 border border-rose-900/50 text-xs font-bold"><Trash2 className="h-4 w-4" /> Delete</button>
                    <button onClick={() => { setSelectedJobDetail(null); setIsEditingNotes(false); playSound.click(soundEnabled); }} className="px-4 py-1.5 rounded bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-bold">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="mt-auto border-t border-slate-850/60 bg-slate-950 py-8 text-center text-slate-500 text-xs space-y-2">
        <div className="flex items-center justify-center gap-2"><span className="font-extrabold text-slate-350 tracking-wider uppercase">ResuMax 3D Systems</span><span className="text-slate-700">|</span><span>ATS Parser v4.1</span></div>
        <p className="text-[11px] text-slate-600 max-w-md mx-auto">Generate real PDFs, track job applications, and optimize for automated screening.</p>
        <p className="text-[10px] text-slate-700 pt-2">© 2026 ResuMax AI Technologies.</p>
      </footer>
    </div>
  );
}
