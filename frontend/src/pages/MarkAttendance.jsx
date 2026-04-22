import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Save, Users, Trash2, Pencil, Check, X } from "lucide-react";


const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English", "General"];

const STATUS_COLORS = {
  present: {
    active: "bg-green-100 text-green-700 border-green-300",
    badge:  "bg-green-50 text-green-700 border border-green-200",
  },
  absent: {
    active: "bg-red-100 text-red-700 border-red-300",
    badge:  "bg-red-50 text-red-700 border border-red-200",
  },
  late: {
    active: "bg-yellow-100 text-yellow-700 border-yellow-300",
    badge:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
};

export default function MarkAttendance() {
  const [allStudents, setAllStudents]         = useState([]);
  const [classStudents, setClassStudents]     = useState([]);
  const [attendance, setAttendance]           = useState({});
  const [savedAttendance, setSavedAttendance] = useState({});
  const [editingId, setEditingId]             = useState(null);
  const [editTempStatus, setEditTempStatus]   = useState(null);
  const [date, setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [saving, setSaving]       = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saved, setSaved]         = useState(false);

  // ── Load students once ────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/users/students")
      .then(r => setAllStudents(r.data))
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, []);

  // ── Load existing attendance whenever date or subject changes ─────────────
  // REPLACE the useEffect and loadAttendanceForDate with this clean version:

const loadAttendanceForDate = useCallback(async () => {
  if (allStudents.length === 0) return;
  setLoading(true);
  setEditingId(null);
  try {
    const { data: records } = await api.get(
      `/attendance/class?date=${date}&subject=${subject}`
    );
    if (records.length > 0) {
      const savedIds = records.map(r => r.student._id);
      const savedMap = {};
      records.forEach(r => { savedMap[r.student._id] = r.status; });
      const studentsWithRecords = allStudents.filter(s => savedIds.includes(s._id));
      setClassStudents(studentsWithRecords);
      setAttendance(savedMap);
      setSavedAttendance(savedMap);
      setSaved(true);
    } else {
      const init = {};
      allStudents.forEach(s => { init[s._id] = "present"; });
      setClassStudents(allStudents);
      setAttendance(init);
      setSavedAttendance({});
      setSaved(false);
    }
  } catch {
    const init = {};
    allStudents.forEach(s => { init[s._id] = "present"; });
    setClassStudents(allStudents);
    setAttendance(init);
    setSaved(false);
  } finally {
    setLoading(false);
  }
}, [date, subject, allStudents]);

useEffect(() => {
  loadAttendanceForDate();
}, [loadAttendanceForDate]);

  // ── Remove student from this class (deletes their record from DB) ─────────
  const removeStudent = async (studentId) => {
    try {
      // Delete this student's attendance record for this date+subject
      await api.delete("/attendance/remove", {
        data: { studentId, date, subject },
      });
      setClassStudents(prev => prev.filter(s => s._id !== studentId));
      setAttendance(prev => { const u = { ...prev }; delete u[studentId]; return u; });
      setSavedAttendance(prev => { const u = { ...prev }; delete u[studentId]; return u; });
      toast.success("Student removed from this class");
    } catch {
      // If record didn't exist yet just remove from UI
      setClassStudents(prev => prev.filter(s => s._id !== studentId));
      setAttendance(prev => { const u = { ...prev }; delete u[studentId]; return u; });
      toast.success("Student removed from class");
    }
  };

  // ── Edit a single student's status and save immediately ──────────────────
  const startEdit = (studentId) => {
    setEditingId(studentId);
    setEditTempStatus(attendance[studentId] || "present");
  };

  const confirmEdit = async (studentId) => {
    setSavingEdit(true);
    try {
      await api.post("/attendance/bulk", {
        records: [{ studentId, status: editTempStatus }],
        date,
        subject,
      });
      setAttendance(prev => ({ ...prev, [studentId]: editTempStatus }));
      setSavedAttendance(prev => ({ ...prev, [studentId]: editTempStatus }));
      setEditingId(null);
      setEditTempStatus(null);
      toast.success("Status updated and saved!");
    } catch {
      toast.error("Failed to save status change");
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTempStatus(null);
  };

  // ── Toggle all ────────────────────────────────────────────────────────────
  const toggleAll = (status) => {
    const updated = {};
    classStudents.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
    setSaved(false);
  };

  // ── Bulk save all ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (classStudents.length === 0) {
      toast.error("No students in class to save");
      return;
    }
    setSaving(true);
    try {
      const records = classStudents.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || "present",
      }));
      await api.post("/attendance/bulk", { records, date, subject });
      setSaved(true);
      setSavedAttendance({ ...attendance });
      toast.success(`Attendance saved for ${records.length} students!`);
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const presentCount = classStudents.filter(s => attendance[s._id] === "present").length;
  const absentCount  = classStudents.filter(s => attendance[s._id] === "absent").length;
  const lateCount    = classStudents.filter(s => attendance[s._id] === "late").length;

  const hasUnsavedChanges = classStudents.some(
    s => attendance[s._id] !== savedAttendance[s._id]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          View, edit or record attendance for any date
        </p>
      </div>

      {/* Date + Subject */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" className="input" value={date}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <select className="input" value={subject}
              onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Indicator: existing record or new */}
        <div className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg w-fit
          ${saved
            ? "bg-blue-50 text-blue-600"
            : "bg-gray-50 text-gray-400"}`}>
          {saved
            ? `📋 Existing attendance loaded for ${date} — ${subject}`
            : `🆕 No record yet for ${date} — ${subject}`}
        </div>
      </div>

      {/* Stats — only 3, no Removed */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Present", count: presentCount, color: "bg-green-50 text-green-700 border-green-100" },
          { label: "Absent",  count: absentCount,  color: "bg-red-50 text-red-700 border-red-100" },
          { label: "Late",    count: lateCount,    color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Student list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Students ({classStudents.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={() => toggleAll("present")}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors">
              All Present
            </button>
            <button onClick={() => toggleAll("absent")}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors">
              All Absent
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {classStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No students found</p>
            </div>
          ) : (
            classStudents.map(student => {
              const isEditing = editingId === student._id;
              const status    = attendance[student._id] || "present";
              const isSynced  = savedAttendance[student._id] === status;

              return (
                <div key={student._id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all
                    ${isEditing
                      ? "border-blue-300 bg-blue-50"
                      : saved && !isSynced
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-100 hover:border-gray-200"}`}>

                  {/* Student info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {student.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        {saved && !isSynced && (
                          <span className="text-xs text-orange-500 font-medium flex-shrink-0">unsaved</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{student.studentId || student.email}</p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {isEditing ? (
                      <>
                        {["present", "absent", "late"].map(s => (
                          <button key={s}
                            onClick={() => setEditTempStatus(s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize
                              ${editTempStatus === s
                                ? STATUS_COLORS[s].active + " ring-2 ring-offset-1 ring-current"
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}>
                            {s}
                          </button>
                        ))}
                        <button onClick={() => confirmEdit(student._id)}
                          disabled={savingEdit}
                          className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Save to backend">
                          {savingEdit
                            ? <div className="w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin"/>
                            : <Check size={14} />}
                        </button>
                        <button onClick={cancelEdit}
                          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          title="Cancel">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[status].badge}`}>
                          {status}
                        </span>
                        <button onClick={() => startEdit(student._id)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="Edit status">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeStudent(student._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Remove from this class">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {classStudents.length > 0 && (
          <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {!saved
                ? "⚠️ Not saved yet"
                : hasUnsavedChanges
                  ? "🟠 Unsaved changes — click Re-save"
                  : "✅ All saved to database"}
            </p>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {saving ? "Saving..." : saved ? "Re-save All" : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}