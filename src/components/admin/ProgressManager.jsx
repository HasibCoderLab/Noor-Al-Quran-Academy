"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { styles } from "../../styles/commonStyles";
import { COURSES } from "../../data/siteData";
import { errorMessage } from "../../lib/apiError";

const emptyForm = {
  status: "not-started",
  lessonsCompleted: "0",
  totalLessons: "0",
  currentLesson: "",
  lastAssessment: "",
  notes: "",
};

const STATUS_KEYS = {
  "not-started": "progress.status.not-started",
  "in-progress": "progress.status.in-progress",
  completed: "progress.status.completed",
};

export default function ProgressManager() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [progress, setProgress] = useState([]);
  const [forms, setForms] = useState(() =>
    Object.fromEntries(COURSES.map((course) => [course.id, { ...emptyForm }]))
  );
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [busyCourse, setBusyCourse] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok) setStudents(Array.isArray(data.students) ? data.students : []);
        else toast.error(errorMessage(t, data, "errors.generic"));
      } catch {
        if (active) toast.error(t("errors.network"));
      } finally {
        if (active) setLoadingStudents(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [t]);

  const loadProgress = useCallback(
    async (userId) => {
      setProgress([]);
      setForms(
        Object.fromEntries(COURSES.map((course) => [course.id, { ...emptyForm }]))
      );
      if (!userId) return;

      setLoadingProgress(true);
      try {
        const res = await fetch(
          `/api/admin/progress?user=${encodeURIComponent(userId)}`
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          const docs = Array.isArray(data.progress) ? data.progress : [];
          setProgress(docs);
          const next = Object.fromEntries(
            COURSES.map((course) => [course.id, { ...emptyForm }])
          );
          for (const doc of docs) {
            if (next[doc.course]) {
              next[doc.course] = {
                status: doc.status,
                lessonsCompleted: String(doc.lessonsCompleted),
                totalLessons: String(doc.totalLessons),
                currentLesson: doc.currentLesson,
                lastAssessment: doc.lastAssessment,
                notes: doc.notes,
              };
            }
          }
          setForms(next);
        } else {
          toast.error(errorMessage(t, data, "errors.generic"));
        }
      } catch {
        toast.error(t("errors.network"));
      } finally {
        setLoadingProgress(false);
      }
    },
    [t]
  );

  const setField = (courseId, field) => (event) =>
    setForms((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: event.target.value },
    }));

  const saveCourse = async (courseId) => {
    if (!selectedStudent || busyCourse) return;
    const form = forms[courseId];

    setBusyCourse(courseId);
    try {
      const res = await fetch("/api/admin/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudent,
          course: courseId,
          status: form.status,
          lessonsCompleted: Number(form.lessonsCompleted),
          totalLessons: Number(form.totalLessons),
          currentLesson: form.currentLesson,
          lastAssessment: form.lastAssessment,
          notes: form.notes,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(errorMessage(t, data, "errors.generic"));
        return;
      }

      toast.success(t("progress.saved"));
      await loadProgress(selectedStudent);
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusyCourse("");
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-hind-siliguri text-lg font-bold text-primary">
            {t("admin.progress.title")}
          </h2>
          <p className="mt-0.5 text-sm text-primary/60">
            {t("progress.subtitle")}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-primary">
          <UserRound className="h-4 w-4 text-primary/50" aria-hidden="true" />
          <select
            value={selectedStudent}
            onChange={(event) => {
              setSelectedStudent(event.target.value);
              loadProgress(event.target.value);
            }}
            className={`${styles.input} w-auto min-w-56`}
            aria-label={t("admin.progress.selectStudent")}
          >
            <option value="">
              {loadingStudents
                ? t("common.loading")
                : t("admin.progress.selectStudent")}
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} — {student.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      {students.length === 0 && !loadingStudents ? (
        <p className="mt-6 rounded-xl bg-secondary p-6 text-center text-sm text-primary/60">
          {t("admin.progress.noStudents")}
        </p>
      ) : !selectedStudent ? (
        <p className="mt-6 rounded-xl bg-secondary p-6 text-center text-sm text-primary/60">
          {t("admin.progress.selectStudent")}
        </p>
      ) : loadingProgress ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-primary/60">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("common.loading")}
        </div>
      ) : (
        <>
          {progress.length === 0 && (
            <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm text-primary/60">
              {t("admin.progress.empty")}
            </p>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {COURSES.map((course) => {
              const form = forms[course.id];
              const fieldClass = `${styles.input} text-sm`;
              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-primary/10 p-5"
                >
                  <h3 className="font-hind-siliguri font-bold text-primary">
                    {course.name}
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`status-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("common.status")}
                      </label>
                      <select
                        id={`status-${course.id}`}
                        value={form.status}
                        onChange={setField(course.id, "status")}
                        className={`${fieldClass} appearance-none`}
                      >
                        {Object.entries(STATUS_KEYS).map(([value, key]) => (
                          <option key={value} value={value}>
                            {t(key)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`assessment-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("progress.lastAssessment")}
                      </label>
                      <input
                        id={`assessment-${course.id}`}
                        type="date"
                        value={form.lastAssessment}
                        onChange={setField(course.id, "lastAssessment")}
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`lessons-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("progress.lessons")}
                      </label>
                      <input
                        id={`lessons-${course.id}`}
                        type="number"
                        min="0"
                        value={form.lessonsCompleted}
                        onChange={setField(course.id, "lessonsCompleted")}
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`total-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("admin.progress.total")}
                      </label>
                      <input
                        id={`total-${course.id}`}
                        type="number"
                        min="0"
                        value={form.totalLessons}
                        onChange={setField(course.id, "totalLessons")}
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label
                        htmlFor={`lesson-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("progress.currentLesson")}
                      </label>
                      <input
                        id={`lesson-${course.id}`}
                        type="text"
                        maxLength={300}
                        value={form.currentLesson}
                        onChange={setField(course.id, "currentLesson")}
                        placeholder="e.g. Surah Al-Baqarah 1–20"
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label
                        htmlFor={`notes-${course.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                      >
                        {t("admin.progress.notes")}
                      </label>
                      <textarea
                        id={`notes-${course.id}`}
                        rows={2}
                        maxLength={2000}
                        value={form.notes}
                        onChange={setField(course.id, "notes")}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveCourse(course.id)}
                    disabled={Boolean(busyCourse)}
                    className={`${styles.btnPrimary} mt-4 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {busyCourse === course.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    {t("common.save")}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
