const DEMO_COLOR = "#818CF8";
const DEMO_ICON = "📚";
const DEMO_NAME = "React Mastery";
const DEMO_PLAYLIST_ID = "demo-123";
const DEMO_ITEMS = [
  { t: "React Hooks Explained – Full Course", u: "https://youtube.com/watch?v=demo1" },
  { t: "useEffect Deep Dive – Everything You Need to Know", u: "https://youtube.com/watch?v=demo2" },
  { t: "Building Custom Hooks in React", u: "https://youtube.com/watch?v=demo3" },
  { t: "React Context API Tutorial 2024", u: "https://youtube.com/watch?v=demo4" },
  { t: "React Performance Optimization Techniques", u: "https://youtube.com/watch?v=demo5" },
  { t: "Server Components vs Client Components", u: "https://youtube.com/watch?v=demo6" },
  { t: "React Query Tutorial – Data Fetching Made Easy", u: "https://youtube.com/watch?v=demo7" },
];

const IOS_STORE = "https://apps.apple.com/app/skillsee/id000000000";
const ANDROID_STORE = "https://play.google.com/store/apps/details?id=com.skillsee.app";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/** Try deep link — if app isn't installed, fall through to the store after 1.5 s */
function openOrDownload(playlistId: string) {
  const deepLink = `skillsee://playlist?id=${playlistId}`;
  window.location.href = deepLink;
  const store = isIOS() ? IOS_STORE : ANDROID_STORE;
  setTimeout(() => {
    window.location.href = store;
  }, 1500);
}

function downloadForPlatform(platform: "ios" | "android") {
  window.location.href = platform === "ios" ? IOS_STORE : ANDROID_STORE;
}

export function PlaylistShare() {
  const rgb = hexToRgb(DEMO_COLOR);

  return (
    <div className="min-h-screen bg-[#070A10] font-sans">

      {/* ── Sticky smart app banner ── */}
      <div className="sticky top-0 z-50 bg-[#0C1018]/95 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <img
          src="/skillsee-logo.jpeg"
          alt="SkillSee"
          className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-semibold leading-tight">Open in SkillSee</p>
          <p className="text-white/40 text-[11px]">View &amp; save this playlist in the app</p>
        </div>
        <button
          onClick={() => openOrDownload(DEMO_PLAYLIST_ID)}
          className="px-4 py-1.5 rounded-full text-[13px] font-bold text-white flex-shrink-0 active:opacity-80 transition-opacity cursor-pointer"
          style={{ background: `linear-gradient(135deg, rgba(${rgb},1), rgba(${rgb},0.75))` }}
        >
          Open
        </button>
      </div>

      {/* ── Gradient hero ── */}
      <div
        className="relative px-6 pt-10 pb-8 flex flex-col items-center text-center gap-3"
        style={{
          background: `linear-gradient(180deg, rgba(${rgb}, 0.35) 0%, rgba(${rgb}, 0.08) 60%, #070A10 100%)`,
        }}
      >
        {/* SkillSee wordmark pill */}
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-1">
          <img src="/skillsee-logo.jpeg" alt="SkillSee" className="w-4 h-4 rounded object-cover" />
          <span className="text-white text-[11px] font-semibold tracking-wide">SkillSee</span>
        </div>

        {/* Category icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl"
          style={{ background: `rgba(${rgb}, 0.25)`, border: `1.5px solid rgba(${rgb}, 0.35)` }}
        >
          {DEMO_ICON}
        </div>

        <h1 className="text-white text-3xl font-extrabold tracking-tight mt-1">{DEMO_NAME}</h1>
        <p style={{ color: `rgba(${rgb}, 0.9)` }} className="text-sm font-medium">
          {DEMO_ITEMS.length} resources · Shared via SkillSee
        </p>
      </div>

      {/* ── Playlist items ── */}
      <div className="px-4 pb-2">
        <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase px-1 mb-3">Playlist</p>
        <div className="flex flex-col gap-2">
          {DEMO_ITEMS.map((item, i) => (
            <a
              key={i}
              href={item.u}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#0C1018] rounded-xl p-3 group hover:bg-[#111827] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: `rgba(${rgb}, 0.15)`, color: `rgba(${rgb}, 1)` }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#E8EDF5] text-[13px] font-semibold leading-tight line-clamp-2">{item.t}</p>
                <p className="text-white/25 text-[10px] mt-0.5 truncate">{item.u}</p>
              </div>
              <svg className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* ── Get the App card ── */}
      <div className="px-4 mt-6">
        <div className="bg-[#0C1018] rounded-2xl p-5 border border-white/[0.06]">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/skillsee-logo.jpeg"
              alt="SkillSee"
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-lg"
            />
            <div>
              <p className="text-white font-bold text-[15px]">SkillSee</p>
              <p className="text-white/40 text-[12px]">Save. Learn. Master.</p>
            </div>
          </div>

          <p className="text-white/55 text-[13px] mb-4 leading-relaxed">
            Save this playlist to your library and track your learning progress through every resource.
          </p>

          {/* Primary CTA — smart open / download */}
          <button
            onClick={() => openOrDownload(DEMO_PLAYLIST_ID)}
            className="w-full py-3.5 rounded-xl text-white font-bold text-[14px] mb-3 active:opacity-80 transition-opacity cursor-pointer"
            style={{ background: `linear-gradient(135deg, #818CF8, #6366F1, #4338CA)` }}
          >
            💾 Save to My Library
          </button>

          {/* Platform buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => downloadForPlatform("ios")}
              className="flex-1 flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] transition-colors rounded-xl py-2.5 border border-white/[0.08] cursor-pointer"
            >
              {/* Apple icon */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-white text-[12px] font-semibold">App Store</span>
            </button>
            <button
              onClick={() => downloadForPlatform("android")}
              className="flex-1 flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] transition-colors rounded-xl py-2.5 border border-white/[0.08] cursor-pointer"
            >
              {/* Google Play icon */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.3.17.64.22.97.15l12.5-7.21-2.67-2.67-10.8 9.73zM.73 1.82C.28 2.2 0 2.82 0 3.6v16.8c0 .78.28 1.4.73 1.78l.09.08 9.41-9.41v-.22L.82 3.22l-.09.08v.52zM20.4 10.37l-2.78-1.61-2.99 2.99 2.99 2.99 2.8-1.61c.8-.46.8-1.21-.02-1.76zM3.18.24L15.68 7.45 13.01 10.12 2.21.39C2.51.22 2.88.16 3.18.24z"/>
              </svg>
              <span className="text-white text-[12px] font-semibold">Google Play</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-white/10 text-[11px] py-6">SkillSee · Save. Learn. Master.</p>
    </div>
  );
}
