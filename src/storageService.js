// ── localStorage-based persistence for Senjata Habit Tracker ──

const HABITS_KEY = 'senjata-habit-list';
const TRACKING_KEY = 'senjata-habit-tracker';
const CALENDAR_KEY = 'senjata-calendar';
const MISSED_KEY = 'senjata-missed';
const SLEEP_KEY = 'senjata-sleep-log';

const DEFAULT_HABITS = [
  { name: 'Ga tdur pagi', color: '#ef4444', isDefault: true, type: 'main' },
  { name: 'Ga begadang 🔥', color: '#ef4444', isDefault: true, type: 'main' },
  { name: 'Belajar KREFA', color: '#22c55e', isDefault: true, type: 'main' },
  { name: 'Olahraga', color: '#ec4899', isDefault: true, type: 'main' },
  { name: "Muraja'ah Al-Qur'an", color: '#a855f7', isDefault: true, type: 'main' },
  { name: "Tilawah Al-Qur'an", color: '#3b82f6', isDefault: true, type: 'main' },
  { name: 'Journaling', color: '#eab308', isDefault: true, type: 'main' },
  { name: 'Post konten', color: '#ef4444', isDefault: true, type: 'main' },
  { name: 'Baca buku/dngr podcast', color: '#9ca3af', isDefault: true, type: 'main' },
];

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
}

// ── Habits ──────────────────────────────────────────────
export function loadHabits() {
  const habits = lsGet(HABITS_KEY, null);
  if (!habits || habits.length === 0) {
    lsSet(HABITS_KEY, DEFAULT_HABITS);
    return DEFAULT_HABITS;
  }
  return habits;
}

export function saveHabits(habits) {
  const sorted = [...habits].sort((a, b) => {
    const aType = a.type || 'main';
    const bType = b.type || 'main';
    if (aType === 'main' && bType === 'side') return -1;
    if (aType === 'side' && bType === 'main') return 1;
    return 0;
  });
  lsSet(HABITS_KEY, sorted);
}

// ── Tracking Data ───────────────────────────────────────
export function loadTrackingData() {
  return lsGet(TRACKING_KEY, {});
}

export function saveTrackingData(trackingData) {
  lsSet(TRACKING_KEY, trackingData);
}

// ── Calendar Activities ─────────────────────────────────
export function loadCalendar() {
  return lsGet(CALENDAR_KEY, []);
}

export function saveCalendar(activities) {
  lsSet(CALENDAR_KEY, activities);
}

// ── Missed Notes ────────────────────────────────────────
export function loadMissedNotes() {
  return lsGet(MISSED_KEY, {});
}

export function saveMissedNotes(missedNotes) {
  lsSet(MISSED_KEY, missedNotes);
}

// ── Sleep Log ───────────────────────────────────────────
export function loadSleepLog() {
  return lsGet(SLEEP_KEY, {});
}

export function saveSleepLog(sleepLog) {
  lsSet(SLEEP_KEY, sleepLog);
}

// ── Helper ──────────────────────────────────────────────
export function getCurrentUserId() {
  return 'local-user';
}
