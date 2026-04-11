"use client"

import { useState, useCallback } from 'react'
import { GameProvider, useGame } from '@/lib/game-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Lightbulb,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
} from 'lucide-react'

interface ResumeSection {
  id: string
  title: string
  icon: React.ElementType
  isOpen: boolean
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
}

interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
  achievements: string[]
}

interface Education {
  id: string
  institution: string
  degree: string
  year: string
  gpa: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link: string
}

interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  projects: Project[]
  certifications: string[]
}

interface AnalysisResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: { category: string; tip: string; priority: 'high' | 'medium' | 'low' }[]
  keywordScore: number
  readabilityScore: number
  atsScore: number
}

function ResumeContent() {
  const { addXp, completeMission, addNotification } = useGame()

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: 'personal', title: 'Personal Information', icon: User, isOpen: true },
    { id: 'summary', title: 'Professional Summary', icon: FileText, isOpen: true },
    { id: 'experience', title: 'Work Experience', icon: Briefcase, isOpen: true },
    { id: 'education', title: 'Education', icon: GraduationCap, isOpen: true },
    { id: 'skills', title: 'Technical Skills', icon: Code2, isOpen: true },
    { id: 'projects', title: 'Projects', icon: Award, isOpen: false },
    { id: 'certifications', title: 'Certifications', icon: Star, isOpen: false },
  ])

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
      portfolio: 'alexjohnson.dev',
    },
    summary: 'Results-driven software engineer with 2+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about creating efficient, user-centric solutions.',
    experience: [
      {
        id: '1',
        company: 'Tech Corp Inc.',
        role: 'Software Engineer',
        duration: 'Jan 2023 - Present',
        description: 'Developed and maintained full-stack web applications serving 100K+ users.',
        achievements: [
          'Improved page load times by 40% through code optimization',
          'Led migration from monolith to microservices architecture',
          'Mentored 2 junior developers on best practices',
        ],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'State University',
        degree: 'B.S. Computer Science',
        year: '2022',
        gpa: '3.8',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
    projects: [
      {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with payment integration',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        link: 'github.com/alex/ecommerce',
      },
    ],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
  })

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s =>
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    ))
  }

  const analyzeResume = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result: AnalysisResult = await response.json()
      setAnalysis(result)
      addXp(30, 'Resume analysis completed')
      completeMission('daily-resume')
      addNotification(`Resume analyzed! Score: ${result.score}%`, 'success')
    } catch (error) {
      addNotification('Failed to analyze resume. Please try again.', 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }, [resumeData, addXp, completeMission, addNotification])

  const downloadResume = useCallback(() => {
    setIsDownloading(true)

    const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 11px; color: #222; padding: 32px 40px; line-height: 1.5; }
  h1 { font-size: 24px; font-weight: 700; color: #111; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; color: #555; font-size: 10px; }
  .contact span { display: flex; align-items: center; gap: 4px; }
  hr { border: none; border-top: 1.5px solid #ddd; margin: 12px 0; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #444; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .section { margin-bottom: 16px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: 700; font-size: 12px; }
  .exp-company { color: #555; font-size: 11px; }
  .exp-date { font-size: 10px; color: #888; }
  ul { padding-left: 16px; margin-top: 4px; }
  li { margin-bottom: 2px; }
  .skills { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
  .edu-header { display: flex; justify-content: space-between; }
  .project-name { font-weight: 700; }
  .tech { color: #555; font-size: 10px; }
  .cert { background: #f9f5ff; padding: 2px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-size: 10px; }
</style>
</head>
<body>
<h1>${personalInfo.fullName}</h1>
<div class="contact">
  ${personalInfo.email ? `<span>✉ ${personalInfo.email}</span>` : ''}
  ${personalInfo.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
  ${personalInfo.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
  ${personalInfo.linkedin ? `<span>🔗 ${personalInfo.linkedin}</span>` : ''}
  ${personalInfo.github ? `<span>🐙 ${personalInfo.github}</span>` : ''}
  ${personalInfo.portfolio ? `<span>🌐 ${personalInfo.portfolio}</span>` : ''}
</div>
<hr/>

${summary ? `
<div class="section">
  <h2>Professional Summary</h2>
  <p>${summary}</p>
</div>` : ''}

${experience.length > 0 ? `
<div class="section">
  <h2>Work Experience</h2>
  ${experience.map(exp => `
    <div style="margin-bottom:10px">
      <div class="exp-header">
        <div>
          <span class="exp-title">${exp.role}</span>
          <span class="exp-company"> — ${exp.company}</span>
        </div>
        <span class="exp-date">${exp.duration}</span>
      </div>
      ${exp.description ? `<p style="margin-top:3px;color:#555">${exp.description}</p>` : ''}
      ${exp.achievements.filter(a => a.trim()).length > 0 ? `
        <ul>
          ${exp.achievements.filter(a => a.trim()).map(a => `<li>${a}</li>`).join('')}
        </ul>` : ''}
    </div>
  `).join('')}
</div>` : ''}

${education.length > 0 ? `
<div class="section">
  <h2>Education</h2>
  ${education.map(edu => `
    <div class="edu-header">
      <div>
        <span class="exp-title">${edu.degree}</span>
        <span class="exp-company"> — ${edu.institution}</span>
      </div>
      <span class="exp-date">${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</span>
    </div>
  `).join('')}
</div>` : ''}

${skills.length > 0 ? `
<div class="section">
  <h2>Technical Skills</h2>
  <div class="skills">
    ${skills.map(s => `<span class="skill">${s}</span>`).join('')}
  </div>
</div>` : ''}

${projects.length > 0 ? `
<div class="section">
  <h2>Projects</h2>
  ${projects.map(p => `
    <div style="margin-bottom:8px">
      <span class="project-name">${p.name}</span>
      ${p.link ? `<span class="tech"> | ${p.link}</span>` : ''}
      ${p.description ? `<p style="color:#555;margin-top:2px">${p.description}</p>` : ''}
      ${p.technologies.length > 0 ? `<p class="tech">Tech: ${p.technologies.join(', ')}</p>` : ''}
    </div>
  `).join('')}
</div>` : ''}

${certifications.length > 0 ? `
<div class="section">
  <h2>Certifications</h2>
  ${certifications.map(c => `<span class="cert">${c}</span>`).join('')}
</div>` : ''}

</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_Resume.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsDownloading(false)
    addNotification('Resume downloaded! Open in browser and Print → Save as PDF', 'success')
  }, [resumeData, addNotification])

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }))
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
      achievements: [''],
    }
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }))
  }

  return (
    <DashboardLayout
      title="Resume Builder"
      subtitle="Create an ATS-optimized resume with AI-powered suggestions"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                  {section.isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {section.isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    {section.id === 'personal' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Full Name</label>
                          <input type="text" value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, fullName: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Email</label>
                          <input type="email" value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, email: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Phone</label>
                          <input type="tel" value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, phone: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Location</label>
                          <input type="text" value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, location: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">LinkedIn</label>
                          <input type="text" value={resumeData.personalInfo.linkedin}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, linkedin: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">GitHub</label>
                          <input type="text" value={resumeData.personalInfo.github}
                            onChange={(e) => setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, github: e.target.value } }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                      </div>
                    )}

                    {section.id === 'summary' && (
                      <div>
                        <textarea value={resumeData.summary}
                          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Write a compelling summary of your professional background..."
                          className="w-full h-32 px-3 py-2 rounded-lg bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {resumeData.summary.length}/300 characters (aim for 100-200)
                        </p>
                      </div>
                    )}

                    {section.id === 'experience' && (
                      <div className="space-y-4">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <input type="text" value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="Company Name"
                                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                <input type="text" value={exp.role}
                                  onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                  placeholder="Job Title"
                                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <input type="text" value={exp.duration}
                              onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                              placeholder="Duration (e.g., Jan 2023 - Present)"
                              className="w-full mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <textarea value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              placeholder="Brief description of your role..."
                              className="w-full h-20 mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <div>
                              <label className="text-xs text-muted-foreground">Key Achievements (one per line)</label>
                              <textarea value={exp.achievements.join('\n')}
                                onChange={(e) => updateExperience(exp.id, 'achievements', e.target.value.split('\n'))}
                                placeholder="- Improved performance by 40%&#10;- Led team of 5 developers"
                                className="w-full h-24 mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addExperience} className="w-full gap-2">
                          <Plus className="w-4 h-4" />
                          Add Experience
                        </Button>
                      </div>
                    )}

                    {section.id === 'education' && (
                      <div className="space-y-4">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                            <input type="text" value={edu.institution}
                              onChange={(e) => setResumeData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed) }))}
                              placeholder="Institution"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <input type="text" value={edu.degree}
                              onChange={(e) => setResumeData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, degree: e.target.value } : ed) }))}
                              placeholder="Degree"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <input type="text" value={edu.year}
                              onChange={(e) => setResumeData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, year: e.target.value } : ed) }))}
                              placeholder="Year"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <input type="text" value={edu.gpa}
                              onChange={(e) => setResumeData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, gpa: e.target.value } : ed) }))}
                              placeholder="GPA (optional)"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'skills' && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {resumeData.skills.map((skill) => (
                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="Add a skill..."
                            className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          <Button onClick={addSkill} size="sm"><Plus className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    )}

                    {section.id === 'projects' && (
                      <div className="space-y-4">
                        {resumeData.projects.map((project) => (
                          <div key={project.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <input type="text" value={project.name}
                              onChange={(e) => setResumeData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? { ...p, name: e.target.value } : p) }))}
                              placeholder="Project Name"
                              className="w-full mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <textarea value={project.description}
                              onChange={(e) => setResumeData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? { ...p, description: e.target.value } : p) }))}
                              placeholder="Project description..."
                              className="w-full h-20 mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <input type="text" value={project.technologies.join(', ')}
                              onChange={(e) => setResumeData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? { ...p, technologies: e.target.value.split(', ') } : p) }))}
                              placeholder="Technologies (comma-separated)"
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'certifications' && (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.certifications.map((cert, idx) => (
                          <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm">
                            <Award className="w-3.5 h-3.5" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Analysis Section */}
        <div className="space-y-4">
          {/* Analyze Button */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">AI Resume Analysis</h3>
                <p className="text-xs text-muted-foreground">Get instant feedback</p>
              </div>
            </div>
            <Button onClick={analyzeResume} disabled={isAnalyzing} className="w-full gap-2">
              {isAnalyzing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing...</>
              ) : (
                <><Target className="w-4 h-4" />Analyze Resume</>
              )}
            </Button>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              Earn +30 XP
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="glass rounded-2xl p-6 space-y-6 animate-in slide-in-from-right duration-500">
              {/* Overall Score */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8"
                      className={cn(analysis.score >= 80 ? "text-green-500" : analysis.score >= 60 ? "text-yellow-500" : "text-red-500")}
                      strokeDasharray={`${analysis.score * 3.52} 352`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{analysis.score}%</span>
                    <span className="text-xs text-muted-foreground">Overall</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-cyan-500">{analysis.keywordScore}%</div>
                    <div className="text-[10px] text-muted-foreground">Keywords</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-purple-500">{analysis.readabilityScore}%</div>
                    <div className="text-[10px] text-muted-foreground">Readability</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-green-500">{analysis.atsScore}%</div>
                    <div className="text-[10px] text-muted-foreground">ATS Score</div>
                  </div>
                </div>
              </div>

              {analysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />Strengths
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-red-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-red-400">•</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-yellow-500 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />Suggestions
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className={cn("p-3 rounded-lg text-xs",
                        s.priority === 'high' ? "bg-red-500/10 border border-red-500/20" :
                          s.priority === 'medium' ? "bg-yellow-500/10 border border-yellow-500/20" :
                            "bg-muted border border-border")}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-medium",
                            s.priority === 'high' ? "bg-red-500/20 text-red-500" :
                              s.priority === 'medium' ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-muted text-muted-foreground")}>{s.priority}</span>
                          <span className="font-medium">{s.category}</span>
                        </div>
                        <p className="text-muted-foreground">{s.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button onClick={downloadResume} disabled={isDownloading} variant="outline" className="w-full gap-2">
                  {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Resume
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-1">Downloads as HTML → open in browser → Print → Save as PDF</p>
              </div>
            </div>
          )}

          {/* Download without analysis */}
          {!analysis && (
            <div className="glass rounded-2xl p-4">
              <Button onClick={downloadResume} disabled={isDownloading} variant="outline" className="w-full gap-2">
                {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download Resume
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-1">Downloads as HTML → open in browser → Print → Save as PDF</p>
            </div>
          )}

          {/* Tips */}
          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Resume Tips
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />Use action verbs (Led, Developed, Improved)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />Quantify achievements with numbers</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />Keep it to 1-2 pages maximum</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />Tailor to each job application</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ResumePage() {
  return (
    <GameProvider>
      <ResumeContent />
    </GameProvider>
  )
}