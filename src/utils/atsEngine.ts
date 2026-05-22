import { ResumeData } from '../data/mockData';

export interface AtsCheckResult {
  overallScore: number;
  keywordScore: number;
  formattingScore: number;
  experienceScore: number;
  readabilityScore: number;
  
  matchedKeywords: string[];
  missingKeywords: string[];
  
  warnings: {
    category: 'formatting' | 'keywords' | 'content' | 'general';
    message: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
  
  statistics: {
    wordCount: number;
    bulletPointCount: number;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    sectionCount: number;
  };
}

export function analyzeResumeForAts(
  resumeText: string,
  targetKeywords: string[]
): AtsCheckResult {
  // 1. Keyword analysis
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  targetKeywords.forEach(keyword => {
    // Escape regex characters
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(resumeText)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const keywordPercentage = targetKeywords.length > 0 
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
    : 75; // baseline

  // 2. Statistics calculation
  const words = resumeText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const bulletPointCount = (resumeText.match(/[•\-\*]/g) || []).length;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com/i.test(resumeText) || /github\.com/i.test(resumeText);
  
  // Section headers check
  const commonHeaders = ['experience', 'education', 'skills', 'projects', 'summary', 'employment', 'certificates', 'languages'];
  let detectedHeaders = 0;
  commonHeaders.forEach(header => {
    if (new RegExp(`\\b${header}\\b`, 'i').test(resumeText)) {
      detectedHeaders++;
    }
  });

  // 3. Formatting Score
  let formattingScore = 100;
  const warnings: AtsCheckResult['warnings'] = [];

  if (!hasEmail) {
    formattingScore -= 20;
    warnings.push({
      category: 'formatting',
      message: 'Email address not found',
      severity: 'high',
      suggestion: 'Include a professional email address (e.g., name@email.com) in your header.'
    });
  }
  if (!hasPhone) {
    formattingScore -= 15;
    warnings.push({
      category: 'formatting',
      message: 'Phone number not found',
      severity: 'high',
      suggestion: 'Include a contact phone number with area code in your header.'
    });
  }
  if (!hasLinkedIn) {
    formattingScore -= 10;
    warnings.push({
      category: 'formatting',
      message: 'Missing professional profiles (LinkedIn/GitHub)',
      severity: 'medium',
      suggestion: 'Add your LinkedIn or GitHub profile link to provide verification of your portfolio.'
    });
  }
  if (bulletPointCount < 5) {
    formattingScore -= 15;
    warnings.push({
      category: 'formatting',
      message: 'Few or no bullet points detected',
      severity: 'high',
      suggestion: 'Use bullet points (•) rather than paragraphs to list achievements under your work experience.'
    });
  }
  
  // 4. Readability Score based on word count & structure
  let readabilityScore = 90;
  if (wordCount < 200) {
    readabilityScore = 40;
    warnings.push({
      category: 'content',
      message: 'Resume text is extremely short',
      severity: 'high',
      suggestion: 'Add more details about your achievements, skills, and projects. A standard resume should be 300-800 words.'
    });
  } else if (wordCount > 1000) {
    readabilityScore = 65;
    warnings.push({
      category: 'content',
      message: 'Resume word count is too high',
      severity: 'medium',
      suggestion: 'Your resume exceeds 1,000 words. Try to keep it concise and under 2 pages (ideally 400-800 words).'
    });
  }

  // 5. Experience Score (Action verbs, metrics)
  let experienceScore = 75;
  const actionVerbs = ['managed', 'led', 'designed', 'optimized', 'scaled', 'implemented', 'achieved', 'delivered', 'reduced', 'increased', 'engineered', 'launched', 'created'];
  let actionVerbCount = 0;
  actionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
    const matches = resumeText.match(regex);
    if (matches) actionVerbCount += matches.length;
  });

  if (actionVerbCount < 3) {
    experienceScore -= 20;
    warnings.push({
      category: 'content',
      message: 'Low usage of strong action verbs',
      severity: 'medium',
      suggestion: 'Start bullet points with strong action verbs like "Architected", "Spearheaded", or "Optimized" instead of passive phrasing.'
    });
  } else {
    experienceScore = Math.min(100, experienceScore + actionVerbCount * 3);
  }

  // Look for quantitative metrics (numbers, percentages, dollar signs)
  const metricMatches = resumeText.match(/\b\d+%\b|\$\d+|\b\d+\s*(?:million|billion|k|x)\b/g);
  if (!metricMatches || metricMatches.length < 2) {
    experienceScore -= 15;
    warnings.push({
      category: 'content',
      message: 'Lack of quantifiable metrics',
      severity: 'high',
      suggestion: 'Include dynamic achievements with measurable impact, e.g., "reduced query latency by 40%" or "managed a budget of $50k".'
    });
  } else {
    experienceScore = Math.min(100, experienceScore + (metricMatches.length * 5));
  }

  // Keyword Score calculation
  const keywordScore = keywordPercentage;

  // Compile overall score
  const overallScore = Math.round(
    (keywordScore * 0.4) + 
    (formattingScore * 0.25) + 
    (experienceScore * 0.2) + 
    (readabilityScore * 0.15)
  );

  return {
    overallScore: Math.min(100, Math.max(10, overallScore)),
    keywordScore,
    formattingScore: Math.max(20, formattingScore),
    experienceScore: Math.max(20, experienceScore),
    readabilityScore,
    matchedKeywords,
    missingKeywords,
    warnings,
    statistics: {
      wordCount,
      bulletPointCount,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      sectionCount: detectedHeaders
    }
  };
}

// Convert a ResumeData structure to a single block of searchable text for ATS checking
export function convertResumeToText(resume: ResumeData): string {
  let text = `${resume.name}\n${resume.title}\n${resume.email} | ${resume.phone} | ${resume.location} | ${resume.website}\n\n`;
  text += `Professional Summary:\n${resume.summary}\n\n`;
  text += `Skills:\n${resume.skills.join(', ')}\n\n`;
  
  text += `Experience:\n`;
  resume.experience.forEach(exp => {
    text += `${exp.role} - ${exp.company} (${exp.duration}) - ${exp.location}\n`;
    exp.bullets.forEach(bullet => {
      text += `• ${bullet}\n`;
    });
  });
  text += `\n`;

  text += `Education:\n`;
  resume.education.forEach(edu => {
    text += `${edu.degree} - ${edu.school} (${edu.duration})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}\n`;
  });
  text += `\n`;

  text += `Projects:\n`;
  resume.projects.forEach(proj => {
    text += `${proj.name} (${proj.technologies})\n${proj.description}\n`;
  });
  text += `\n`;

  text += `Certifications:\n`;
  text += resume.certifications.join('\n');

  return text;
}
