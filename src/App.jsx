import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import TrackerTab from "./TrackerTab";
import * as db from "./supabaseService";

// ── Close Animation Hook ────────────────────────────────
function useCloseAnimation(onClose, duration = 250) {
  const [closing, setClosing] = useState(false);
  const triggerClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, duration);
  }, [onClose, duration]);
  return { closing, triggerClose };
}

// ── Constants ───────────────────────────────────────────
const STORAGE_KEY = "senjata-habit-tracker";
const HABITS_STORAGE_KEY = "senjata-habit-list";
const CALENDAR_STORAGE_KEY = "senjata-calendar";
const MISSED_STORAGE_KEY = "senjata-missed";

// Real date helpers
const _now = new Date();
const CURRENT_YEAR = _now.getFullYear();
const CURRENT_MONTH = _now.getMonth(); // 0-indexed
const TODAY_DAY = _now.getDate();
const TODAY_DATE = `${CURRENT_YEAR}-${String(CURRENT_MONTH + 1).padStart(2, "0")}-${String(TODAY_DAY).padStart(2, "0")}`;

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
const DAYS_IN_MONTH = getDaysInMonth(CURRENT_YEAR, CURRENT_MONTH);

const DEFAULT_HABITS = [
  { name: "Ga tdur pagi", color: "#ef4444", isDefault: true },
  { name: "Ga begadang 🔥", color: "#ef4444", isDefault: true },
  { name: "Belajar KREFA", color: "#22c55e", isDefault: true },
  { name: "Olahraga", color: "#ec4899", isDefault: true },
  { name: "Muraja'ah Al-Qur'an", color: "#a855f7", isDefault: true },
  { name: "Tilawah Al-Qur'an", color: "#3b82f6", isDefault: true },
  { name: "Journaling", color: "#eab308", isDefault: true },
  { name: "Post konten", color: "#ef4444", isDefault: true },
  { name: "Baca buku/dngr podcast", color: "#9ca3af", isDefault: true },
];

const COLOR_OPTIONS = [
  { name: "Merah", value: "#ef4444" },
  { name: "Hijau", value: "#22c55e" },
  { name: "Pink", value: "#ec4899" },
  { name: "Ungu", value: "#a855f7" },
  { name: "Biru", value: "#3b82f6" },
  { name: "Kuning", value: "#eab308" },
  { name: "Abu-abu", value: "#9ca3af" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Oranye", value: "#f97316" },
];

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ── Storage helpers ─────────────────────────────────────

// ── Date helpers ────────────────────────────────────────
function dateToDayOfMonth(dateStr) {
  return parseInt(dateStr.split("-")[2], 10);
}
function dateToMonthKey(dateStr) {
  return dateStr.slice(0, 7); // '2026-03'
}
function formatDateShort(dateStr) {
  const d = dateToDayOfMonth(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const m = parseInt(dateStr.split("-")[1], 10) - 1;
  return `${d} ${months[m]}`;
}

function getTrackKey(habitName, year = CURRENT_YEAR, month = CURRENT_MONTH) {
  return `${habitName}_${year}-${String(month + 1).padStart(2, "0")}`;
}

function getMonthName(monthIndex) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[monthIndex];
}

// ── Check-In Modal ──────────────────────────────────────
function CheckInModal({
  isOpen,
  onClose,
  trackingData,
  setTrackingData,
  today,
  habitsList,
}) {
  const { closing, triggerClose } = useCloseAnimation(onClose);
  if (!isOpen) return null;

  const toggleHabit = (habitName) => {
    const trackKey = getTrackKey(habitName); // defaults to current month
    setTrackingData((prev) => {
      const next = { ...prev };
      if (!next[trackKey]) next[trackKey] = {};
      next[trackKey] = { ...next[trackKey] };
      next[trackKey][today] = next[trackKey][today] === 1 ? 0 : 1;
      db.saveTrackingData(next);
      return next;
    });
  };

  const doneCount = habitsList.filter(
    (h) => trackingData[getTrackKey(h.name)]?.[today] === 1,
  ).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      {/* Modal */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-t-3xl p-6 shadow-2xl">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                Check-in Hari Ini
              </p>
              <h2 className="text-lg font-bold">12 Maret 2026</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {doneCount}/{habitsList.length}
              </span>
              <button
                onClick={triggerClose}
                className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#2a2a35] h-2 rounded-full overflow-hidden mb-6">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / habitsList.length) * 100}%` }}
            />
          </div>

          {/* Habit list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {habitsList.map((habit) => {
              const trackKey = getTrackKey(habit.name);
              const isDone = trackingData[trackKey]?.[today] === 1;
              return (
                <button
                  key={habit.name}
                  onClick={() => toggleHabit(habit.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isDone
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-[#2a2a35]/50 border border-transparent hover:border-gray-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span
                      className={`text-sm font-medium ${isDone ? "text-white" : "text-gray-400"}`}
                    >
                      {habit.name}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isDone
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/10 text-red-400"
                      }`}
                  >
                    {isDone ? "✓" : "✗"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add/Edit Activity Modal ──────────────────────────────────
function AddActivityModal({ isOpen, onClose, onSave, onDelete, initialData }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("main");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type || "main");
        setSelectedColor(initialData.color);
      } else {
        setName("");
        setType("main");
        setSelectedColor(COLOR_OPTIONS[0].value);
      }
      setError("");
    }
  }, [isOpen, initialData]);

  const { closing, triggerClose } = useCloseAnimation(onClose);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama aktivitas harus diisi!");
      return;
    }
    onSave({ name: trimmed, color: selectedColor, type }, initialData?.name);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-t-3xl p-6 shadow-2xl">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                Tambah Senjata
              </p>
              <h2 className="text-lg font-bold">Aktivitas Baru</h2>
            </div>
            <button
              onClick={triggerClose}
              className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name input */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 font-semibold mb-2 block">
                Nama Aktivitas
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: Push-up 50x"
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* Type selection */}
            <div className="mb-4 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="main"
                  checked={type === "main"}
                  onChange={(e) => setType(e.target.value)}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-white">
                  Main Activity
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="side"
                  checked={type === "side"}
                  onChange={(e) => setType(e.target.value)}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-400">
                  Side Activity
                </span>
              </label>
            </div>

            {/* Color picker */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 font-semibold mb-2 block">
                Pilih Warna
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-8 h-8 rounded-lg transition-all duration-200 ${selectedColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24] scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {name.trim() && (
              <div className="mb-4 p-3 rounded-xl bg-[#2a2a35]/50 border border-[#3a3a45] flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm text-white font-medium">
                  {name.trim()}
                </span>
                <span className="text-xs text-gray-500 ml-auto">Preview</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-8">
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialData.name);
                    triggerClose();
                  }}
                  className="flex-shrink-0 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all focus:outline-none"
                  title="Hapus Aktivitas"
                >
                  Delete
                </button>
              )}
              <div className="flex-1 flex gap-3">
                <button
                  type="button"
                  onClick={triggerClose}
                  className="flex-1 py-3 rounded-xl bg-[#2a2a35] text-gray-400 text-sm font-semibold hover:bg-[#3a3a45] transition-colors focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none"
                >
                  {initialData ? "Simpan" : "Tambah"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Edit List Modal (Select Activity to Edit) ───────────
function EditListModal({ isOpen, onClose, habitsList, onSelect, onReorder }) {
  const [localHabits, setLocalHabits] = useState(habitsList);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    setLocalHabits(habitsList);
  }, [habitsList, isOpen]);

  const { closing, triggerClose } = useCloseAnimation(onClose);
  if (!isOpen) return null;

  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.style.opacity = "0";
    }, 0); // Hide original, keep ghost
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index === dragOverIndex) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";

    // Commit the order based on the LAST known valid positions
    if (
      draggingIndex !== null &&
      dragOverIndex !== null &&
      draggingIndex !== dragOverIndex
    ) {
      const newList = [...localHabits];
      const [moved] = newList.splice(draggingIndex, 1);
      newList.splice(dragOverIndex, 0, moved);

      setLocalHabits(newList);
      if (onReorder) onReorder(newList);
    }

    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 p-4 ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
          <div className="w-12 h-1.5 bg-[#3a3a45] rounded-full mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Pilih yang mau di-edit</h2>
          <p className="text-xs text-gray-400 mb-6 flex justify-between items-center">
            <span>Pilih salah satu aktivitas dari daftar senjata lo.</span>
            <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-semibold text-[10px] tracking-wider">
              ≡ DRAG TO REORDER
            </span>
          </p>

          <div className="overflow-y-auto overflow-x-hidden pr-2 space-y-2 flex-1 scrollbar-thin">
            {localHabits.map((habit, index) => {
              let translateY = 0;
              const isDraggingAny = draggingIndex !== null;

              if (
                draggingIndex !== null &&
                dragOverIndex !== null &&
                draggingIndex !== index
              ) {
                if (
                  draggingIndex < dragOverIndex &&
                  index > draggingIndex &&
                  index <= dragOverIndex
                ) {
                  translateY = -1; // shift up
                } else if (
                  draggingIndex > dragOverIndex &&
                  index >= dragOverIndex &&
                  index < draggingIndex
                ) {
                  translateY = 1; // shift down
                }
              }

              const transformStyles =
                translateY === 0
                  ? "translateY(0px)"
                  : `translateY(calc(${translateY * 100}% + ${translateY * 8}px))`;
              const isDraggingThis = draggingIndex === index;

              return (
                <div
                  key={habit.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    transition:
                      isDraggingThis || !isDraggingAny
                        ? "none"
                        : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
                    transform: transformStyles,
                  }}
                  className="w-full card-bg cursor-grab active:cursor-grabbing rounded-xl px-4 py-3 flex justify-between items-center relative z-10"
                >
                  <div className="flex items-center gap-3 w-full pointer-events-none">
                    <div
                      className="text-gray-500 text-xl select-none px-1"
                      title="Drag to reorder"
                    >
                      ⠿
                    </div>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm font-medium text-gray-300 flex-1 select-none">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pointer-events-none">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold ${!habit.type || habit.type === "main" ? "bg-purple-500/20 text-purple-300" : "bg-gray-500/20 text-gray-300"}`}
                    >
                      {!habit.type || habit.type === "main" ? "M" : "S"}
                    </span>
                    <span
                      style={{ pointerEvents: "auto" }}
                      className="text-gray-500 hover:text-purple-400 transition-colors cursor-pointer p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(habit);
                        onClose();
                      }}
                    >
                      ✎
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Activity Detail Modal ───────────────────────────────
function ActivityDetailModal({ activity, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(activity?.notes || "");
  const [editing, setEditing] = useState(false);
  const { closing, triggerClose } = useCloseAnimation(onClose);

  if (!activity) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(activity.endDate) - new Date(TODAY_DATE)) / 86400000),
  );
  const totalDays =
    Math.ceil(
      (new Date(activity.endDate) - new Date(activity.startDate)) / 86400000,
    ) + 1;
  const elapsed =
    Math.ceil(
      (new Date(TODAY_DATE) - new Date(activity.startDate)) / 86400000,
    ) + 1;
  const progress = Math.min(
    100,
    Math.max(0, Math.round((elapsed / totalDays) * 100)),
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-t-3xl p-6 shadow-2xl">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: activity.color }}
              />
              <div>
                <h2 className="text-lg font-bold">{activity.title}</h2>
                <p className="text-xs text-gray-400">
                  {formatDateShort(activity.startDate)} →{" "}
                  {formatDateShort(activity.endDate)}
                </p>
              </div>
            </div>
            <button
              onClick={triggerClose}
              className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-purple-400 font-bold">
                {progress}% • {daysLeft}d tersisa
              </span>
            </div>
            <div className="w-full bg-[#2a2a35] h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: activity.color,
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 font-semibold mb-2 block">
              Catatan
            </label>
            {editing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors min-h-[80px] resize-none"
                placeholder="Tambah catatan..."
                autoFocus
              />
            ) : (
              <div
                onClick={() => setEditing(true)}
                className="w-full bg-[#2a2a35]/50 border border-[#3a3a45] rounded-xl px-4 py-3 text-sm cursor-pointer hover:border-gray-500 transition-colors min-h-[60px]"
              >
                {notes || (
                  <span className="text-gray-600 italic">
                    Tap untuk tambah catatan...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {editing ? (
              <button
                onClick={() => {
                  onUpdate({ ...activity, notes });
                  setEditing(false);
                }}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all"
              >
                💾 Simpan
              </button>
            ) : (
              <button
                onClick={() => {
                  onUpdate({ ...activity, completed: !activity.completed });
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activity.completed ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]"}`}
              >
                {activity.completed ? "✓ Selesai" : "○ Tandai Selesai"}
              </button>
            )}
            <button
              onClick={() => {
                onDelete(activity.id);
                triggerClose();
              }}
              className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add Calendar Activity Modal ─────────────────────────
function AddCalendarActivityModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(TODAY_DATE);
  const [endDate, setEndDate] = useState("2026-03-19");
  const [color, setColor] = useState(COLOR_OPTIONS[3].value);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const { closing, triggerClose } = useCloseAnimation(onClose);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Nama aktivitas harus diisi!");
      return;
    }
    if (endDate < startDate) {
      setError("Tanggal selesai harus setelah mulai!");
      return;
    }
    onAdd({
      id: uid(),
      title: title.trim(),
      startDate,
      endDate,
      color,
      notes: notes.trim(),
      completed: false,
    });
    setTitle("");
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-t-3xl p-6 shadow-2xl">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                Jadwal Baru
              </p>
              <h2 className="text-lg font-bold">Tambah Aktivitas</h2>
            </div>
            <button
              onClick={triggerClose}
              className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">
                Nama Aktivitas
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: Belajar Python"
                autoFocus
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors"
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">
                  Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">
                  Selesai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">
                Warna
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-lg transition-all duration-200 ${color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24] scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">
                Catatan (opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail aktivitas..."
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors min-h-[60px] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
            >
              📅 Simpan ke Kalender
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Calendar Modal (Gantt Timeline) ─────────────────────
function CalendarModal({ isOpen, onClose, calendarData, setCalendarData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const scrollRef = useRef(null);

  // Multi-month navigation
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH); // 0-indexed

  const daysInViewMonth = getDaysInMonth(viewYear, viewMonth);
  const isCurrentMonth =
    viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH;
  const todayDay = isCurrentMonth ? TODAY_DAY : null;

  const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const viewMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };
  const { closing, triggerClose } = useCloseAnimation(onClose);

  useEffect(() => {
    if (isOpen && scrollRef.current && todayDay && isCurrentMonth) {
      // Small timeout to ensure the DOM is fully rendered and dimensions are stable
      const timer = setTimeout(() => {
        const scrollPosition = (todayDay - 1) * 60;
        scrollRef.current.scrollTo({
          left: Math.max(0, scrollPosition - 120), // Position today with a bit of lead-in
          behavior: "smooth",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, todayDay, isCurrentMonth]);

  if (!isOpen) return null;

  const days = Array.from({ length: daysInViewMonth }, (_, i) => i + 1);

  // Filter activities that overlap with the viewed month
  const monthActivities = calendarData
    .filter((a) => {
      const startKey = dateToMonthKey(a.startDate);
      const endKey = dateToMonthKey(a.endDate);
      return startKey <= viewMonthKey && endKey >= viewMonthKey;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const handleAddActivity = (newActivity) => {
    const updated = [...calendarData, newActivity];
    setCalendarData(updated);
    db.saveCalendar(updated);
  };

  const handleUpdateActivity = (updated) => {
    const next = calendarData.map((a) => (a.id === updated.id ? updated : a));
    setCalendarData(next);
    db.saveCalendar(next);
    setSelectedActivity(updated);
  };

  const handleDeleteActivity = (id) => {
    const next = calendarData.filter((a) => a.id !== id);
    setCalendarData(next);
    db.saveCalendar(next);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 ${closing ? "animate-backdrop-out" : "animate-backdrop"}`}
        onClick={triggerClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div
          className="bg-[#1a1a24] border border-[#2a2a35] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#2a2a35] flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={goPrevMonth}
                className="w-8 h-8 rounded-lg bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all text-sm font-bold"
              >
                &lt;
              </button>
              <h2 className="text-lg font-bold">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={goNextMonth}
                className="w-8 h-8 rounded-lg bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all text-sm font-bold"
              >
                &gt;
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-2 rounded-lg bg-[#2a2a35] text-gray-300 text-xs font-bold hover:bg-purple-500/20 hover:text-purple-300 transition-all flex items-center gap-1.5"
              >
                <span>📅</span> TAMBAH AKTIVITAS
              </button>
              <button
                onClick={triggerClose}
                className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Timeline View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="overflow-x-auto scrollbar-thin" ref={scrollRef}>
              <div style={{ minWidth: `${daysInViewMonth * 65 + 10}px` }}>
                {/* Day columns header */}
                <div className="flex mb-4 border-b border-[#2a2a35] pb-3">
                  {days.map((d) => {
                    const isToday = d === todayDay;
                    const isPast = todayDay && d < todayDay;
                    return (
                      <div
                        key={d}
                        className={`w-[60px] flex-shrink-0 text-center flex flex-col items-center gap-0.5`}
                      >
                        <span
                          className={`text-[10px] font-medium ${isToday ? "text-purple-400" : isPast ? "text-gray-600" : "text-gray-600"}`}
                        >
                          {MONTH_NAMES[viewMonth].slice(0, 5)}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isToday
                            ? "border-2 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            : isPast
                              ? "text-gray-600"
                              : "text-gray-500"
                            }`}
                        >
                          {d}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Today marker line + Activity bars */}
                <div className="relative">
                  {todayDay && (
                    <div
                      className="absolute top-0 bottom-0"
                      style={{
                        left: `${(todayDay - 1) * 60 + 30}px`,
                        width: "2px",
                        background:
                          "linear-gradient(to bottom, rgba(168,85,247,0.5), transparent)",
                      }}
                    />
                  )}

                  {/* Activity bars */}
                  {monthActivities.length === 0 ? (
                    <div className="text-center py-16 text-gray-600 text-sm">
                      Belum ada aktivitas. Tap "TAMBAH AKTIVITAS" untuk memulai.
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {monthActivities.map((activity) => {
                        const startDay = Math.max(
                          1,
                          activity.startDate.startsWith(viewMonthKey)
                            ? dateToDayOfMonth(activity.startDate)
                            : 1,
                        );
                        const endDay = Math.min(
                          daysInViewMonth,
                          activity.endDate.startsWith(viewMonthKey)
                            ? dateToDayOfMonth(activity.endDate)
                            : daysInViewMonth,
                        );
                        const left = (startDay - 1) * 60;
                        const width = Math.max(
                          60,
                          (endDay - startDay + 1) * 60,
                        );

                        return (
                          <div key={activity.id} className="relative h-11">
                            <button
                              onClick={() => setSelectedActivity(activity)}
                              className="absolute h-10 rounded-xl flex items-center gap-2 px-3 text-xs font-bold text-white truncate hover:brightness-110 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
                              style={{
                                left: `${left}px`,
                                width: `${width}px`,
                                backgroundColor: activity.color,
                                opacity: activity.completed ? 0.5 : 1,
                                top: "0px",
                              }}
                              title={`${activity.title} (${formatDateShort(activity.startDate)} → ${formatDateShort(activity.endDate)})`}
                            >
                              {activity.completed && <span>✓</span>}
                              <span className="text-base">
                                {activity.icon || "📌"}
                              </span>
                              {activity.title}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity list under timeline */}
            {monthActivities.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Semua Aktivitas
                </h4>
                {monthActivities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedActivity(a)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${a.completed ? "bg-[#2a2a35]/30 opacity-60" : "bg-[#1a1a24] border border-[#2a2a35] hover:border-gray-600"}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: a.color }}
                    />
                    <div className="flex-1 text-left">
                      <p
                        className={`text-sm font-medium ${a.completed ? "line-through text-gray-500" : "text-white"}`}
                      >
                        {a.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatDateShort(a.startDate)} →{" "}
                        {formatDateShort(a.endDate)}
                      </p>
                    </div>
                    {a.notes && (
                      <span className="text-[10px] text-gray-600">📝</span>
                    )}
                    <span className="text-gray-600 text-xs">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <AddCalendarActivityModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddActivity}
      />
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onUpdate={handleUpdateActivity}
          onDelete={handleDeleteActivity}
        />
      )}
    </>
  );
}

// ── Upcoming Activities List ────────────────────────────
function UpcomingActivities({ calendarData, onOpenCalendar }) {
  const today_str = TODAY_DATE;
  const active = calendarData
    .filter((a) => a.endDate >= today_str && !a.completed)
    .map((a) => {
      const totalDays =
        Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / 86400000) + 1;
      const elapsed = Math.max(
        0,
        Math.ceil((new Date(today_str) - new Date(a.startDate)) / 86400000) + 1,
      );
      const progress = Math.min(
        100,
        Math.max(0, Math.round((elapsed / totalDays) * 100)),
      );
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(a.endDate) - new Date(today_str)) / 86400000),
      );
      return { ...a, progress, daysLeft };
    })
    .sort((a, b) => b.progress - a.progress) // most-elapsed first
    .slice(0, 4); // max 4

  if (active.length === 0) return null;

  return (
    <div className="card-bg rounded-2xl p-5 glow-hover transition-all">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <span>📋</span> Aktivitas Mendatang
        </h3>
        <button
          onClick={onOpenCalendar}
          className="text-xs text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded hover:bg-purple-400/20 transition-colors"
        >
          Lihat Semua
        </button>
      </div>
      <div className="space-y-2">
        {active.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a35]/30 transition-colors cursor-pointer"
            onClick={onOpenCalendar}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate flex-1">
                  {a.title}
                </p>
                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0 font-semibold">
                  {a.progress}%
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-[#2a2a35] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${a.progress}%`,
                      backgroundColor: a.color,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {a.daysLeft}d lagi
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Yesterday's Sins Card ───────────────────────────────
function YesterdaysSins({ failures }) {
  if (!failures || failures.length === 0) return null;
  const f = failures[0]; // Show most recent failure
  return (
    <div
      className="relative rounded-2xl p-4 card-bg overflow-hidden mb-4"
      style={{
        borderColor: "rgba(239,68,68,0.35)",
        boxShadow:
          "0 0 20px rgba(239,68,68,0.12), inset 0 0 30px rgba(239,68,68,0.04)",
      }}
    >
      {/* Glow pulse */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-20 blur-md pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.4) 0%, transparent 70%)",
          animation: "pulseGlow 3s ease-in-out infinite",
        }}
      />
      <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-2 relative">
        🔥 EVALUASI KEMARIN
      </p>
      <p className="text-sm text-gray-200 leading-relaxed relative">
        ⚠️ Lo gagal{" "}
        <span className="text-orange-300 font-semibold">{f.habit}</span>
        {f.reason && f.reason !== "Tidak ada alasan." && (
          <>
            {" "}
            karena "<span className="italic text-gray-300">{f.reason}</span>"
          </>
        )}
        . Hari ini mau ngulangin kesalahan yang sama?
      </p>
    </div>
  );
}

// ── Monthly Tracker Grid ────────────────────────────────
function MonthlyTracker({
  trackingData,
  setTrackingData,
  today,
  habitsList,
  failureData = [],
  viewYear = CURRENT_YEAR,
  viewMonth = CURRENT_MONTH,
  missedNotes = {},
}) {
  const scrollRef = useRef(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const isCurrentMonth =
    viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const days = daysArray;

  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollRef.current && isCurrentMonth) {
      const container = scrollRef.current;
      const todayCol = scrollRef.current.querySelector(`[data-day="${today}"]`);
      if (todayCol) {
        // Center the active column roughly
        const scrollAmount =
          todayCol.offsetLeft -
          container.clientWidth / 2 +
          todayCol.clientWidth / 2;
        container.scrollTo({
          left: Math.max(0, scrollAmount),
          behavior: "smooth",
        });
      }
    }
  }, [today, isCurrentMonth]);

  const toggleDay = (habitName, day) => {
    if (!setTrackingData) return; // read-only mode (Analisis tab)
    if (isCurrentMonth && day > today) return; // Can't mark future days

    const trackKey = getTrackKey(habitName, viewYear, viewMonth);

    setTrackingData((prev) => {
      const next = { ...prev };
      if (!next[trackKey]) next[trackKey] = {};
      next[trackKey] = { ...next[trackKey] };
      next[trackKey][day] = next[trackKey][day] === 1 ? 0 : 1;
      db.saveTrackingData(next);
      return next;
    });
  };

  // Calculate daily totals
  const totals = days.map((day) => {
    if (isCurrentMonth && day > today) return null;
    return habitsList.reduce(
      (sum, h) =>
        sum +
        (trackingData[getTrackKey(h.name, viewYear, viewMonth)]?.[day] === 1
          ? 1
          : 0),
      0,
    );
  });

  return (
    <div className="card-bg rounded-2xl p-5 glow-hover transition-all mt-4">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <span>📅</span> {getMonthName(viewMonth)} {viewYear}
      </h3>

      <div className="overflow-x-auto scrollbar-thin" ref={scrollRef}>
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#1a1a24] text-left text-[11px] text-purple-400 font-bold uppercase tracking-wide py-2 px-3 min-w-[120px]">
                SENJATA
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  data-day={d}
                  className={`text-[11px] font-semibold py-2 px-1.5 min-w-[30px] ${isCurrentMonth && d === today
                    ? "text-purple-400 bg-purple-500/10 rounded-t-lg"
                    : isCurrentMonth && d > today
                      ? "text-[#2a2a35]" // Future days in current month dim
                      : "text-gray-500" // Past days or past months solid
                    }`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habitsList.map((habit) => (
              <tr key={habit.name} className="group">
                <td className="sticky left-0 z-10 bg-[#1a1a24] py-1.5 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span
                      className="text-[11px] text-gray-300 truncate max-w-[80px]"
                      title={habit.name}
                    >
                      {habit.name}
                    </span>
                    <span
                      className={`text-[8px] px-1 rounded ${!habit.type || habit.type === "main" ? "bg-purple-500/20 text-purple-300" : "bg-gray-500/20 text-gray-300"}`}
                    >
                      {!habit.type || habit.type === "main" ? "M" : "S"}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const trackKey = getTrackKey(habit.name, viewYear, viewMonth);
                  const val = trackingData[trackKey]?.[day];
                  const isFuture = isCurrentMonth && day > today;
                  const isToday = isCurrentMonth && day === today;
                  return (
                    <td
                      key={day}
                      className={`py-1.5 px-1 text-center ${isToday ? "bg-purple-500/10" : ""} relative`}
                    >
                      {isFuture ? (
                        <span className="text-gray-700 text-[10px]">·</span>
                      ) : (
                        (() => {
                          // Read per-day notes for tooltip
                          const note = missedNotes[String(day)]?.[habit.name] || "";
                          const isFailed = val !== 1;
                          return (
                            <span className="relative group/cell inline-block">
                              <button
                                onClick={() => toggleDay(habit.name, day)}
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold transition-all duration-200 hover:scale-125 ${val === 1
                                  ? "bg-green-500/15 text-green-400"
                                  : "bg-red-500/15 text-red-400"
                                  }`}
                              >
                                {val === 1 ? "✓" : "✗"}
                              </button>
                              {isFailed && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover/cell:opacity-100 transition-opacity duration-150 w-max max-w-[160px]">
                                  <div className="bg-[#1a1a24] border border-red-500/25 rounded-lg px-2.5 py-1.5 text-[10px] text-left shadow-xl">
                                    <p className="text-red-400 font-semibold mb-0.5">
                                      Hari {day} — Gagal
                                    </p>
                                    <p className="text-gray-400 italic leading-snug">
                                      {note || "Tidak ada catatan"}
                                    </p>
                                  </div>
                                  <div className="w-2 h-2 bg-[#1a1a24] border-r border-b border-red-500/25 rotate-45 mx-auto -mt-1" />
                                </div>
                              )}
                            </span>
                          );
                        })()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* TOTAL row */}
            <tr className="border-t border-[#2a2a35]">
              <td className="sticky left-0 z-10 bg-[#1a1a24] py-2 px-3">
                <span className="text-[11px] text-purple-400 font-bold">
                  TOTAL
                </span>
              </td>
              {totals.map((t, i) => (
                <td
                  key={i}
                  className={`py-2 px-1 text-center text-[11px] font-bold ${isCurrentMonth && i + 1 === today
                    ? "bg-purple-500/10 text-purple-400"
                    : t === null
                      ? "text-[#2a2a35]"
                      : "text-purple-400"
                    }`}
                >
                  {t === null ? "·" : t}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState("Tracker");
  const [yesterdayFailures] = useState([
    {
      habit: "Ga begadang 🔥",
      reason: "Kecapekan setelah ngoding sampai malam",
    },
  ]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // Renamed from showAddActivity
  const [editingHabit, setEditingHabit] = useState(null); // New state for editing
  const [showEditListModal, setShowEditListModal] = useState(false); // Modal to select which activity to edit
  const [showCalendar, setShowCalendar] = useState(false);

  // Analisis Month Navigation
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH); // 0-indexed
  const isCurrentMonthView =
    viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH;

  const [habitsList, setHabitsList] = useState([]);
  const [trackingData, setTrackingData] = useState({});

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };
  const [calendarData, setCalendarData] = useState([]);
  const [todaySleep, setTodaySleep] = useState(6.5);
  const [showMoreHabits, setShowMoreHabits] = useState(false);
  const rateRef = useRef(null);
  const [showAllRates, setShowAllRates] = useState(false);

  // Missed habit popup state
  const [missedPopup, setMissedPopup] = useState(null); // { habits: [{name, color}], notes: {}, dayNum: number } | null
  const [missedNotes, setMissedNotes] = useState({});
  const [closingMissed, setClosingMissed] = useState(false);
  const triggerCloseMissed = useCallback(() => {
    setClosingMissed(true);
    setTimeout(() => {
      setClosingMissed(false);
      setMissedPopup(null);
    }, 250);
  }, []);

  // Sleep log per day (keyed by day number) for monthly analysis
  const [sleepLog, setSleepLog] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all data from Supabase on mount
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      const [habits, tracking, calendar, sleep, missed] = await Promise.all([
        db.loadHabits(),
        db.loadTrackingData(),
        db.loadCalendar(),
        db.loadSleepLog(),
        db.loadMissedNotes(),
      ]);
      setHabitsList(habits);
      setTrackingData(tracking);
      setCalendarData(calendar);
      setSleepLog(sleep);
      setMissedNotes(missed);
      setLoading(false);
    }
    loadAllData();
  }, []);
  const handleSleepChange = (val) => {
    setTodaySleep(val);
    setSleepLog((prev) => {
      const next = { ...prev, [today]: val };
      db.saveSleepLog(next);
      return next;
    });
  };

  // Reactive today — updates if the system clock crosses midnight
  const [today, setToday] = useState(TODAY_DAY);
  useEffect(() => {
    const id = setInterval(() => {
      const nowDay = new Date().getDate();
      if (nowDay !== today) setToday(nowDay);
    }, 30_000); // check every 30 seconds
    return () => clearInterval(id);
  }, [today]);

  // Check for missed habits from yesterday on mount
  useEffect(() => {
    const yesterday = today - 1;
    if (yesterday < 1) return;
    const alreadyShown = sessionStorage.getItem("missedPopupShown");
    if (alreadyShown) return;
    const missed = habitsList.filter((h) => {
      const trackKey = getTrackKey(h.name, CURRENT_YEAR, CURRENT_MONTH);
      const val = trackingData[trackKey]?.[yesterday];
      return val !== 1; // not done yesterday
    });
    if (missed.length > 0) {
      setMissedPopup({ habits: missed, dayNum: yesterday });
      sessionStorage.setItem("missedPopupShown", "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add or Edit an activity
  const handleSaveActivity = (newHabit, oldName = null) => {
    let updated;
    if (oldName) {
      // Editing existing habit
      updated = habitsList.map((h) =>
        h.name === oldName ? { ...h, ...newHabit } : h,
      );
      setHabitsList(updated);
      db.saveHabits(updated);

      // If name changed, migrate tracking data
      if (oldName !== newHabit.name) {
        setTrackingData((prev) => {
          const trackKey = getTrackKey(oldName);
          const newTrackKey = getTrackKey(newHabit.name);
          const oldData = prev[trackKey] || {};
          const next = { ...prev };
          delete next[trackKey];
          next[newTrackKey] = oldData;
          db.saveTrackingData(next);
          return next;
        });
      }
    } else {
      // Adding new habit
      updated = [...habitsList, { ...newHabit, isDefault: false }];
      setHabitsList(updated);
      db.saveHabits(updated);
      setTrackingData((prev) => {
        const next = { ...prev };
        next[getTrackKey(newHabit.name)] = {};
        db.saveTrackingData(next);
        return next;
      });
    }
  };

  // Keep state synced when habits load or update
  // Save manual reorder from EditListModal
  const handleReorderHabits = (newOrder) => {
    setHabitsList([...newOrder]);
    db.saveHabits(newOrder);
  };

  const handleDeleteActivity = (habitName) => {
    const updated = habitsList.filter((h) => h.name !== habitName);
    setHabitsList(updated);
    db.saveHabits(updated);
    // Optionally cleanup tracking log
    setTrackingData((prev) => {
      const next = { ...prev };
      delete next[habitName];
      db.saveTrackingData(next);
      return next;
    });
  };

  // Data Grafik Progres Tempur – include all habits
  const progressData = Array.from({ length: today }, (_, i) => {
    const day = i + 1;
    const score = habitsList.reduce(
      (sum, h) => sum + (trackingData[h.name]?.[day] === 1 ? 1 : 0),
      0,
    );
    return { day, score };
  });

  // Data Habit Rate Bulanan – computed from tracking data
  const computeHabitStats = (h) => {
    let done = 0;
    const failedDays = [];
    for (let d = 1; d <= today; d++) {
      const val = trackingData[h.name]?.[d];
      if (val === 1) done++;
      else if (d < today) failedDays.push(d); // days in the past where not done
    }
    const pct = today > 0 ? Math.round((done / today) * 100) : 0;
    return {
      name: h.name,
      color: h.color,
      isDefault: h.isDefault,
      type: h.type,
      score: `${done}/${today}`,
      percentage: `${pct}%`,
      trend: pct >= 50 ? `+${pct - 24}%` : `-${24 - pct}%`,
      isUp: pct >= 50,
      failedDays, // array of day numbers where habit was not done
    };
  };
  const allHabitStats = habitsList.map(computeHabitStats);
  const habits = allHabitStats;

  // Overall rate – all habits
  const totalDone = habitsList.reduce((sum, h) => {
    let d = 0;
    for (let day = 1; day <= today; day++) {
      if (trackingData[h.name]?.[day] === 1) d++;
    }
    return sum + d;
  }, 0);
  const totalPossible = habitsList.length * today;
  const overallPct =
    totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // Today's score – all habits
  const todayScore = habitsList.reduce(
    (s, h) => s + (trackingData[h.name]?.[today] === 1 ? 1 : 0),
    0,
  );

  // Best streak – all habits
  let bestStreak = 0,
    currentStreak = 0;
  for (let d = 1; d <= today; d++) {
    const allDone = habitsList.every(
      (h) =>
        trackingData[getTrackKey(h.name, CURRENT_YEAR, CURRENT_MONTH)]?.[d] ===
        1,
    );
    if (allDone) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Calculate generic todays completed count for the floating pill
  const currentTodayDoneCount = habitsList.filter(
    (h) =>
      trackingData[getTrackKey(h.name, CURRENT_YEAR, CURRENT_MONTH)]?.[
      today
      ] === 1,
  ).length;

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-[#0f0f13]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative pb-24 min-h-screen">
      {/* Top Header */}
      <header className="flex justify-between items-center p-5 sticky top-0 bg-[#0f0f13]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-purple-400 transition-colors">
            ←
          </button>
          <div>
            <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
              Daily Weapon
            </p>
            <h1 className="text-xl font-bold">Senjata Habit</h1>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowEditListModal(true)}
            className="w-8 h-8 rounded-full card-bg flex items-center justify-center hover:border-purple-400 text-gray-400 transition-colors hover:scale-110"
            title="Edit Aktivitas"
          >
            ✎
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="w-8 h-8 rounded-full card-bg flex items-center justify-center hover:border-purple-400 text-gray-400 transition-colors hover:scale-110"
            title="Kalender"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <text
                x="12"
                y="17"
                textAnchor="middle"
                fontSize="11"
                strokeWidth="0"
                fill="currentColor"
                fontWeight="bold"
              >
                17
              </text>
            </svg>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingHabit(null);
            }} // Open add modal, clear editing state
            className="w-8 h-8 rounded-full bg-purple-400/20 text-purple-400 flex items-center justify-center hover:bg-purple-400/40 transition-colors hover:scale-110"
            title="Tambah aktivitas baru"
          >
            +
          </button>
        </div>
      </header>

      <div className="px-4 space-y-4 pt-2">
        {/* Tabs */}
        <div className="flex p-1 card-bg rounded-xl">
          <button
            onClick={() => setActiveTab("Tracker")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "Tracker" ? "bg-[#2a2a35] text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Tracker
          </button>
          <button
            onClick={() => setActiveTab("Analisis")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "Analisis" ? "bg-[#2a2a35] text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Analisis
          </button>
        </div>

        {/* Tracker Tab */}
        {activeTab === "Tracker" && (
          <div className="animate-fade-in">
            <TrackerTab
              habitsList={habitsList}
              trackingData={trackingData}
              setTrackingData={setTrackingData}
              saveTrackingData={db.saveTrackingData}
              today={today}
              onSleepChange={handleSleepChange}
              viewYear={CURRENT_YEAR}
              viewMonth={CURRENT_MONTH}
              getTrackKey={getTrackKey}
            />
            <div className="mt-4">
              <UpcomingActivities
                calendarData={calendarData}
                onOpenCalendar={() => setShowCalendar(true)}
              />
            </div>
          </div>
        )}

        {/* ── ANALISIS TAB CONTENT ── */}
        {activeTab === "Analisis" && (
          <div className="animate-fade-in space-y-6">
            {/* Month Selector */}
            <div className="card-bg rounded-2xl p-4 flex justify-between items-center transition-all hover:border-gray-600">
              <button
                onClick={goPrevMonth}
                className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center hover:bg-purple-500/20 transition-colors"
              >
                &lt;
              </button>
              <span
                className="font-bold text-md cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => {
                  setViewYear(CURRENT_YEAR);
                  setViewMonth(CURRENT_MONTH);
                }}
              >
                {getMonthName(viewMonth)} {viewYear}
              </span>
              <button
                onClick={goNextMonth}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCurrentMonthView ? "bg-[#1a1a24] text-gray-600 cursor-not-allowed" : "bg-[#2a2a35] hover:bg-purple-500/20"}`}
              >
                &gt;
              </button>
            </div>

            {/* Independent Evaluasi Kemarin Box */}
            <YesterdaysSins failures={yesterdayFailures} />

            {/* 4-Grid Stats – now dynamic */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card-bg rounded-2xl p-4 transition-all glow-hover">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-400">🔥</span>
                  <h3 className="text-xs font-semibold text-gray-400">
                    Streak Terbaik
                  </h3>
                </div>
                <p className="text-2xl font-bold">{bestStreak}d</p>
              </div>
              <div className="card-bg rounded-2xl p-4 transition-all glow-hover">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400">🔓</span>
                  <h3 className="text-xs font-semibold text-gray-400">
                    21-Day Locked
                  </h3>
                </div>
                <p className="text-2xl font-bold">0/{habitsList.length}</p>
              </div>
              <div className="card-bg rounded-2xl p-4 transition-all glow-hover">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400">🎯</span>
                  <h3 className="text-xs font-semibold text-gray-400">
                    Skor Hari Ini
                  </h3>
                </div>
                <p className="text-2xl font-bold">
                  {todayScore}/{habitsList.length}
                </p>
              </div>
              <div className="card-bg rounded-2xl p-4 transition-all glow-hover">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400">📅</span>
                  <h3 className="text-xs font-semibold text-gray-400">
                    Rate Bulanan
                  </h3>
                </div>
                <p className="text-2xl font-bold">{overallPct}%</p>
              </div>
            </div>

            {/* Rate Bulanan List */}
            <div className="card-bg rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="text-purple-400">📈</span> Rate Bulanan
                </h3>
                <span className="text-xs text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded">
                  {overallPct >= 24 ? "▲" : "▼"} {overallPct >= 24 ? "+" : ""}
                  {overallPct - 24}%
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold">Overall</span>
                  <span className="text-purple-400 font-bold">
                    {overallPct}%{" "}
                    <span className="text-gray-500 font-normal">
                      ({totalDone}/{totalPossible})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-[#2a2a35] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${overallPct}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  vs bulan lalu: 24%{" "}
                  <span className="text-purple-400">▲ +{overallPct - 24}%</span>
                </p>
              </div>

              {/* Main habits — mapped from user's manual sort order */}
              {(() => {
                // Build a flattened per-habit note map from all saved days
                const missedNotesByHabit = {};
                Object.entries(missedNotes).forEach(([, dayObj]) => {
                  if (dayObj && typeof dayObj === "object") {
                    Object.entries(dayObj).forEach(([hName, reason]) => {
                      if (hName !== "__sleep__" && reason) {
                        missedNotesByHabit[hName] = missedNotesByHabit[hName]
                          ? missedNotesByHabit[hName] + " / " + reason
                          : reason;
                      }
                    });
                  }
                });

                // Map the stats onto the user's specific habitsList order, filtering for M-type only
                const displayHabits = habitsList
                  .filter((lh) => lh.type === "main" || !lh.type)
                  .map((lh) => habits.find((h) => h.name === lh.name))
                  .filter(Boolean); // safety check

                return (
                  <div className="relative">
                    <div
                      ref={rateRef}
                      style={{
                        maxHeight: showAllRates
                          ? `${rateRef.current?.scrollHeight || 1000}px`
                          : "240px",
                      }}
                      className="rate-container overflow-hidden transition-all duration-500 ease-in-out"
                    >
                      <div className="space-y-5 pb-4">
                        {displayHabits.map((habit) => (
                          <div key={habit.name} className="group">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: habit.color }}
                                ></div>
                                <span className="text-sm font-medium group-hover:text-white text-gray-300 transition-colors truncate max-w-[150px]">
                                  {habit.name}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold ${!habit.type || habit.type === "main" ? "bg-purple-500/20 text-purple-300" : "bg-gray-500/20 text-gray-300"}`}
                                >
                                  {!habit.type || habit.type === "main"
                                    ? "M"
                                    : "S"}
                                </span>
                              </div>
                              <div className="text-xs font-medium flex items-center gap-2">
                                <div className="text-gray-400">
                                  <span className="mr-2">{habit.score}</span>
                                  <span style={{ color: habit.color }}>
                                    ({habit.percentage})
                                  </span>
                                  <span
                                    className={`ml-2 ${habit.isUp ? "text-purple-400" : "text-red-400"}`}
                                  >
                                    {habit.isUp ? "▲" : "▼"} {habit.trend}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex-1 bg-[#2a2a35] h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: habit.percentage,
                                    backgroundColor: habit.color,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 h-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                <svg
                                  viewBox="0 0 100 30"
                                  className="w-full h-full"
                                >
                                  <polyline
                                    fill="none"
                                    stroke={habit.color}
                                    strokeWidth="3"
                                    points={
                                      habit.isUp
                                        ? "0,25 20,25 40,25 60,20 80,10 100,0"
                                        : "0,20 20,20 40,20 60,25 80,0 100,25"
                                    }
                                  />
                                  <circle
                                    cx="100"
                                    cy={habit.isUp ? "0" : "25"}
                                    r="4"
                                    fill={habit.color}
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gradient Blur Overlay & Toggle Button */}
                    {!showAllRates && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a24] to-transparent pointer-events-none flex items-end justify-center pb-2">
                        <button
                          onClick={() => setShowAllRates(true)}
                          className="pointer-events-auto px-4 py-2 bg-[#2a2a35]/80 backdrop-blur-md border border-[#3a3a45] rounded-full text-xs font-bold text-white shadow-lg hover:bg-purple-500/20 hover:border-purple-500/50 transition-all focus:outline-none"
                        >
                          Lihat Lebih Banyak ▼
                        </button>
                      </div>
                    )}
                    {showAllRates && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllRates(false)}
                          className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors focus:outline-none"
                        >
                          Sembunyikan ▲
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Add-on / Side habits (collapsible) */}
              {(() => {
                const addOnHabits = habitsList
                  .filter((lh) => lh.type === "side")
                  .map((lh) => habits.find((h) => h.name === lh.name))
                  .filter(Boolean);

                if (addOnHabits.length === 0) return null;

                return (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowMoreHabits((v) => !v)}
                      className="w-full py-2 rounded-xl text-xs text-gray-500 border border-dashed border-[#2a2a35] hover:border-gray-600 hover:text-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      {showMoreHabits
                        ? "▲ Tutup Tambahan"
                        : `▼ Lihat Tambahannya (${addOnHabits.length} aktivitas)`}
                    </button>
                    {showMoreHabits && (
                      <div className="space-y-5 mt-4">
                        {addOnHabits.map((habit, idx) => (
                          <div
                            key={idx}
                            className="group cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: habit.color }}
                                ></div>
                                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                  {habit.name}
                                </span>
                                <span className="text-[10px] bg-[#2a2a35] text-gray-500 px-1.5 py-0.5 rounded">
                                  S
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {habit.score} ({habit.percentage})
                              </span>
                            </div>
                            <div className="flex-1 bg-[#2a2a35] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: habit.percentage,
                                  backgroundColor: habit.color,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Progres Tempur Chart */}
            <div className="card-bg rounded-2xl p-5 glow-hover transition-all">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </span>{" "}
                Progres Tempur
              </h3>
              <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2a2a35"
                      vertical={true}
                      horizontal={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#4b5563"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#4b5563"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      domain={[0, 9]}
                      ticks={[0, 3, 6, 9]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a24",
                        borderColor: "#2a2a35",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#c084fc" }}
                    />
                    <Line
                      type="linear"
                      dataKey="score"
                      stroke="#c084fc"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#c084fc" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Analysis */}
            {(() => {
              const allEntries = Array.from(
                { length: today },
                (_, i) => sleepLog[i + 1] ?? null,
              ).filter((v) => v !== null);
              const avg =
                allEntries.length > 0
                  ? (
                    allEntries.reduce((a, b) => a + b, 0) / allEntries.length
                  ).toFixed(1)
                  : "—";
              const good = allEntries.filter((v) => v >= 7).length;
              const med = allEntries.filter((v) => v >= 5 && v < 7).length;
              const bad = allEntries.filter((v) => v < 5).length;
              const total = allEntries.length || 1;
              return (
                <div className="card-bg rounded-2xl p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span>🌙</span> Analisis Tidur Bulanan
                  </h3>
                  <div className="flex items-end gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Rata-rata / Malam
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{
                          color:
                            parseFloat(avg) >= 7
                              ? "#22c55e"
                              : parseFloat(avg) >= 5
                                ? "#eab308"
                                : "#ef4444",
                        }}
                      >
                        {avg}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          jam
                        </span>
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        Distribusi ({allEntries.length} malam)
                      </p>
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        <div
                          className="bg-green-500 rounded-l-full transition-all"
                          style={{ width: `${(good / total) * 100}%` }}
                          title={`Cukup: ${good} malam`}
                        />
                        <div
                          className="bg-yellow-500 transition-all"
                          style={{ width: `${(med / total) * 100}%` }}
                          title={`Kurang: ${med} malam`}
                        />
                        <div
                          className="bg-red-500 rounded-r-full transition-all"
                          style={{ width: `${(bad / total) * 100}%` }}
                          title={`Buruk: ${bad} malam`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                        <span className="text-green-400">{good} cukup</span>
                        <span className="text-yellow-400">{med} kurang</span>
                        <span className="text-red-400">{bad} buruk</span>
                      </div>
                    </div>
                  </div>
                  {/* By-day mini bars */}
                  <div className="flex gap-0.5 items-end h-8">
                    {Array.from({ length: today }, (_, i) => {
                      const v = sleepLog[i + 1];
                      const h = v ? Math.min(100, (v / 10) * 100) : 0;
                      const c = !v
                        ? "#2a2a35"
                        : v >= 7
                          ? "#22c55e"
                          : v >= 5
                            ? "#eab308"
                            : "#ef4444";
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all"
                          style={{ height: `${h || 10}%`, backgroundColor: c }}
                          title={v ? `${i + 1} Mar: ${v}h` : `${i + 1} Mar: ?`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Hari 1 → {today} Maret 2026
                  </p>
                </div>
              );
            })()}

            {/* Riwayat Kebiasaan - Editable history table */}
            {(() => {
              const isCurrentMV = viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH;
              const maxDay = isCurrentMV ? today : getDaysInMonth(viewYear, viewMonth);
              const days = Array.from({ length: maxDay }, (_, i) => i + 1);
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

              const toggleDay = (habitName, day) => {
                const key = getTrackKey(habitName, viewYear, viewMonth);
                setTrackingData((prev) => {
                  const cur = prev[key]?.[day] === 1 ? 0 : 1;
                  const next = { ...prev, [key]: { ...(prev[key] || {}), [day]: cur } };
                  db.saveTrackingData(next);
                  return next;
                });
              };

              return (
                <div className="card-bg rounded-2xl p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span>📋</span> Riwayat Kebiasaan{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      {monthNames[viewMonth]} {viewYear}
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse" style={{ minWidth: `${maxDay * 32 + 120}px` }}>
                      <thead>
                        <tr>
                          <th className="text-left text-gray-500 font-medium py-1.5 pr-3 sticky left-0 bg-[#1a1a24] z-10 min-w-[110px]">Habit</th>
                          {days.map((d) => (
                            <th
                              key={d}
                              className={`text-center font-semibold py-1.5 px-0.5 min-w-[28px] ${isCurrentMV && d === today
                                  ? "text-purple-400"
                                  : "text-gray-500"
                                }`}
                            >
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {habitsList.map((h) => {
                          const key = getTrackKey(h.name, viewYear, viewMonth);
                          return (
                            <tr key={h.name} className="border-t border-white/5">
                              <td
                                className="py-1.5 pr-3 font-medium truncate sticky left-0 bg-[#1a1a24] z-10 max-w-[110px]"
                                style={{ color: h.color }}
                                title={h.name}
                              >
                                {h.name}
                              </td>
                              {days.map((d) => {
                                const val = trackingData[key]?.[d];
                                const isDone = val === 1;
                                const isFuture = isCurrentMV && d > today;
                                return (
                                  <td key={d} className="text-center py-1">
                                    <button
                                      onClick={() => !isFuture && toggleDay(h.name, d)}
                                      disabled={isFuture}
                                      className={`w-6 h-6 rounded text-[11px] transition-all ${isFuture
                                          ? "opacity-20 cursor-not-allowed bg-[#2a2a35]"
                                          : isDone
                                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        }`}
                                      title={`${h.name} – Hari ${d}: ${isDone ? "Done" : "Missed"}`}
                                    >
                                      {isFuture ? "·" : isDone ? "✓" : "✗"}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">Tap ✓/✗ untuk ubah status hari sebelumnya</p>
                </div>
              );
            })()}

            {/* Monthly Tracker Grid – read-only in Analisis tab */}
            <MonthlyTracker
              trackingData={trackingData}
              setTrackingData={null}
              today={today}
              habitsList={habitsList}
              failureData={yesterdayFailures}
              viewYear={viewYear}
              viewMonth={viewMonth}
              missedNotes={missedNotes}
            />
          </div>
        )}
      </div>

      {/* Floating HABITS progress pill (Bottom Right) */}
      <button
        onClick={() => setShowCheckIn(true)}
        className="fixed bottom-24 right-5 z-40 bg-purple-200/90 backdrop-blur-sm rounded-full shadow-[0_8px_16px_rgba(168,85,247,0.3)] flex items-center gap-3 px-1.5 py-1.5 hover:scale-105 transition-transform"
        title="Check-in hari ini"
      >
        <div className="w-8 h-8 rounded-full border-[2.5px] border-white flex justify-center items-center bg-purple-500 shadow-inner flex-shrink-0">
          <span className="text-white text-[11px] font-bold tracking-tighter">
            {currentTodayDoneCount}/{habitsList.length}
          </span>
        </div>
        <span className="text-purple-900 text-sm font-bold pr-3 uppercase">
          Habits
        </span>
      </button>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        trackingData={trackingData}
        setTrackingData={setTrackingData}
        today={today}
        habitsList={habitsList}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddModal}
        initialData={editingHabit}
        onClose={() => {
          setShowAddModal(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />

      {/* Select Edit Activity Modal */}
      <EditListModal
        isOpen={showEditListModal}
        onClose={() => setShowEditListModal(false)}
        habitsList={habitsList}
        onSelect={(habit) => {
          setEditingHabit(habit);
          setShowAddModal(true);
        }}
        onReorder={handleReorderHabits}
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        calendarData={calendarData}
        setCalendarData={setCalendarData}
      />

      {/* Missed Habits Popup */}
      {missedPopup && (
        <>
          <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] ${closingMissed ? "animate-backdrop-out" : "animate-backdrop"}`}
            onClick={triggerCloseMissed}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-[80] max-w-md mx-auto ${closingMissed ? "animate-slide-down" : "animate-slide-up"}`}
          >
            <div className="bg-[#1a1a24] border border-orange-500/30 rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-lg font-bold text-orange-400">
                  Evaluasi Kemarin
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">
                Kemarin (hari ke-{missedPopup.dayNum}) lo belum selesaikan{" "}
                {missedPopup.habits.length} habit. Tulis alasan atau skip.
              </p>
              <div className="space-y-4 mb-5">
                {missedPopup.habits.map((h) => (
                  <div key={h.name} className="bg-[#2a2a35] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="text-sm font-semibold text-white">
                        {h.name}
                      </span>
                    </div>
                    <textarea
                      value={missedNotes[h.name] || ""}
                      onChange={(e) =>
                        setMissedNotes((prev) => ({
                          ...prev,
                          [h.name]: e.target.value,
                        }))
                      }
                      placeholder="Alasan (opsional, bisa skip)..."
                      className="w-full bg-[#1a1a24] border border-[#3a3a45] focus:border-orange-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none resize-none min-h-[60px]"
                    />
                  </div>
                ))}

                {/* Sleep-under-5 section */}
                {(() => {
                  const yesterdaySleep = sleepLog[missedPopup.dayNum];
                  if (!yesterdaySleep || yesterdaySleep >= 5) return null;
                  return (
                    <div className="bg-indigo-900/20 border border-indigo-500/25 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span>🌙</span>
                        <span className="text-sm font-semibold text-indigo-300">
                          Tidur Cuma {yesterdaySleep}h — Kenapa?
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">
                        Tidur kurang dari 5 jam kemarin. Tulis alasannya biar lo
                        bisa evaluasi.
                      </p>
                      <textarea
                        value={missedNotes["__sleep__"] || ""}
                        onChange={(e) =>
                          setMissedNotes((prev) => ({
                            ...prev,
                            __sleep__: e.target.value,
                          }))
                        }
                        placeholder="Misal: begadang, stress, kecapekan..."
                        className="w-full bg-[#1a1a24] border border-indigo-500/20 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none resize-none min-h-[60px]"
                      />
                    </div>
                  );
                })()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={triggerCloseMissed}
                  className="flex-1 py-3 rounded-xl bg-[#2a2a35] text-gray-400 text-sm font-semibold hover:bg-[#3a3a45] transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={async () => {
                    // Save notes per-day: { [dayNum]: { habitName: reason, __sleep__: reason } }
                    try {
                      const existing = await db.loadMissedNotes();
                      const dayKey = String(missedPopup.dayNum);
                      const dayNotes = {};
                      missedPopup.habits.forEach((h) => {
                        dayNotes[h.name] = missedNotes[h.name] || "";
                      });
                      if (missedNotes["__sleep__"])
                        dayNotes["__sleep__"] = missedNotes["__sleep__"];
                      existing[dayKey] = dayNotes;
                      await db.saveMissedNotes(existing);
                    } catch { }
                    triggerCloseMissed();
                  }}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-orange-500/20"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0f0f13] border-t border-[#2a2a35] px-6 py-3 flex justify-between items-center z-40">
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <span className="text-xl">⊞</span>
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <span className="text-xl">💼</span>
          <span className="text-[10px]">Wallet</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-purple-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          <span className="text-[10px] font-semibold mt-0.5">Growth</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <span className="text-xl">•••</span>
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
