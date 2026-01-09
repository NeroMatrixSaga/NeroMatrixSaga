import { useEffect } from "react";

export default function ReaderFooter({
  theme,
  pageNumber,
  isBookmarked,
  onToggleBookmark,
  showPrev,
  showNext,
  showNextChapter,
  onPrev,
  onNext,
  onNextChapter,
  isFullscreen,
  toggleFullscreen
}) {

  /* ---------- SYNC ESC EXIT ---------- */
  useEffect(() => {
    const handleExit = () => {
      if (!document.fullscreenElement && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleExit);
    return () =>
      document.removeEventListener("fullscreenchange", handleExit);
  }, [isFullscreen, toggleFullscreen]);

  return (
    <footer className={`reader-footer ${theme}`} data-role="reader-footer">

      {/* LEFT */}
      <div className="footer-left">
        {showPrev && (
          <button onClick={onPrev}>
            <span className="icon-only">◀</span>
            <span className="text-only">← Previous</span>
          </button>
        )}
      </div>

      {/* CENTER */}
      <div className="footer-center">

        {/* PAGE NUMBER (LEFT OF READING MODE) */}
        <div className="page-number-box">
          {pageNumber}
        </div>

        {/* READING MODE */}
        <button onClick={toggleFullscreen}>
          <span className="icon-only">⛶</span>
          <span className="text-only">
            {isFullscreen ? "Exit Reading Mode" : "Reading Mode"}
          </span>
        </button>

        {/* BOOKMARK ICON (RIGHT OF READING MODE) */}
        <button
          className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
          onClick={onToggleBookmark}
          aria-label="Toggle Bookmark"
        >
          <span className="bookmark-icon">
            {isBookmarked ? "🔖" : "📑"}
          </span>
        </button>

      </div>

      {/* RIGHT */}
      <div className="footer-right">
        {showNext && (
          <button onClick={onNext}>
            <span className="icon-only">▶</span>
            <span className="text-only">Next →</span>
          </button>
        )}

        {!showNext && showNextChapter && (
          <button onClick={onNextChapter}>
            <span className="icon-only">▶▶</span>
            <span className="text-only">Next Chapter →</span>
          </button>
        )}
      </div>

    </footer>
  );
}
