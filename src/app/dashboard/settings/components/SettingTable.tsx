"use client";
import { useEffect, useState } from "react";
import session from "../../../../lib/session";

export type GlobalSettingProps = {
  id: string;
  key: string;
  value: any;
};

type PaginatedResponse = {
  data: GlobalSettingProps[];
  page: number;
  total: number;
  totalPages: number;
};

const SettingTable = () => {
  const [settings, setSettings] = useState<GlobalSettingProps[]>([]);
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState<any | "">("");

  const fetchSettings = async (page: number) => {
    try {
      const token = await session();
      const res = await fetch(`https://192.168.2.5:5050/api/global-settings?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json: PaginatedResponse = await res.json();
      setSettings(json.data);
      setTotalPages(json.totalPages);
    } catch (err) {
      console.error("Failed to fetch global settings", err);
    }
  };

  useEffect(() => {
    fetchSettings(page);
  }, [page]);

  const handleInputChange = (key: string, value: any) => {
    setEditing((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = async (key: string) => {
    const value = editing[key];
    if (value === undefined) return;

    try {
      const token = await session();
      await fetch("https://192.168.2.5:5050/api/global-setting/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      );
      setEditing((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } catch (err) {
      console.error("Failed to update setting", err);
    }
  };

  const handleCreate = async () => {
    if (!newKey || newValue === "") return;
    try {
      const token = await session();
      await fetch("https://192.168.2.5:5050/api/global-setting/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key: newKey, value: newValue }),
      });

      setCreating(false);
      setNewKey("");
      setNewValue("");
      fetchSettings(page); // Refresh list
    } catch (err) {
      console.error("Failed to create setting", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Global Settings</h1>
        {!creating && (
          <button
            className="bg-green-600 px-4 py-2 rounded text-white text-sm"
            onClick={() => setCreating(true)}
          >
            + Create
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-900/10">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Key</th>
              <th className="px-4 py-2 text-left">Value</th>
              {creating && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {creating && (
              <tr className="border-t border-white/10 bg-slate-950">
                <td className="px-4 py-2 text-slate-400 italic">New</td>
                <td className="px-4 py-2">
                  <input
                    className="bg-slate-800 border border-white/10 rounded px-2 py-1 w-48"
                    placeholder="Setting key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    
                    className="bg-slate-800 border border-white/10 rounded px-2 py-1 w-24"
                    placeholder="Value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                    onClick={handleCreate}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-600 text-white text-sm px-3 py-1 rounded"
                    onClick={() => {
                      setCreating(false);
                      setNewKey("");
                      setNewValue("");
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}

            {settings.map((setting) => (
              <tr key={setting.id} className="border-t border-white/10 hover:bg-slate-950">
                <td className="px-4 py-2">{setting.id}</td>
                <td className="px-4 py-2">{setting.key}</td>
                <td className="px-4 py-2">
                  <input
                    
                    className="bg-slate-800 border border-white/10 rounded px-2 py-1 w-24"
                    value={
                      editing[setting.key] !== undefined
                        ? editing[setting.key]
                        : setting.value
                    }
                    onChange={(e) =>
                      handleInputChange(setting.key, e.target.value)
                    }
                    onBlur={() => handleBlur(setting.key)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-slate-800 border border-white/10 rounded disabled:opacity-50"
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm text-white/70">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 bg-slate-800 border border-white/10 rounded disabled:opacity-50"
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingTable;
