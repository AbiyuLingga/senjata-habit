import { supabase } from './supabase';

// Simple user ID - replace with supabase.auth.user().id once you add authentication
const USER_ID = 'local-user';

// ── Default Habits ──────────────────────────────────────
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

// ── Habits ──────────────────────────────────────────────
export async function loadHabits() {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', USER_ID)
    .order('sort_order');

  if (error) {
    console.error('Error loading habits:', error);
    return DEFAULT_HABITS;
  }

  if (!data || data.length === 0) {
    // First time - insert defaults
    await saveHabits(DEFAULT_HABITS);
    return DEFAULT_HABITS;
  }

  return data;
}

export async function saveHabits(habits) {
  // Sort: Main first, Side second
  const sorted = [...habits].sort((a, b) => {
    const aType = a.type || 'main';
    const bType = b.type || 'main';
    if (aType === 'main' && bType === 'side') return -1;
    if (aType === 'side' && bType === 'main') return 1;
    return 0;
  });

  // Delete all existing habits for this user, then insert new ones
  const { error: deleteError } = await supabase
    .from('habits')
    .delete()
    .eq('user_id', USER_ID);

  if (deleteError) {
    console.error('Error deleting old habits:', deleteError);
    return;
  }

  const habitsToInsert = sorted.map((h, index) => ({
    user_id: USER_ID,
    name: h.name,
    color: h.color,
    type: h.type || 'main',
    is_default: h.isDefault || false,
    sort_order: index,
  }));

  const { error: insertError } = await supabase
    .from('habits')
    .insert(habitsToInsert);

  if (insertError) {
    console.error('Error saving habits:', insertError);
  }
}

// ── Tracking Data ───────────────────────────────────────
export async function loadTrackingData() {
  const { data, error } = await supabase
    .from('tracking')
    .select('*')
    .eq('user_id', USER_ID);

  if (error) {
    console.error('Error loading tracking data:', error);
    return {};
  }

  // Convert from DB format to app format: { "habitName_YYYY-MM": { day: 1/0 } }
  const trackingData = {};
  data.forEach((row) => {
    const monthKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
    const key = `${row.habit_name}_${monthKey}`;
    if (!trackingData[key]) trackingData[key] = {};
    trackingData[key][row.day] = row.done ? 1 : 0;
  });

  return trackingData;
}

export async function saveTrackingData(trackingData) {
  // Convert from app format to DB rows
  const rows = [];
  Object.keys(trackingData).forEach((key) => {
    // key format: "habitName_YYYY-MM"
    const parts = key.split('_');
    const habitName = parts.slice(0, -1).join('_'); // handle habit names with underscores
    const monthKey = parts[parts.length - 1]; // "YYYY-MM"
    const [year, month] = monthKey.split('-').map(Number);

    const dayData = trackingData[key];
    Object.keys(dayData).forEach((day) => {
      rows.push({
        user_id: USER_ID,
        habit_name: habitName,
        year,
        month,
        day: parseInt(day, 10),
        done: dayData[day] === 1,
      });
    });
  });

  // Upsert all rows (insert or update if exists)
  const { error } = await supabase
    .from('tracking')
    .upsert(rows, {
      onConflict: 'user_id,habit_name,year,month,day',
    });

  if (error) {
    console.error('Error saving tracking data:', error);
  }
}

// ── Calendar Activities ─────────────────────────────────
export async function loadCalendar() {
  const { data, error } = await supabase
    .from('calendar_activities')
    .select('*')
    .eq('user_id', USER_ID)
    .order('start_date');

  if (error) {
    console.error('Error loading calendar:', error);
    return [];
  }

  return data || [];
}

export async function saveCalendar(activities) {
  // Delete all existing, then insert new
  const { error: deleteError } = await supabase
    .from('calendar_activities')
    .delete()
    .eq('user_id', USER_ID);

  if (deleteError) {
    console.error('Error deleting calendar:', deleteError);
    return;
  }

  if (activities.length === 0) return;

  const activitiesToInsert = activities.map((a) => ({
    id: a.id,
    user_id: USER_ID,
    title: a.title,
    start_date: a.startDate,
    end_date: a.endDate,
    color: a.color,
    notes: a.notes || '',
    completed: a.completed || false,
  }));

  const { error: insertError } = await supabase
    .from('calendar_activities')
    .insert(activitiesToInsert);

  if (insertError) {
    console.error('Error saving calendar:', insertError);
  }
}

// ── Missed Notes ────────────────────────────────────────
export async function loadMissedNotes() {
  const { data, error } = await supabase
    .from('missed_notes')
    .select('*')
    .eq('user_id', USER_ID);

  if (error) {
    console.error('Error loading missed notes:', error);
    return {};
  }

  // Convert to app format: { [dayNum]: { habitName: reason, __sleep__: reason } }
  const missedNotes = {};
  data.forEach((row) => {
    if (!missedNotes[row.day]) missedNotes[row.day] = {};
    missedNotes[row.day][row.habit_name] = row.reason;
  });

  return missedNotes;
}

export async function saveMissedNotes(missedNotes) {
  // Convert from app format to DB rows
  const rows = [];
  Object.keys(missedNotes).forEach((dayStr) => {
    const day = parseInt(dayStr, 10);
    const dayData = missedNotes[dayStr];
    Object.keys(dayData).forEach((habitName) => {
      rows.push({
        user_id: USER_ID,
        day,
        habit_name: habitName,
        reason: dayData[habitName] || '',
      });
    });
  });

  // Upsert all rows
  const { error } = await supabase
    .from('missed_notes')
    .upsert(rows, {
      onConflict: 'user_id,day,habit_name',
    });

  if (error) {
    console.error('Error saving missed notes:', error);
  }
}

// ── Sleep Log ───────────────────────────────────────────
export async function loadSleepLog() {
  const { data, error } = await supabase
    .from('sleep_log')
    .select('*')
    .eq('user_id', USER_ID);

  if (error) {
    console.error('Error loading sleep log:', error);
    return {};
  }

  // Convert to app format: { [day]: hours }
  const sleepLog = {};
  data.forEach((row) => {
    sleepLog[row.day] = row.hours;
  });

  return sleepLog;
}

export async function saveSleepLog(sleepLog) {
  // Convert from app format to DB rows
  const rows = Object.keys(sleepLog).map((dayStr) => ({
    user_id: USER_ID,
    day: parseInt(dayStr, 10),
    hours: sleepLog[dayStr],
  }));

  // Upsert all rows
  const { error } = await supabase
    .from('sleep_log')
    .upsert(rows, {
      onConflict: 'user_id,day',
    });

  if (error) {
    console.error('Error saving sleep log:', error);
  }
}

// ── Helper: Get current user ID (for future auth integration) ──
export function getCurrentUserId() {
  // TODO: Replace with supabase.auth.getUser() when you add authentication
  return USER_ID;
}
