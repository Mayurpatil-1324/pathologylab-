'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Security & Audit Trail Logs
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Immutable chronological logging of all sensitive administrative, report, and booking modifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bgLight transition-colors">
                    <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[11px] font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-navy-900 font-medium">
                      <div>{log.user?.name || log.userEmail || 'System'}</div>
                      <div className="text-[10px] text-slate-400">{log.user?.role}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">{log.entityType}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.entityId}</td>
                    <td className="p-3 text-slate-600 max-w-sm truncate text-[11px] font-mono">
                      {log.detailsJson || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
