"use client"
import { useEffect, useRef, useState } from "react";
import { CheckIcon, EllipsisVertical, XIcon } from "lucide-react";
import session from "../../../../lib/session";
import PopOver from "../../../../components/ui/PopOver";
import PopOverItem from "../../../../components/ui/PopOverItem";

export type Setting = {
  id: string
  key: string
  value: string
};

const SettingTable = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const keyRef = useRef<HTMLInputElement>(null);
  const valRef = useRef<HTMLInputElement>(null);

  const [addVariableComponentActive, setAddVariableComponentActive] = useState(false);
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    fetchSettings(1);
  }, []);

  const fetchSettings = async (nextPage: number) => {
    try {
      const token = await session();
      const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/global-settings?page=${nextPage}&paginationLimit=12`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(prev => {
          const newSettings = data.data.filter((d: Setting) => !prev.some(p => p.id === d.id));
          return [...prev, ...newSettings];
        });
        setHasMore(nextPage < data.totalPages);
        setLoading(false);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Failed to fetch session history", err);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      fetchSettings(page + 1);
    }
  };

  const handleSubmit = async () => {
    const key = keyRef.current?.value;
    const value = valRef.current?.value;

    if (!key || !value) return;

    try {
      const token = await session();
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/global-setting`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        setSettings(prev => [{ id: `new-${Date.now()}`, key, value }, ...prev]);
      }
    } catch (error) {
      console.error("Failed to submit setting", error);
    } finally {
      if (keyRef.current) keyRef.current.value = "";
      if (valRef.current) valRef.current.value = "";
      setAddVariableComponentActive(false);
    }
  };

  const closeAddVariableComponent = () => {
    if (keyRef.current) keyRef.current.value = "";
    if (valRef.current) valRef.current.value = "";
    setAddVariableComponentActive(false);
  };

  const handleEditGlobalSetting = (setting: Setting) => {
    setEditingSettingId(setting.id);
    setEditValue(setting.value);
  };

  const handleSaveEdit = async (setting: Setting) => {
    try {
      const token = await session();
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/global-setting`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: setting.key,
          value: editValue,
        }),
      });

      if (response.ok) {
        setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: editValue } : s));
        setEditingSettingId(null);
      }
    } catch (error) {
      console.error("Failed to save edit", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSettingId(null);
    setEditValue("");
  };

  return (
    <div>
      <div className="overflow-x-auto border-b border-white/15">
        <div className="mx-8 my-4 flex justify-between">
          <div />
          <button
            onClick={() => setAddVariableComponentActive(true)}
            className="bg-blue-500 p-2 px-4 text-sm rounded-md min-w-32 hover:bg-blue-600"
          >
            Add Variable
          </button>
        </div>
        <div className="relative max-h-[76vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 z-10 backdrop-blur-[2px]">
              <tr>
                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Id</th>
                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Variable Name</th>
                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Value</th>
                <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {addVariableComponentActive && (
                <tr key="new" className="border-t border-white/10 hover:bg-gray-600/30">
                  <td className="pl-8 pr-4 py-4 text-sm text-white/70">-</td>
                  <td className="px-4 py-2 text-sm font-light">
                    <input ref={keyRef} className="p-1 bg-gray-400/10 rounded-md border border-white/10" />
                  </td>
                  <td className="px-4 py-2 text-sm font-light">
                    <input ref={valRef} className="p-1 bg-gray-400/10 rounded-md border border-white/10" />
                  </td>
                  <td className="pr-8 pl-4 py-4 text-xs flex gap-4">
                    <div className="bg-blue-500 rounded p-1 px-2 cursor-pointer flex items-center gap-1" onClick={handleSubmit}>
                      <CheckIcon className="w-4" />
                    </div>
                    <div className="bg-red-500 rounded p-1 px-2 cursor-pointer flex items-center gap-1" onClick={closeAddVariableComponent}>
                      <XIcon className="w-4" />
                    </div>
                  </td>
                </tr>
              )}

              {settings.map((setting) => (
                <tr key={setting.id} className="border-t border-white/10 hover:bg-gray-600/30">
                  <td className="pl-8 pr-4 py-4 text-sm text-white/70">{setting.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold">{setting.key}</td>
                  <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">
                    {editingSettingId === setting.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="p-1 bg-gray-400/10 rounded-md border border-white/10 text-white"
                      />
                    ) : (
                      setting.value
                    )}
                  </td>
                  <td className="pr-8 pl-4 py-4 text-xs flex gap-4 items-center">
                    {editingSettingId === setting.id ? (
                      <>
                        <div className="bg-blue-500 rounded p-1 px-2 cursor-pointer flex items-center gap-1" onClick={() => handleSaveEdit(setting)}>
                          <CheckIcon className="w-4" />
                        </div>
                        <div className="bg-red-500 rounded p-1 px-2 cursor-pointer flex items-center gap-1" onClick={handleCancelEdit}>
                          <XIcon className="w-4" />
                        </div>
                      </>
                    ) : (
                      <PopOver icon={<EllipsisVertical className="w-4 h-4" />}>
                        <PopOverItem onClick={() => handleEditGlobalSetting(setting)}>Edit</PopOverItem>
                      </PopOver>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingTable;
