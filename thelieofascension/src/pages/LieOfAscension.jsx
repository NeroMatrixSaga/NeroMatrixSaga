import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import ReaderFooter from "../components/ReaderFooter";
import coverImage from "../assets/cover.webp";
import book from "../content/book";
import "../styles/reader.css";

export default function LieOfAscension() {
  /* ---------- STATE ---------- */

  const [hasStarted, setHasStarted] = useState(
    () => localStorage.getItem("reader-started") === "true"
  );

  const [chapter, setChapter] = useState(
    () => Number(localStorage.getItem("reader-chapter")) || 1
  );

  const [pageIndex, setPageIndex] = useState(
    () => Number(localStorage.getItem("reader-page")) || 0
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("reader-theme") || "dark"
  );

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("reader-font-size");
    return saved ? parseFloat(saved) : 1.15;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---------- PAGE TURN DIRECTION ---------- */
  const [turnDirection, setTurnDirection] = useState("next");

  /* ---------- DICTIONARY TOGGLE ---------- */
  const [dictionaryEnabled, setDictionaryEnabled] = useState(() => {
    const saved = localStorage.getItem("reader-dictionary");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("reader-dictionary", dictionaryEnabled);
  }, [dictionaryEnabled]);

  /* ---------- DICTIONARY STATE ---------- */
  const [dictWord, setDictWord] = useState("");
  const [dictMeaning, setDictMeaning] = useState("");
  const [showDict, setShowDict] = useState(false);

  const dictTimerRef = useRef(null);
  const readerTopRef = useRef(null);
  const touchTimerRef = useRef(null);

  /* ---------- GLOBAL PAGE NUMBER ---------- */
  const getGlobalPageNumber = () => {
    let count = 0;
    for (let ch = 1; ch < chapter; ch++) {
      count += book[ch]?.pages.length || 0;
    }
    return count + pageIndex + 1;
  };

  const currentPageNumber = getGlobalPageNumber();

  /* ---------- BOOKMARK STATE ---------- */
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("reader-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("reader-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = bookmarks.some(
    b => b.chapter === chapter && b.pageIndex === pageIndex
  );

  const toggleBookmark = () => {
    setBookmarks(prev => {
      let updated;
      if (isBookmarked) {
        updated = prev.filter(
          b => !(b.chapter === chapter && b.pageIndex === pageIndex)
        );
      } else {
        updated = [
          ...prev,
          { chapter, pageIndex, pageNumber: currentPageNumber }
        ];
      }
      return updated.sort((a, b) => a.pageNumber - b.pageNumber);
    });
  };

  /* ---------- CHAPTER LIST ---------- */
  const chapters = Object.keys(book).map(num => ({
    number: Number(num),
    title: book[num].title
  }));

  /* ---------- JUMP HANDLERS ---------- */
  const jumpToChapter = (chapterNumber) => {
    setTurnDirection("next");
    setChapter(chapterNumber);
    setPageIndex(0);
    setHasStarted(true);
  };

  const jumpToBookmark = (chapterNumber, pageIdx) => {
    setTurnDirection("next");
    setChapter(chapterNumber);
    setPageIndex(pageIdx);
    setHasStarted(true);
  };

  /* ---------- THEME ---------- */
  useEffect(() => {
    const body = document.body;
    if (theme === "dark") body.style.background = "#0e0e0e";
    if (theme === "light") body.style.background = "#f5f5f5";
    if (theme === "eye") body.style.background = "#1c1a16";
    localStorage.setItem("reader-theme", theme);
  }, [theme]);

  /* ---------- FONT ---------- */
  useEffect(() => {
    localStorage.setItem("reader-font-size", fontSize);
  }, [fontSize]);

  /* ---------- PROGRESS ---------- */
  useEffect(() => {
    localStorage.setItem("reader-started", hasStarted);
    localStorage.setItem("reader-chapter", chapter);
    localStorage.setItem("reader-page", pageIndex);
  }, [hasStarted, chapter, pageIndex]);

  /* ---------- RESET SCROLL ---------- */
  useEffect(() => {
    readerTopRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start"
    });
  }, [pageIndex, chapter, hasStarted]);

  /* ---------- FULLSCREEN ---------- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /* ---------- DICTIONARY HELPERS ---------- */
  const getSelectedWord = () => {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return "";
    const text = selection.anchorNode.textContent;
    const offset = selection.anchorOffset;
    if (!text) return "";
    const left = text.slice(0, offset).split(/\s+/).pop();
    const right = text.slice(offset).split(/\s+/).shift();
    return (left + right).replace(/[^a-zA-Z]/g, "");
  };

  const handleWordLookup = async () => {
    if (!dictionaryEnabled) return;
    const word = getSelectedWord();
    if (!word) return;

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await res.json();
      const meaning =
        data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
        "No definition found.";

      setDictWord(word);
      setDictMeaning(meaning);
      setShowDict(true);

      clearTimeout(dictTimerRef.current);
      dictTimerRef.current = setTimeout(() => setShowDict(false), 5000);
    } catch {
      setDictWord(word);
      setDictMeaning("Definition unavailable.");
      setShowDict(true);
    }
  };

  const handleTouchStart = () => {
    if (!dictionaryEnabled) return;
    touchTimerRef.current = setTimeout(handleWordLookup, 600);
  };
  const handleTouchMove = () => clearTimeout(touchTimerRef.current);
  const handleTouchEnd = () => clearTimeout(touchTimerRef.current);

  /* ---------- BOOK ---------- */
  const chapterData = book[chapter];
  const lastPageIndex = chapterData.pages.length - 1;

  /* ---------- NAV ---------- */
  const goNextPage = () => {
    if (pageIndex < lastPageIndex) {
      setTurnDirection("next");
      setPageIndex(p => p + 1);
    }
  };

  const goNextChapter = () => {
    const next = chapter + 1;
    if (book[next]) {
      setTurnDirection("next");
      setChapter(next);
      setPageIndex(0);
    }
  };

  const goPrevPage = () => {
    setTurnDirection("prev");

    if (chapter === 1 && pageIndex === 0) {
      setHasStarted(false);
      setPageIndex(0);
      return;
    }
    if (pageIndex > 0) {
      setPageIndex(p => p - 1);
      return;
    }
    const prev = chapter - 1;
    if (prev) {
      setChapter(prev);
      setPageIndex(book[prev].pages.length - 1);
    }
  };

  return (
    <div className={`app ${theme}`}>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        dictionaryEnabled={dictionaryEnabled}
        setDictionaryEnabled={setDictionaryEnabled}
        chapters={chapters}
        bookmarks={bookmarks}
        onJumpToChapter={jumpToChapter}
        onJumpToBookmark={jumpToBookmark}
      />

      <div className="app-bg">
        <div className={`reader ${!hasStarted ? "reader-cover" : ""}`}>
          <div className="reader-content" ref={readerTopRef}>
            {!hasStarted && (
              <div className="cover-page">
                <div
                  className="cover-image"
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <button
                  className="start-reading"
                  onClick={() => setHasStarted(true)}
                >
                  Begin Reading
                </button>
              </div>
            )}

            {hasStarted && (
              <>
                {pageIndex === 0 && (
                  <h2 className="prologue-title">{chapterData.title}</h2>
                )}

                <p
                  key={`${chapter}-${pageIndex}`}
                  className={`reader-text page-turn ${turnDirection}`}
                  style={{ fontSize: `${fontSize}rem` }}
                  onDoubleClick={handleWordLookup}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {chapterData.pages[pageIndex]}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {showDict && (
        <div className={`dictionary-box ${theme}`}>
          <strong>{dictWord}</strong>
          <p>{dictMeaning}</p>
        </div>
      )}

      <ReaderFooter
        theme={theme}
        pageNumber={currentPageNumber}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        showPrev={hasStarted}
        showNext={hasStarted && pageIndex < lastPageIndex}
        showNextChapter={
          hasStarted && pageIndex === lastPageIndex && book[chapter + 1]
        }
        onPrev={goPrevPage}
        onNext={goNextPage}
        onNextChapter={goNextChapter}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
