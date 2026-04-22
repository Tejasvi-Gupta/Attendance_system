import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/attendance/student/${user.id}`).then(r => setRecords(r.data));
    api.get(`/attendance/stats/${user.id}`).then(r => setStats(r.data));
  }, [user]);

  const getCount = (status) => stats.find(s => s._id === status)?.count || 0;
  const total = stats.reduce((s, x) => s + x.count, 0);
  const pct = total > 0 ? Math.round((getCount("present") / total) * 100) : 0;

  const statusIcon = { present: <CheckCircle size={14} className="text-green-600" />, absent: <XCircle size={14} className="text-red-500" />, late: <Clock size={14} className="text-yellow-500" /> };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{pct}%</div>
          <p className="text-xs text-gray-500 mt-1">Overall Rate</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{getCount("present")}</div>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-500">{getCount("absent")}</div>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-500">{getCount("late")}</div>
          <p className="text-xs text-gray-500 mt-1">Late</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Attendance Rate</span>
          <span className={`font-bold ${pct >= 75 ? "text-green-600" : "text-red-500"}`}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-700 ${pct >= 75 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${pct}%` }}/>
        </div>
        <p className="text-xs text-gray-400 mt-2">{pct >= 75 ? "Good standing! Keep it up." : "Below 75% — attendance improvement needed."}</p>
      </div>

      {/* Records table */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 20).map(r => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-700">{r.date}</td>
                  <td className="py-2.5 text-gray-700">{r.subject}</td>
                  <td className="py-2.5">
                    <span className={`badge-${r.status} flex items-center gap-1 w-fit`}>
                      {statusIcon[r.status]} {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="3" className="py-8 text-center text-gray-400">No records yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}