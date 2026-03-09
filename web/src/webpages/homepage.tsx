import { useState } from "react"

const matches = [
  { stage: "Group Stage", date: "Thursday, June 15th 2026", team1: "Placeholder1", team2: "Placeholder2", venue: "Stadium, City", time: "12:00" }
]

function MatchCards() {
  return (
    <section className="bg-[#0D1A0D] py-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Upcoming Matches
          </h2>
          <p className="text-white/40 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Book your travel for these exciting World Cup fixtures
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2">
          {matches.map((match, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-lg p-4 hover:border-yellow-600/30 hover:bg-yellow-600/[0.04] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">

                  {/* Stage + Date */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="bg-yellow-600/20 text-yellow-500 text-[0.62rem] px-2 py-0.5 rounded tracking-wide"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {match.stage}
                    </span>
                    <span className="text-white/30 text-[0.68rem]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {match.date}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {match.team1}
                    </span>
                    <span className="text-yellow-500 text-xs font-bold tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      VS
                    </span>
                    <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {match.team2}
                    </span>
                  </div>

                  {/* Venue + Time */}
                  <div className="flex items-center gap-3">
                    <span className="text-white/35 text-[0.7rem]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                       {match.venue}
                    </span>
                    <span className="text-white/35 text-[0.7rem]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                       {match.time}
                    </span>
                  </div>

                </div>

                {/* Book Now */}
                <button
                  className="bg-yellow-500 text-[#0D1A0D] text-xs font-bold px-3.5 py-2 rounded whitespace-nowrap flex items-center gap-1 hover:bg-yellow-400 transition-colors duration-200 border-none cursor-pointer ml-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Book Now →
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default MatchCards