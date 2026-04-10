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
  const [newSkill, setNewSkill] = useState('')

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    ))
  }

  const analyzeResume = useCallback(() => {
    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      const personalComplete = Object.values(resumeData.personalInfo).filter(v => v.length > 0).length
      const hasExperience = resumeData.experience.length > 0
      const hasEducation = resumeData.education.length > 0
      const skillCount = resumeData.skills.length
      const summaryLength = resumeData.summary.length

      // Calculate scores
      const baseScore = 50
      let score = baseScore
      score += personalComplete * 3 // Max +21
      score += hasExperience ? 10 : 0
      score += hasEducation ? 5 : 0
      score += Math.min(skillCount * 2, 10) // Max +10
      score += summaryLength > 100 ? 5 : 0
      score = Math.min(score, 100)

      const result: AnalysisResult = {
        score: Math.round(score),
        strengths: [],
        weaknesses: [],
        suggestions: [],
        keywordScore: Math.round(70 + Math.random() * 20),
        readabilityScore: Math.round(75 + Math.random() * 15),
        atsScore: Math.round(65 + Math.random() * 25),
      }

      // Generate feedback
      if (summaryLength > 100) {
        result.strengths.push('Strong professional summary with good length')
      } else {
        result.weaknesses.push('Professional summary is too short')
        result.suggestions.push({
          category: 'Summary',
          tip: 'Expand your summary to 3-4 sentences highlighting key achievements and skills',
          priority: 'high',
        })
      }

      if (hasExperience && resumeData.experience[0].achievements.length >= 2) {
        result.strengths.push('Experience section includes quantifiable achievements')
      } else {
        result.suggestions.push({
          category: 'Experience',
          tip: 'Add more quantifiable achievements (e.g., "Increased efficiency by 30%")',
          priority: 'high',
        })
      }

      if (skillCount >= 8) {
        result.strengths.push('Good variety of technical skills listed')
      } else {
        result.suggestions.push({
          category: 'Skills',
          tip: 'Add more relevant technical skills that match job requirements',
          priority: 'medium',
        })
      }

      if (resumeData.personalInfo.linkedin && resumeData.personalInfo.github) {
        result.strengths.push('Professional links included (LinkedIn, GitHub)')
      } else {
        result.suggestions.push({
          category: 'Contact',
          tip: 'Add your LinkedIn and GitHub profiles for credibility',
          priority: 'low',
        })
      }

      if (resumeData.projects.length > 0) {
        result.strengths.push('Projects section showcases practical experience')
      }

      setAnalysis(result)
      setIsAnalyzing(false)

      // Award XP for analyzing resume
      addXp(30, 'Resume analysis completed')
      completeMission('daily-resume')
      addNotification(`Resume analyzed! Score: ${result.score}%`, 'success')
    }, 2000)
  }, [resumeData, addXp, completeMission, addNotification])

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
                          <input
                            type="text"
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Email</label>
                          <input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Phone</label>
                          <input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Location</label>
                          <input
                            type="text"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">LinkedIn</label>
                          <input
                            type="text"
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">GitHub</label>
                          <input
                            type="text"
                            value={resumeData.personalInfo.github}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, github: e.target.value },
                            }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                    )}

                    {section.id === 'summary' && (
                      <div>
                        <textarea
                          value={resumeData.summary}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            summary: e.target.value,
                          }))}
                          placeholder="Write a compelling summary of your professional background..."
                          className="w-full h-32 px-3 py-2 rounded-lg bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
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
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="Company Name"
                                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                  placeholder="Job Title"
                                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExperience(exp.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                              placeholder="Duration (e.g., Jan 2023 - Present)"
                              className="w-full mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              placeholder="Brief description of your role..."
                              className="w-full h-20 mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div>
                              <label className="text-xs text-muted-foreground">Key Achievements (one per line)</label>
                              <textarea
                                value={exp.achievements.join('\n')}
                                onChange={(e) => updateExperience(exp.id, 'achievements', e.target.value.split('\n'))}
                                placeholder="- Improved performance by 40%&#10;- Led team of 5 developers"
                                className="w-full h-24 mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
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
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                education: prev.education.map(ed =>
                                  ed.id === edu.id ? { ...ed, institution: e.target.value } : ed
                                ),
                              }))}
                              placeholder="Institution"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                education: prev.education.map(ed =>
                                  ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                                ),
                              }))}
                              placeholder="Degree"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                education: prev.education.map(ed =>
                                  ed.id === edu.id ? { ...ed, year: e.target.value } : ed
                                ),
                              }))}
                              placeholder="Year"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                education: prev.education.map(ed =>
                                  ed.id === edu.id ? { ...ed, gpa: e.target.value } : ed
                                ),
                              }))}
                              placeholder="GPA (optional)"
                              className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'skills' && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {resumeData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-destructive transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="Add a skill..."
                            className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <Button onClick={addSkill} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {section.id === 'projects' && (
                      <div className="space-y-4">
                        {resumeData.projects.map((project) => (
                          <div key={project.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p =>
                                  p.id === project.id ? { ...p, name: e.target.value } : p
                                ),
                              }))}
                              placeholder="Project Name"
                              className="w-full mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <textarea
                              value={project.description}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p =>
                                  p.id === project.id ? { ...p, description: e.target.value } : p
                                ),
                              }))}
                              placeholder="Project description..."
                              className="w-full h-20 mb-3 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                              type="text"
                              value={project.technologies.join(', ')}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p =>
                                  p.id === project.id ? { ...p, technologies: e.target.value.split(', ') } : p
                                ),
                              }))}
                              placeholder="Technologies (comma-separated)"
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'certifications' && (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm"
                          >
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
            <Button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Analyze Resume
                </>
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
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className={cn(
                        analysis.score >= 80 ? "text-green-500" :
                        analysis.score >= 60 ? "text-yellow-500" : "text-red-500"
                      )}
                      strokeDasharray={`${analysis.score * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{analysis.score}%</span>
                    <span className="text-xs text-muted-foreground">Overall</span>
                  </div>
                </div>

                {/* Sub Scores */}
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

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-yellow-500 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-3 rounded-lg text-xs",
                          s.priority === 'high' ? "bg-red-500/10 border border-red-500/20" :
                          s.priority === 'medium' ? "bg-yellow-500/10 border border-yellow-500/20" :
                          "bg-muted border border-border"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] uppercase font-medium",
                            s.priority === 'high' ? "bg-red-500/20 text-red-500" :
                            s.priority === 'medium' ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {s.priority}
                          </span>
                          <span className="font-medium">{s.category}</span>
                        </div>
                        <p className="text-muted-foreground">{s.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Resume
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Resume Tips
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                Use action verbs (Led, Developed, Improved)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                Quantify achievements with numbers
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                Keep it to 1-2 pages maximum
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                Tailor to each job application
              </li>
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
