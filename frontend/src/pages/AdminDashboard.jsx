import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { Users, CheckCircle, XCircle, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English", "General"];

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      setRefreshing(true);
      try {
        const studentsRes = await api.get("/users/students");
        setStudents(studentsRes.data);

        const results = await Promise.all(
          SUBJECTS.map(s =>
            api.get(`/attendance/class?date=${today}&subject=${s}`)
              .then(r => r.data).catch(() => [])
          )
        );
        setRecentAttendance(results.flat());
      } finally {
        setRefreshing(false);
      }
    };
    fetchData();
  }, [today]);

  const present = recentAttendance.filter(a => a.status === "present").length;
  const absent  = recentAttendance.filter(a => a.status === "absent").length;
  const late    = recentAttendance.filter(a => a.status === "late").length;

  const stats = [
    { label: "Total Students", value: students.length, icon: Users,       color: "bg-blue-50 text-blue-600" },
    { label: "Present Today",  value: present,          icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "Absent Today",   value: absent,           icon: XCircle,     color: "bg-red-50 text-red-600" },
    { label: "Late Today",     value: late,             icon: Clock,       color: "bg-yellow-50 text-yellow-600" },
  ];

  const chartData = [
    { name: "Present", count: present, color: "#22c55e" },
    { name: "Absent",  count: absent,  color: "#ef4444" },
    { name: "Late",    count: late,    color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => {
            const refreshData = async () => {
              setRefreshing(true);
              try {
                const studentsRes = await api.get("/users/students");
                setStudents(studentsRes.data);

                const results = await Promise.all(
                  SUBJECTS.map(s =>
                    api.get(`/attendance/class?date=${today}&subject=${s}`)
                      .then(r => r.data).catch(() => [])
                  )
                );
                setRecentAttendance(results.flat());
              } finally {
                setRefreshing(false);
              }
            };
            refreshData();
          }} disabled={refreshing}
            className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link to="/mark-attendance" className="btn-primary flex items-center gap-2">
            <CheckCircle size={16} /> Mark Attendance
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Today's Overview (All Subjects)
          </h2>
          {present === 0 && absent === 0 && late === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No attendance marked today yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Students */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Students ({students.length})</h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {students.slice(0, 8).map(s => (
              <div key={s._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.studentId || s.email}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No students registered yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}