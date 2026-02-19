"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Maximize2, Minimize2, Timer,
  Calendar, Clock, Edit2, X, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PomodoroTimer } from "@/components/academics/PomodoroTimer";
import { useAppStore } from "@/lib/store";
import { getDaysUntil, formatDate } from "@/lib/utils";
import type { Exam } from "@/lib/types";

const EXAM_TAGS = ["Math", "Science", "English", "History", "Physics", "Chemistry", "Biology", "SSC", "High Priority"];

export default function AcademicsPage() {
  const { exams, addExam, updateExam, deleteExam, studySessions, addStudySession } = useAppStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);

  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("09:00");
  const [examTags, setExamTags] = useState<string[]>([]);
  const [examNotes, setExamNotes] = useState("");

  // Edit form state
  const [editSubject, setEditSubject] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");

  // Study session form state
  const [sessionSubject, setSessionSubject] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionPomodoros, setSessionPomodoros] = useState(1);

  const handleAddExam = () => {
    if (!examSubject || !examDate) return;
    addExam({
      id: Date.now().toString(),
      subject: examSubject,
      date: examDate,
      time: examTime,
      tags: examTags,
      notes: examNotes,
    });
    setExamSubject("");
    setExamDate("");
    setExamTime("09:00");
    setExamTags([]);
    setExamNotes("");
    setShowAddExam(false);
  };

  const startEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setEditSubject(exam.subject);
    setEditDate(exam.date);
    setEditTime(exam.time);
    setEditTags(exam.tags);
    setEditNotes(exam.notes || "");
  };

  const saveEditExam = () => {
    if (!editingExam || !editSubject || !editDate) return;
    updateExam(editingExam.id, {
      subject: editSubject,
      date: editDate,
      time: editTime,
      tags: editTags,
      notes: editNotes,
    });
    setEditingExam(null);
  };

  const cancelEditExam = () => {
    setEditingExam(null);
    setEditSubject("");
    setEditDate("");
    setEditTime("");
    setEditTags([]);
    setEditNotes("");
  };

  const handleAddStudySession = () => {
    if (!sessionSubject || sessionDuration <= 0) return;
    addStudySession({
      id: Date.now().toString(),
      subject: sessionSubject,
      durationMinutes: sessionDuration,
      timestamp: new Date().toISOString(),
      pomodoroCount: sessionPomodoros,
    });
    setSessionSubject("");
    setSessionDuration(25);
    setSessionPomodoros(1);
    setShowAddSession(false);
  };

  const toggleTag = (tag: string) => {
    setExamTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayStudyMinutes = studySessions
    .filter((s) => s.timestamp.startsWith(new Date().toISOString().split("T")[0]))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const upcomingExams = exams
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen relative">
      {/* Floating Pomodoro */}
      <AnimatePresence>
        {showPomodoro && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4"
          >
            <PomodoroTimer onClose={() => setShowPomodoro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {!isFullscreen && (
        <div className="p-6 pb-0 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-violet-500" />
              Academics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Study, track, and conquer</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{Math.round((todayStudyMinutes / 60) * 10) / 10}h</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{Math.round((totalStudyMinutes / 60) * 10) / 10}h</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{upcomingExams.length}</p>
              <p className="text-xs text-muted-foreground">Exams</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`${isFullscreen ? "p-0" : "p-6 max-w-5xl mx-auto"} space-y-4 mt-4`}>
        {/* Syllabus Iframe */}
        <Card className={isFullscreen ? "rounded-none border-0" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Syllabus Tracker
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPomodoro(!showPomodoro)}
                className={showPomodoro ? "bg-primary text-primary-foreground" : ""}
              >
                <Timer className="w-4 h-4 mr-1" />
                Pomodoro
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://comebacx.netlify.app/"
              className={`w-full border-0 rounded-b-xl ${
                isFullscreen
                  ? "h-[calc(100vh-theme(spacing.20))]"
                  : "h-[500px]"
              }`}
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Syllabus Tracker"
            />
          </CardContent>
        </Card>

        {/* Pomodoro (non-floating, shown in fullscreen) */}
        {isFullscreen && showPomodoro && (
          <div className="fixed bottom-6 right-6 z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4">
            <PomodoroTimer onClose={() => setShowPomodoro(false)} />
          </div>
        )}

        {/* Exam Manager */}
        {!isFullscreen && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Exam Manager
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddExam(!showAddExam)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Exam
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add exam form */}
              <AnimatePresence>
                {showAddExam && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Subject *</Label>
                          <Input
                            value={examSubject}
                            onChange={(e) => setExamSubject(e.target.value)}
                            placeholder="e.g., Mathematics"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Date *</Label>
                          <Input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Time</Label>
                          <Input
                            type="time"
                            value={examTime}
                            onChange={(e) => setExamTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Notes</Label>
                          <Input
                            value={examNotes}
                            onChange={(e) => setExamNotes(e.target.value)}
                            placeholder="Optional notes..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-2 block">Tags</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {EXAM_TAGS.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                examTags.includes(tag)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddExam} className="flex-1" disabled={!examSubject || !examDate}>
                          Add Exam
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddExam(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exam list */}
              <div className="space-y-2">
                {upcomingExams.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">
                    No upcoming exams. Add one above!
                  </p>
                ) : (
                  upcomingExams.map((exam, index) => {
                    const daysLeft = getDaysUntil(new Date(exam.date));
                    const isSSC = exam.id === "ssc-main";
                    const isUrgent = daysLeft <= 7;

                    return (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isSSC
                            ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                            : isUrgent
                            ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center ${
                          isSSC ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-violet-500"
                        } text-white`}>
                          <span className="text-lg font-bold leading-none">{daysLeft}</span>
                          <span className="text-[9px] leading-none mt-0.5">days</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{exam.subject}</p>
                            {isSSC && (
                              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                                Main
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(new Date(exam.date))}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exam.time}
                            </span>
                          </div>
                          {exam.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {exam.tags.map((tag) => (
                                <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {!isSSC && (
                          <>
                            <button
                              onClick={() => startEditExam(exam)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteExam(exam.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study History */}
        {!isFullscreen && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Study Sessions
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowAddSession(!showAddSession)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Log Session
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add session form */}
                <AnimatePresence>
                  {showAddSession && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/5 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Subject *</Label>
                            <Input
                              value={sessionSubject}
                              onChange={(e) => setSessionSubject(e.target.value)}
                              placeholder="e.g., Mathematics"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Duration (minutes)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={300}
                              value={sessionDuration}
                              onChange={(e) => setSessionDuration(parseInt(e.target.value) || 25)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Pomodoros</Label>
                          <div className="flex gap-2 mt-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setSessionPomodoros(n)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                  sessionPomodoros === n
                                    ? "bg-indigo-500 text-white"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddStudySession} className="flex-1" disabled={!sessionSubject}>
                            Log Session
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddSession(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {studySessions.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">
                    No study sessions yet. Start studying with the Pomodoro timer!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {studySessions.slice(-10).reverse().map((session, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                        <div>
                          <span className="font-medium">{session.subject}</span>
                          <span className="text-muted-foreground ml-2">• {session.pomodoroCount} pomodoros</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{session.durationMinutes}m</span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit Exam Modal */}
      <AnimatePresence>
        {editingExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={cancelEditExam}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Exam
                </h3>
                <button onClick={cancelEditExam} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Subject *</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date *</Label>
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAM_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setEditTags((prev) =>
                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          editTags.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveEditExam} className="flex-1" disabled={!editSubject || !editDate}>
                    <Check className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={cancelEditExam}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
