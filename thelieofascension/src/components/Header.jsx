import { useState, useEffect, useRef } from "react";
import logo from "../assets/Logo.svg";


export default function Header({
  onThemeChange,
  theme,
  fontSize,
  setFontSize,
  dictionaryEnabled,
  setDictionaryEnabled,

  chapters = [],
  bookmarks = [],
  onJumpToChapter,
  onJumpToBookmark
}) {
  const [openSettings, setOpenSettings] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [menuView, setMenuView] = useState("root"); // root | chapters | bookmarks

  const settingsRef = useRef(null);
  const menuRef = useRef(null);
  const timerRef = useRef(null);

  /* ---------- AUTO CLOSE SETTINGS ---------- */
  useEffect(() => {
    if (!openSettings) return;

    timerRef.current = setTimeout(() => {
      setOpenSettings(false);
    }, 5000);

    return () => clearTimeout(timerRef.current);
  }, [openSettings]);

  /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setOpenSettings(false);
      }

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
        setMenuView("root");
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const increaseFont = () => setFontSize(p => Math.min(p + 0.1, 2));
  const decreaseFont = () => setFontSize(p => Math.max(p - 0.1, 0.9));

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <>
      <header className="reader-header">

        {/* LEFT GROUP */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          
          {/* ☰ MENU */}
          <button
            className="header-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(o => !o);
              setMenuView("root");
            }}
          >
            ☰
          </button>

          {/* HOME BUTTON */}
          <button
            className="header-btn home-btn"
            onClick={goHome}
            aria-label="Go to Home"
          >
            <img
              src={logo}
              alt="Home"
              className="home-logo"
            />
            <span className="home-text">Home</span>
          </button>

        </div>

        {/* TITLE */}
        <div className="header-title">
          <span className="title-main">Mortal Matrix</span>
          <span className="title-sub">Book – 1</span>
        </div>

        {/* ⚙ SETTINGS */}
        <button
          className="header-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpenSettings(o => !o);
          }}
        >
          ⚙
        </button>
      </header>

      {/* ---------- ☰ MENU PANEL ---------- */}
      {openMenu && (
        <div
          ref={menuRef}
          className={`settings-panel menu-panel ${theme}`}
          onClick={e => e.stopPropagation()}
        >
          {menuView === "root" && (
            <>
              <p><strong>Menu</strong></p>
              <div className="setting-row">
                <button onClick={() => setMenuView("chapters")}>
                  Chapters
                </button>
                <button onClick={() => setMenuView("bookmarks")}>
                  Bookmarks
                </button>
              </div>
            </>
          )}

          {menuView === "chapters" && (
            <>
              <p><strong>Chapters</strong></p>
              {chapters.map(ch => (
                <button
                  key={ch.number}
                  onClick={() => {
                    onJumpToChapter?.(ch.number);
                    setOpenMenu(false);
                    setMenuView("root");
                  }}
                >
                  {ch.title}
                </button>
              ))}
            </>
          )}

          {menuView === "bookmarks" && (
            <>
              <p><strong>Bookmarks</strong></p>
              {bookmarks.length === 0 && (
                <p style={{ opacity: 0.6 }}>No bookmarks</p>
              )}

              {bookmarks.map((b, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onJumpToBookmark?.(b.chapter, b.pageIndex);
                    setOpenMenu(false);
                    setMenuView("root");
                  }}
                >
                  Page {b.pageNumber} (Chapter {b.chapter})
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* ---------- ⚙ SETTINGS PANEL ---------- */}
      {openSettings && (
        <div
          ref={settingsRef}
          className={`settings-panel ${theme}`}
          onClick={e => e.stopPropagation()}
        >
          <p><strong>Theme</strong></p>
          <div className="setting-row">
            <button onClick={() => onThemeChange("dark")}>Dark</button>
            <button onClick={() => onThemeChange("light")}>Light</button>
            <button onClick={() => onThemeChange("eye")}>Eye</button>
          </div>

          <p><strong>Font Size</strong></p>
          <div className="font-control">
            <button onClick={decreaseFont}>←</button>
            <span>{fontSize.toFixed(1)}</span>
            <button onClick={increaseFont}>→</button>
          </div>

          <p><strong>Dictionary</strong></p>
          <div className="setting-row">
            <button onClick={() => setDictionaryEnabled(v => !v)}>
              {dictionaryEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
