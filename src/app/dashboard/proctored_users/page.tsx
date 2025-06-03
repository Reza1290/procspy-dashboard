"use client"
import React, { useEffect, useState } from "react";
import UserTable from "./components/UserTable";
import session from "../../../lib/session";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  

  const getUsers = async (pageNumber = 1) => {
    setIsLoading(true);
    try {
      const token = await session()
      const response = await fetch(`${ process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-users?page=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.data);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    getUsers(page);
  }, [token, page]);

  return (
    <div className="p-6 space-y-4">
      <h1 className='font-medium'>Proctored Users</h1>
      {isLoading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <>
        
          <UserTable users={users} />
          <div className="flex justify-between items-center mt-4 text-white">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersPage;
