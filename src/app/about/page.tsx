'use client';

import { useState, useEffect } from 'react';
import { AboutData, Experience, Education } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User, Mail, Phone, MapPin, Globe, Code2, Link2,
  Plus, X, Save, Pencil, Briefcase, GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetch('/api/about')
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Profile saved!');
      setEditing(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && data && !data.skills.includes(s)) {
      setData({ ...data, skills: [...data.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    if (!data) return;
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  const addExperience = () => {
    if (!data) return;
    const newExp: Experience = {
      id: uuidv4(), company: '', role: '', duration: '', description: '',
    };
    setData({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    if (!data) return;
    setData({
      ...data,
      experience: data.experience.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const removeExperience = (id: string) => {
    if (!data) return;
    setData({ ...data, experience: data.experience.filter((e) => e.id !== id) });
  };

  const addEducation = () => {
    if (!data) return;
    const newEdu: Education = {
      id: uuidv4(), institution: '', degree: '', field: '', year: '',
    };
    setData({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    if (!data) return;
    setData({
      ...data,
      education: data.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const removeEducation = (id: string) => {
    if (!data) return;
    setData({ ...data, education: data.education.filter((e) => e.id !== id) });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
            <p className="text-sm text-muted-foreground">Your interview introduction card</p>
          </div>
        </div>
        <Button
          variant={editing ? 'default' : 'outline'}
          size="sm"
          onClick={() => editing ? save() : setEditing(true)}
          disabled={saving}
          className="gap-2"
        >
          {editing ? (
            <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</>
          ) : (
            <><Pencil className="w-4 h-4" /> Edit</>
          )}
        </Button>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '60ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bg-secondary/50 border-border/50" placeholder="Your Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Job Title</label>
                  <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="bg-secondary/50 border-border/50" placeholder="Software Developer" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="bg-secondary/50 border-border/50" placeholder="email@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="bg-secondary/50 border-border/50" placeholder="+91 00000 00000" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Location</label>
                  <Input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className="bg-secondary/50 border-border/50" placeholder="City, Country" />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-1">{data.name || 'Your Name'}</h2>
                <p className="text-primary font-medium mb-3">{data.title || 'Your Title'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  {data.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{data.email}</span>}
                  {data.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{data.phone}</span>}
                  {data.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{data.location}</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '90ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Professional Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {editing ? (
              <Textarea
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                rows={4}
                className="bg-secondary/50 border-border/50 resize-none"
                placeholder="Write a brief introduction about yourself..."
              />
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed">
                {data.summary || 'No summary added yet. Click Edit to add your introduction.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '120ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Skills</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className={`gap-1 ${editing ? 'cursor-pointer hover:bg-destructive/20' : ''}`}
                  onClick={() => editing && removeSkill(skill)}>
                  {skill}
                  {editing && <X className="w-3 h-3" />}
                </Badge>
              ))}
              {data.skills.length === 0 && !editing && (
                <p className="text-xs text-muted-foreground">No skills added yet</p>
              )}
            </div>
            {editing && (
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Add a skill..."
                  className="bg-secondary/50 border-border/50"
                />
                <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Experience
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" onClick={addExperience} className="gap-1 text-xs h-7">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {data.experience.length === 0 && !editing && (
              <p className="text-xs text-muted-foreground">No experience added yet</p>
            )}
            {data.experience.map((exp, i) => (
              <div key={exp.id}>
                {i > 0 && <Separator className="mb-4 opacity-30" />}
                {editing ? (
                  <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border/30 relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                      <Input value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Job Title" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                      <Input value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} placeholder="2023 - Present" className="bg-secondary/50 border-border/50 h-8 text-sm sm:col-span-2" />
                    </div>
                    <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Job description..." rows={2} className="bg-secondary/50 border-border/50 resize-none text-sm" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-sm">{exp.role || 'Role'}</p>
                        <p className="text-primary text-xs">{exp.company || 'Company'}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-border/50 flex-shrink-0">{exp.duration}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '180ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Education
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" onClick={addEducation} className="gap-1 text-xs h-7">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {data.education.length === 0 && !editing && (
              <p className="text-xs text-muted-foreground">No education added yet</p>
            )}
            {data.education.map((edu, i) => (
              <div key={edu.id}>
                {i > 0 && <Separator className="mb-4 opacity-30" />}
                {editing ? (
                  <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border/30 relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                      <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="University Name" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                      <Input value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} placeholder="2023" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                      <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Technology" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                      <Input value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" className="bg-secondary/50 border-border/50 h-8 text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{edu.degree} in {edu.field}</p>
                      <p className="text-primary text-xs">{edu.institution}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-border/50 flex-shrink-0">{edu.year}</Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '210ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {editing ? (
              <div className="space-y-2">
                {[
                   { key: 'github', label: 'GitHub URL', icon: Code2 },
                   { key: 'linkedin', label: 'LinkedIn URL', icon: Link2 },
                   { key: 'portfolio', label: 'Portfolio URL', icon: Globe },
                 ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input
                      value={data.links[key as keyof typeof data.links]}
                      onChange={(e) => setData({ ...data, links: { ...data.links, [key]: e.target.value } })}
                      placeholder={`https://...`}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {data.links.github && (
                  <a href={data.links.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Code2 className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
                {data.links.linkedin && (
                  <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Link2 className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
                {data.links.portfolio && (
                  <a href={data.links.portfolio} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Globe className="w-3.5 h-3.5" /> Portfolio <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
                {!data.links.github && !data.links.linkedin && !data.links.portfolio && (
                  <p className="text-xs text-muted-foreground">No links added yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {editing && (
          <div className="flex gap-3 pb-8">
            <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2 shadow-lg shadow-primary/20" onClick={save} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
