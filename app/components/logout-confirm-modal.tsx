"use client";

import { LogOut } from "lucide-react";

type LogoutConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#020d1f]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-blue-700/40 bg-[#0a1628] p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Logout</h3>
            <p className="text-sm text-blue-300">Are you sure you want to log out?</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-6 text-blue-200">
          You will be signed out of your current alumniweb session.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-blue-700/50 bg-blue-900/40 px-4 py-3 font-semibold text-blue-100 transition-colors hover:bg-blue-800/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
