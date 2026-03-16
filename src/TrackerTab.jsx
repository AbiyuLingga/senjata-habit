import { useState, useRef, useEffect } from 'react';

// ── Habits list for today's checklist ───────────────────
const DAILY_HABITS = [
      'Ga tdur pagi',
      'Ga begadang 🔥',
      'Belajar KREFA',
      'Olahraga',
      "Muraja'ah Al-Qur'an",
      "Tilawah Al-Qur'an",
      'Journaling',
      'Post konten',
      'Baca buku/dngr podcast',
];

const WATER_TARGET = 2.5; // liters
const ML_PER_GLASS = 0.25; // 250ml per glass

// ── Failure Modal ───────────────────────────────────────
function FailureModal({ habitName, onSubmit, onCancel }) {
      const [reason, setReason] = useState('');

      return (
            <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onCancel} />
                  {/* Modal */}
                  <div className="fixed bottom-0 left-0 right-0 z-[60] max-w-md mx-auto animate-slide-up">
                        <div className="bg-[#1a1a24] border border-red-500/30 rounded-t-3xl p-6 shadow-2xl">
                              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />

                              {/* Header */}
                              <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">⚠️</span>
                                    <h2 className="text-lg font-bold text-red-400">Konfirmasi Gagal</h2>
                              </div>
                              <p className="text-sm text-gray-400 mb-1">
                                    Habit: <span className="text-white font-medium">{habitName}</span>
                              </p>
                              <p className="text-sm text-gray-400 mb-4">
                                    Tulis alasan lo gagal hari ini. Catatan ini bakal dirangkum buat evaluasi.
                              </p>

                              {/* Textarea */}
                              <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Contoh: Kecapekan, lupa, males bangun..."
                                    className="w-full bg-[#2a2a35] border border-[#3a3a45] focus:border-red-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none min-h-[100px] mb-4"
                                    autoFocus
                              />

                              {/* Buttons */}
                              <div className="flex gap-3">
                                    <button
                                          onClick={onCancel}
                                          className="flex-1 py-3 rounded-xl bg-[#2a2a35] text-gray-400 text-sm font-semibold hover:bg-[#3a3a45] transition-colors"
                                    >
                                          Batal
                                    </button>
                                    <button
                                          onClick={() => onSubmit(reason.trim() || 'Tidak ada alasan.')}
                                          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-red-500/20"
                                    >
                                          Submit & Reset Streak
                                    </button>
                              </div>
                        </div>
                  </div>
            </>
      );
}

// ── Hold-to-Complete Button ─────────────────────────────
function HoldButton({ onComplete, disabled }) {
      const [holding, setHolding] = useState(false);
      const [progress, setProgress] = useState(0);
      const timerRef = useRef(null);
      const startRef = useRef(null);
      const HOLD_DURATION = 350; // ms to complete

      const startHold = () => {
            if (disabled) return;
            setHolding(true);
            startRef.current = Date.now();
            timerRef.current = setInterval(() => {
                  const elapsed = Date.now() - startRef.current;
                  const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100);
                  setProgress(pct);
                  if (pct >= 100) {
                        clearInterval(timerRef.current);
                        setHolding(false);
                        setProgress(0);
                        onComplete();
                  }
            }, 16);
      };

      const cancelHold = () => {
            clearInterval(timerRef.current);
            setHolding(false);
            setProgress(0);
      };

      useEffect(() => () => clearInterval(timerRef.current), []);

      return (
            <button
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  disabled={disabled}
                  className="hold-btn relative overflow-hidden rounded-lg px-3 py-1.5 text-xs font-bold select-none transition-all"
                  style={{
                        background: disabled
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(255,255,255,0.05)',
                        color: disabled ? '#4ade80' : '#9ca3af',
                        border: disabled ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: disabled ? 'default' : 'pointer',
                  }}
            >
                  {/* Fill overlay */}
                  <span
                        className="absolute inset-0 origin-left transition-none"
                        style={{
                              transform: `scaleX(${progress / 100})`,
                              background: holding ? 'rgba(74,222,128,0.25)' : 'transparent',
                              transition: holding ? 'none' : 'transform 0.2s ease',
                        }}
                  />
                  <span className="relative z-10">
                        {disabled ? '✓ Done' : holding ? 'Tahan...' : 'Tahan ✓'}
                  </span>
            </button>
      );
}

// ── Numeric Logger Section ──────────────────────────────
function NumericLogger({ sleep, setSleep }) {
      const sleepColor = sleep >= 7 ? '#22c55e' : sleep >= 5 ? '#eab308' : '#ef4444';

      return (
            <div className="space-y-3">

                  {/* Sleep */}
                  <div className="card-bg rounded-2xl p-4 glow-hover transition-all">
                        <div className="flex items-center justify-between">
                              <div>
                                    <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">🌙 Jam Tidur</p>
                                    <p className="text-xl font-bold mt-0.5" style={{ color: sleepColor }}>
                                          {sleep} jam
                                          <span className="text-xs font-normal ml-1" style={{ color: sleepColor }}>
                                                {sleep >= 7 ? '✓ Cukup' : sleep >= 5 ? '⚠ Kurang' : '✗ Berbahaya'}
                                          </span>
                                    </p>
                              </div>
                              <div className="flex items-center gap-2">
                                    <button
                                          onClick={() => setSleep(Math.max(0, sleep - 0.5))}
                                          className="w-8 h-8 rounded-lg bg-[#2a2a35] text-gray-300 text-lg font-bold flex items-center justify-center hover:bg-[#3a3a45] hover:text-white transition-all active:scale-95"
                                    >−</button>
                                    <span className="w-10 text-center font-bold text-white text-sm">{sleep}h</span>
                                    <button
                                          onClick={() => setSleep(Math.min(12, sleep + 0.5))}
                                          className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 text-lg font-bold flex items-center justify-center hover:bg-purple-500/30 transition-all active:scale-95"
                                    >+</button>
                              </div>
                        </div>
                        {/* Sleep quality bar */}
                        <div className="flex gap-1 mt-3">
                              {Array.from({ length: 12 }, (_, i) => (
                                    <div
                                          key={i}
                                          className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                          style={{ backgroundColor: i < sleep ? sleepColor : '#2a2a35' }}
                                    />
                              ))}
                        </div>
                  </div>
            </div>
      );
}

// ── Main TrackerTab Component ────────────────────────────
export default function TrackerTab({
      habitsList = [],
      trackingData,
      setTrackingData,
      saveTrackingData,
      today,
      onSleepChange,
      viewYear,
      viewMonth,
      getTrackKey
}) {
      const habits = habitsList.length > 0 ? habitsList : DAILY_HABITS.map(name => ({ name, type: 'main' }));

      // Failure reasons local to today (persisted separately if needed)
      const [failureReasons, setFailureReasons] = useState({});
      const [activeFailModal, setActiveFailModal] = useState(null);
      const [sleep, setSleep] = useState(6.5);

      // Lift sleep to parent for Analisis tab
      const handleSleepChange = (val) => {
            setSleep(val);
            if (onSleepChange) onSleepChange(val);
      };

      // Derive status from shared trackingData for today
      const getStatus = (habit) => {
            const trackKey = getTrackKey ? getTrackKey(habit, viewYear, viewMonth) : habit;
            const val = trackingData?.[trackKey]?.[today];
            if (val === 1) return 'done';
            if (val === 0 && failureReasons[habit]) return 'failed';
            return 'pending';
      };

      // Write completion to shared state (val=1 = done)
      const handleComplete = (habit) => {
            if (getStatus(habit) === 'done') return;
            const trackKey = getTrackKey ? getTrackKey(habit, viewYear, viewMonth) : habit;
            setTrackingData(prev => {
                  const next = { ...prev };
                  if (!next[trackKey]) next[trackKey] = {};
                  next[trackKey] = { ...next[trackKey], [today]: 1 };
                  saveTrackingData(next);
                  return next;
            });
      };

      // Write failure to shared state (val=0 = skipped) and clear reason
      const handleFailSubmit = (habit, reason) => {
            const trackKey = getTrackKey ? getTrackKey(habit, viewYear, viewMonth) : habit;
            setFailureReasons(prev => ({ ...prev, [habit]: reason }));
            setTrackingData(prev => {
                  const next = { ...prev };
                  if (!next[trackKey]) next[trackKey] = {};
                  next[trackKey] = { ...next[trackKey], [today]: 0 };
                  saveTrackingData(next);
                  return next;
            });
            setActiveFailModal(null);
      };

      const doneCount = habits.filter(h => getStatus(h.name) === 'done').length;
      const failCount = habits.filter(h => getStatus(h.name) === 'failed').length;

      return (
            <div className="space-y-4">

                  {/* ── Numeric Data Logging ── */}
                  <div>
                        <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2 px-1">📊 Data Harian</p>
                        <NumericLogger sleep={sleep} setSleep={handleSleepChange} />
                  </div>

                  {/* ── Daily Action Checklist ── */}
                  <div>
                        <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2 px-1">✅ Checklist Habit</p>
                        <div className="space-y-2">
                              {habits.map((habitObj) => {
                                    const habit = habitObj.name;
                                    const type = habitObj.type || 'main';
                                    const status = getStatus(habit);
                                    return (
                                          <div
                                                key={habit}
                                                className={`card-bg rounded-xl px-4 py-3 flex items-center justify-between gap-3 transition-all duration-300 ${status === 'done'
                                                      ? 'border-green-500/25 bg-green-500/5'
                                                      : status === 'failed'
                                                            ? 'border-red-500/25 bg-red-500/5 opacity-60'
                                                            : 'glow-hover'
                                                      }`}
                                          >
                                                <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                                                      <span className={`text-sm font-medium truncate ${status === 'done' ? 'text-green-400 line-through decoration-green-600' :
                                                            status === 'failed' ? 'text-red-400 line-through decoration-red-600' :
                                                                  'text-gray-200'
                                                            }`}>
                                                            {habit}
                                                      </span>
                                                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold ${type === 'main' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                                            {type === 'main' ? 'M' : 'S'}
                                                      </span>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                      {status === 'pending' && (
                                                            <>
                                                                  <HoldButton onComplete={() => handleComplete(habit)} disabled={false} />
                                                                  <button
                                                                        onClick={() => setActiveFailModal(habit)}
                                                                        className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-95"
                                                                        title="Tandai gagal"
                                                                  >✗</button>
                                                            </>
                                                      )}
                                                      {status === 'done' && (
                                                            <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1">✓ Done</span>
                                                      )}
                                                      {status === 'failed' && (
                                                            <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">✗ Gagal</span>
                                                      )}
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  </div>

                  {/* ── Failure Modal ── */}
                  {activeFailModal && (
                        <FailureModal
                              habitName={activeFailModal}
                              onSubmit={(reason) => handleFailSubmit(activeFailModal, reason)}
                              onCancel={() => setActiveFailModal(null)}
                        />
                  )}
            </div>
      );
}
