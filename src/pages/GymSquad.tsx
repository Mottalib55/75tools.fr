import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MEMBERS = ["Motta", "Raul", "Tobi", "Dani", "Jean", "Vlad", "Lucas", "Hugo", "Sergio", "Carlos", "Ignacio"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function getStartDate(offset: number): Date {
  const today = new Date();
  today.setDate(today.getDate() + offset * 7);
  today.setHours(0, 0, 0, 0);
  return today;
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shortDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

type SlotMap = Record<string, string[]>;

const GymSquad = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<string | null>(() => {
    return localStorage.getItem("gymSquadMember");
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<SlotMap>({});
  const [loading, setLoading] = useState(false);

  const getWeekDates = useCallback(() => {
    const start = getStartDate(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const fetchSlots = useCallback(async () => {
    const dates = getWeekDates();
    const startKey = `${dateKey(dates[0])}_`;
    const endKey = `${dateKey(dates[6])}_`;

    const { data, error } = await supabase
      .from("gym_slots")
      .select("slot_key, member")
      .gte("slot_key", startKey)
      .lte("slot_key", endKey + "~");

    if (error) {
      console.error("Error fetching slots:", error);
      return;
    }

    const map: SlotMap = {};
    for (const row of data || []) {
      if (!map[row.slot_key]) map[row.slot_key] = [];
      map[row.slot_key].push(row.member);
    }
    setSlots(map);
  }, [getWeekDates]);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 30000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const handleMemberSelect = (name: string) => {
    setSelectedMember(name);
    localStorage.setItem("gymSquadMember", name);
  };

  const toggleSlot = async (slotKey: string) => {
    if (!selectedMember) return;
    setLoading(true);

    const members = slots[slotKey] || [];
    const isRegistered = members.includes(selectedMember);

    if (isRegistered) {
      await supabase
        .from("gym_slots")
        .delete()
        .eq("slot_key", slotKey)
        .eq("member", selectedMember);
    } else {
      await supabase
        .from("gym_slots")
        .insert({ slot_key: slotKey, member: selectedMember });
    }

    await fetchSlots();
    setLoading(false);
  };

  const weekDates = getWeekDates();

  const weekLabel = `${shortDate(weekDates[0])} - ${shortDate(weekDates[6])}`;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0]">
      {/* Header */}
      <div className="max-w-[1100px] mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#aaa] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={fetchSlots}
            className="text-[#aaa] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Dumbbell className="w-8 h-8" />
            Gym Crew
          </h1>
          <p className="text-[#888] mt-1">Who's hitting the gym and when?</p>
        </header>

        {/* Member Selection */}
        <section className="text-center mb-6">
          <p className="text-[#aaa] text-sm mb-3">Who are you?</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {MEMBERS.map((name) => (
              <button
                key={name}
                onClick={() => handleMemberSelect(name)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${
                  selectedMember === name
                    ? "border-[#4f9cf7] bg-[#1a2d4a] text-[#4f9cf7]"
                    : "border-[#333] bg-[#1a1a1a] text-[#ccc] hover:border-[#555] hover:bg-[#252525]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        {/* Week Navigation */}
        <nav className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className={`px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm transition-all ${
              weekOffset === 0
                ? "text-[#444] cursor-not-allowed"
                : "text-[#aaa] hover:border-[#4f9cf7] hover:text-[#4f9cf7] hover:bg-[#1a2d4a]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#ccc] text-sm font-medium min-w-[220px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-[#aaa] rounded-lg text-sm transition-all hover:border-[#4f9cf7] hover:text-[#4f9cf7] hover:bg-[#1a2d4a]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Planning Grid */}
        <section className={`overflow-x-auto mb-8 ${!selectedMember ? "opacity-40 pointer-events-none" : ""}`}>
          <div
            className="grid gap-0.5 min-w-[700px]"
            style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}
          >
            {/* Header row */}
            <div className="p-2 text-center rounded-md" />
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`p-2 text-center rounded-md font-semibold text-xs uppercase tracking-wide ${
                  isToday(date)
                    ? "text-[#4f9cf7] bg-[#1a2d4a]"
                    : "text-[#aaa] bg-[#1a1a1a]"
                }`}
              >
                {DAY_NAMES[date.getDay()]}
                <br />
                {shortDate(date)}
              </div>
            ))}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <>
                <div
                  key={`h-${hour}`}
                  className="p-2 text-center rounded-md bg-[#1a1a1a] font-medium text-[#777] text-sm flex items-center justify-center"
                >
                  {hour}
                </div>
                {weekDates.map((date, dayIdx) => {
                  const slotKey = `${dateKey(date)}_${hour}`;
                  const members = slots[slotKey] || [];
                  const hasMe = selectedMember ? members.includes(selectedMember) : false;
                  const hasOthers = members.filter((m) => m !== selectedMember).length > 0;

                  let cellClass = "bg-[#141414] hover:bg-[#1e1e1e]";
                  if (hasMe && hasOthers) {
                    cellClass = "bg-[#1a2d1a] border border-[#3d7a43]";
                  } else if (hasMe) {
                    cellClass = "bg-[#162d1a] border border-[#2d5a33]";
                  } else if (hasOthers) {
                    cellClass = "bg-[#1a1a2d] hover:bg-[#1e1e1e]";
                  }

                  return (
                    <div
                      key={`${hour}-${dayIdx}`}
                      onClick={() => !loading && toggleSlot(slotKey)}
                      className={`p-1 text-center rounded-md cursor-pointer transition-all min-h-[52px] flex items-center justify-center ${cellClass}`}
                    >
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {members.map((name) => (
                          <span
                            key={name}
                            className={`text-[0.6rem] px-1.5 py-0.5 rounded-[10px] font-semibold leading-none ${
                              name === selectedMember
                                ? "bg-[#2d7a33] text-[#b8f0bd]"
                                : "bg-[#2d2d5a] text-[#b8b8f0]"
                            }`}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </section>

        {!selectedMember && (
          <div className="text-center text-[#888] text-sm">
            Select your name above to start booking slots.
          </div>
        )}
      </div>
    </div>
  );
};

export default GymSquad;
