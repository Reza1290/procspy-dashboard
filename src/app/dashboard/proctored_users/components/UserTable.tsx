import React, { useEffect, useState } from "react";
import session from "../../../../lib/session";
import { useRouter } from "next/navigation";

export type UserProps = {
  id: string;
  name: string;
  identifier: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

interface RoomOption {
  roomId: string;
  title: string;
}

interface UserTableProps {
  users: UserProps[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const router = useRouter()
  const handleOpenModal = async (user: UserProps) => {
    setSelectedUser(user);
    setShowModal(true);
    setSelectedRoomId("");
    try {
      const token = await session();
      const res = await fetch("https://192.168.2.7:5050/api/rooms",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setRooms(data.data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRooms([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !selectedUser) return;

    try {
      const token = await session();
      await fetch("https://192.168.2.7:5050/api/session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proctoredUserId: selectedUser.id,
          roomId: selectedRoomId,
        }),
      });

      alert("Session generated!");
      handleCloseModal();
    } catch (err) {
      console.error("Error generating session", err);
      alert("Failed to generate session.");
    }
  };

  return (
    <div className="overflow-x-auto p-4 border border-white/10 rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-slate-900/10">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Identifier</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="px-4 py-2 text-left">Updated At</th>
            <th className="px-4 py-2 text-left">Deleted At</th>
            <th className="px-4 py-2 text-left">Generate Session</th>
            <th className="px-4 py-2 text-left">History Session</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-white/10 hover:bg-slate-950">
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.identifier}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.createdAt}</td>
              <td className="px-4 py-2">{user.updatedAt || "-"}</td>
              <td className="px-4 py-2">{user.deletedAt || "-"}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-red-500 rounded text-sm px-3 py-1"
                  onClick={() => handleOpenModal(user)}
                >
                  Generate
                </button>
              </td>
              <td className="px-4 py-2">
                <button className="bg-blue-500 rounded text-sm px-3 py-1"
                onClick={() => router.push(`/dashboard/sessions/${user.id}`)}
                >
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl mb-4 font-semibold">Select a Room</h2>
            <form onSubmit={handleSubmit}>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
                className="w-full p-2 mb-4 rounded bg-slate-800 border border-white/20"
              >
                <option value="">-- Select Room --</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.title ?? "No Name"}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
