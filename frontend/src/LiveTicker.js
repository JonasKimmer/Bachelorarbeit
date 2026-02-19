import React, { useState, useEffect, useCallback } from "react";
import "./LiveTicker.css";
import * as api from "./api";
import { useMatchData } from "./hooks/useMatchData";
import config from "./config/whitelabel";

// ===== SUBCOMPONENTS =====

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-ball" />
      <p>WIRD GELADEN...</p>
    </div>
  );
}

function MatchHeader({ match, leagueSeason, favorites, onToggleFav }) {
  if (!match) return null;
  const status =
    match.status === "live"
      ? "live"
      : match.status === "finished"
        ? "finished"
        : "scheduled";
  return (
    <div className="match-header">
      <div className="mh-teams">
        <div className="mh-team home">
          <span className="mh-team-name">{match.home_team.name}</span>
          <button
            className="fav-btn"
            onClick={() => onToggleFav(match.home_team_id)}
          >
            {favorites.some((f) => f.team_id === match.home_team_id)
              ? "⭐"
              : "☆"}
          </button>
        </div>
        <div className="mh-score">
          {match.score_home}
          <span className="mh-sep">:</span>
          {match.score_away}
        </div>
        <div className="mh-team away">
          <button
            className="fav-btn"
            onClick={() => onToggleFav(match.away_team_id)}
          >
            {favorites.some((f) => f.team_id === match.away_team_id)
              ? "⭐"
              : "☆"}
          </button>
          <span className="mh-team-name">{match.away_team.name}</span>
        </div>
      </div>
      <div className="mh-info">
        <span>
          {leagueSeason?.league?.name} {leagueSeason?.season?.year}
        </span>
        <span>·</span>
        <span>{match.round}</span>
        <span>·</span>
        <span className={`mh-status ${status}`}>{match.status}</span>
      </div>
    </div>
  );
}

function TickerEvent({ event, tickerText, mode, generatingId, onGenerate }) {
  const [editText, setEditText] = useState("");
  const [published, setPublished] = useState(false);

  const typeClass =
    event.type === "Goal"
      ? "goal"
      : event.type === "Card"
        ? "card"
        : event.type === "subst"
          ? "subst"
          : "";
  const icon =
    event.type === "Goal"
      ? "⚽"
      : event.type === "Card"
        ? "🟨"
        : event.type === "subst"
          ? "🔄"
          : "•";

  const rawText = () => {
    if (event.type === "Goal")
      return `Tor! ${event.player_name}${event.assist_name && event.assist_name !== "null" ? ` (Assist: ${event.assist_name})` : ""}`;
    if (event.type === "Card") return `${event.detail} – ${event.player_name}`;
    if (event.type === "subst")
      return `${event.player_name} ↔ ${event.assist_name}`;
    return event.detail;
  };

  // AUTO mode – KI-Text direkt anzeigen, keine Buttons
  if (mode === "auto") {
    return (
      <div className={`event ${typeClass}`}>
        <span className="ev-minute">{event.minute}'</span>
        <span className="ev-icon">{icon}</span>
        <div className="ev-body">
          {tickerText ? (
            <>
              <div className="ticker-text">{tickerText.text}</div>
              <div className="ticker-meta">
                {tickerText.style} · {tickerText.llm_model}
              </div>
            </>
          ) : (
            <div className="ev-raw">{rawText()}</div>
          )}
        </div>
      </div>
    );
  }

  // REVIEW mode – KI-Vorschlag + Bearbeiten/Veröffentlichen
  if (mode === "review") {
    if (tickerText && !published) {
      return (
        <div className={`event ${typeClass}`}>
          <span className="ev-minute">{event.minute}'</span>
          <span className="ev-icon">{icon}</span>
          <div className="ev-body">
            <div className="review-area">
              <textarea
                className="review-textarea"
                defaultValue={tickerText.text}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="review-actions">
                <button
                  className="btn-discard"
                  onClick={() => setPublished(false)}
                >
                  ✕ Verwerfen
                </button>
                <button
                  className="btn-publish"
                  onClick={() => setPublished(true)}
                >
                  ✓ Veröffentlichen
                </button>
              </div>
            </div>
            <div className="ticker-meta">
              {tickerText.style} · {tickerText.llm_model}
            </div>
          </div>
        </div>
      );
    }
    if (published) {
      return (
        <div className={`event ${typeClass}`}>
          <span className="ev-minute">{event.minute}'</span>
          <span className="ev-icon">{icon}</span>
          <div className="ev-body">
            <div className="ticker-text">{editText || tickerText?.text}</div>
            <div className="ticker-meta">✓ Veröffentlicht</div>
          </div>
        </div>
      );
    }
    return (
      <div className={`event ${typeClass}`}>
        <span className="ev-minute">{event.minute}'</span>
        <span className="ev-icon">{icon}</span>
        <div className="ev-body">
          <div className="ev-raw">{rawText()}</div>
          <div className="gen-btns">
            {["neutral", "euphorisch", "kritisch"].map((s) => (
              <button
                key={s}
                className="gen-btn"
                onClick={() => onGenerate(event.id, s)}
                disabled={generatingId === event.id}
              >
                {generatingId === event.id ? "..." : `✦ ${s}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MANUAL mode – Redakteur schreibt selbst
  return (
    <div className={`event ${typeClass}`}>
      <span className="ev-minute">{event.minute}'</span>
      <span className="ev-icon">{icon}</span>
      <div className="ev-body">
        {tickerText ? (
          <div className="ticker-text">{tickerText.text}</div>
        ) : (
          <div className="ev-raw">{rawText()}</div>
        )}
      </div>
    </div>
  );
}

function StatsPanel({ match, matchStats, playerStats, lineups, prematch }) {
  if (!match) return <div className="no-events">Kein Spiel ausgewählt</div>;

  const homeStats = matchStats.find((s) => s.team_id === match.home_team_id);
  const awayStats = matchStats.find((s) => s.team_id === match.away_team_id);
  const homeLineup = lineups.filter(
    (l) => l.team_id === match.home_team_id && !l.is_substitute,
  );
  const awayLineup = lineups.filter(
    (l) => l.team_id === match.away_team_id && !l.is_substitute,
  );
  const topPlayers = [...playerStats]
    .filter((p) => p.rating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div>
      {/* Prematch */}
      {prematch.length > 0 && (
        <div className="panel-section">
          <div className="panel-title">📋 Vorberichte</div>
          {prematch.map((e) => (
            <div key={e.ticker_entry_id} className="prematch-entry">
              {e.text}
              <div className="prematch-model">{e.llm_model}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {homeStats && awayStats && (
        <div className="panel-section">
          <div className="panel-title">📊 Statistiken</div>
          {[
            [
              "Ballbesitz",
              homeStats.ball_possession + "%",
              awayStats.ball_possession + "%",
              homeStats.ball_possession,
              awayStats.ball_possession,
            ],
            ["Schüsse", homeStats.total_shots, awayStats.total_shots],
            ["aufs Tor", homeStats.shots_on_goal, awayStats.shots_on_goal],
            [
              "Pässe %",
              homeStats.passes_percentage + "%",
              awayStats.passes_percentage + "%",
            ],
            ["Ecken", homeStats.corner_kicks, awayStats.corner_kicks],
            ["Fouls", homeStats.fouls, awayStats.fouls],
            ["Abseits", homeStats.offsides, awayStats.offsides],
          ].map(([lbl, h, a, hNum, aNum]) => (
            <div key={lbl}>
              <div className="stat-row">
                <span className="stat-val home">{h}</span>
                <span className="stat-lbl">{lbl}</span>
                <span className="stat-val away">{a}</span>
              </div>
              {hNum !== undefined && (
                <div className="stat-bar-wrap">
                  <div className="stat-bar-h" style={{ width: `${hNum}%` }} />
                  <div className="stat-bar-a" style={{ width: `${aNum}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Top Players */}
      {topPlayers.length > 0 && (
        <div className="panel-section">
          <div className="panel-title">⭐ Beste Spieler</div>
          {topPlayers.map((p, i) => (
            <div key={p.id} className="top-player">
              <span className="tp-rank">#{i + 1}</span>
              <div className="tp-info">
                <div className="tp-name">
                  {p.player_name} {p.captain && "©"}
                </div>
                <div className="tp-meta">
                  {p.position} · #{p.number} · {p.minutes_played}'
                </div>
              </div>
              <span className="tp-rating">{p.rating}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lineups */}
      {(homeLineup.length > 0 || awayLineup.length > 0) && (
        <div className="panel-section">
          <div className="panel-title">📋 Aufstellungen</div>
          <div className="lineups-grid">
            <div className="lineup-col">
              <h4>{match.home_team.name}</h4>
              <div className="lineup-formation">{homeLineup[0]?.formation}</div>
              <ul className="lineup-list">
                {homeLineup.map((p) => (
                  <li key={p.id}>
                    #{p.number} {p.player_name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lineup-col">
              <h4>{match.away_team.name}</h4>
              <div className="lineup-formation">{awayLineup[0]?.formation}</div>
              <ul className="lineup-list">
                {awayLineup.map((p) => (
                  <li key={p.id}>
                    #{p.number} {p.player_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function LiveTicker() {
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ligen");
  const [tickerMode, setTickerMode] = useState("auto"); // auto | review | manual
  const [manualText, setManualText] = useState("");

  const [leagues, setLeagues] = useState([]);
  const [leagueSeasons, setLeagueSeasons] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [selLeagueId, setSelLeagueId] = useState(null);
  const [selLSId, setSelLSId] = useState(null);
  const [selRound, setSelRound] = useState(null);
  const [selMatchId, setSelMatchId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const {
    match,
    events,
    tickerTexts,
    prematch,
    lineups,
    matchStats,
    playerStats,
    reload,
  } = useMatchData(selMatchId);

  // Initial load
  useEffect(() => {
    Promise.all([
      api.fetchLeagues().then((r) => {
        setLeagues(r.data);
        if (r.data.length > 0) setSelLeagueId(r.data[0].id);
      }),
      api.fetchFavorites().then((r) => setFavorites(r.data)),
    ]).finally(() => setAppLoading(false));
  }, []);

  useEffect(() => {
    if (!selLeagueId) return;
    api.fetchSeasons(selLeagueId).then((r) => {
      setLeagueSeasons(r.data);
      const cur = r.data.find((ls) => ls.season.current) || r.data[0];
      if (cur) setSelLSId(cur.id);
    });
  }, [selLeagueId]);

  useEffect(() => {
    if (!selLSId) return;
    api.fetchRounds(selLSId).then((r) => {
      setRounds(r.data);
      if (r.data.length > 0)
        handleRoundChange(r.data[0], selLSId, leagueSeasons);
    });
  }, [selLSId]);

  const handleRoundChange = useCallback(
    async (round, lsId = selLSId, lsList = leagueSeasons) => {
      setSelRound(round);
      setSelMatchId(null);
      setMatches([]);
      const ls = lsList.find((l) => l.id === lsId);
      if (!ls) return;
      try {
        await api.importMatches(ls.league.external_id, ls.season.year, round);
      } catch {}
      const res = await api.fetchMatches(lsId, round);
      setMatches(res.data);
      if (res.data.length > 0) setSelMatchId(res.data[0].id);
    },
    [selLSId, leagueSeasons],
  );

  const liveIntervalRef = React.useRef(null);

  const handleTabMatches = useCallback(async (tab) => {
    setActiveTab(tab);
    clearInterval(liveIntervalRef.current);

    const load = async () => {
      let res;
      if (tab === "heute") res = await api.fetchTodayMatches();
      else if (tab === "live") res = await api.fetchLiveMatches();
      else if (tab === "favoriten") res = await api.fetchFavoriteMatches();
      if (res) {
        setMatches(res.data);
        setSelMatchId(
          (prev) => prev || (res.data.length > 0 ? res.data[0].id : null),
        );
      }
    };

    await load();
    if (tab === "live") {
      liveIntervalRef.current = setInterval(load, 10000);
    }
  }, []);

  useEffect(() => () => clearInterval(liveIntervalRef.current), []);

  const toggleFav = useCallback(
    async (teamId) => {
      const isFav = favorites.some((f) => f.team_id === teamId);
      if (isFav) await api.removeFavorite(teamId);
      else await api.addFavorite(teamId);
      const r = await api.fetchFavorites();
      setFavorites(r.data);
    },
    [favorites],
  );

  const generateTicker = useCallback(
    async (eventId, style) => {
      setGeneratingId(eventId);
      try {
        await api.generateTicker(eventId, style);
        await reload.loadTickerTexts();
      } finally {
        setGeneratingId(null);
      }
    },
    [reload],
  );

  const curLS = leagueSeasons.find((ls) => ls.id === selLSId);

  if (appLoading) return <LoadingScreen />;

  return (
    <div className="liveticker">
      {/* Header */}
      <header className="lt-header">
        <div className="lt-logo">{config.clubName}</div>
        <nav className="lt-tabs">
          {[
            ["ligen", "🌍 Ligen"],
            ["heute", "📅 Heute"],
            ["live", "🔴 Live"],
            ["favoriten", "⭐ Favoriten"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              className={`lt-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() =>
                tab === "ligen" ? setActiveTab("ligen") : handleTabMatches(tab)
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Navigation */}
      {activeTab === "ligen" && (
        <div className="lt-nav">
          <div className="lt-select-wrap">
            <label>Liga</label>
            <select
              className="lt-select"
              value={selLeagueId || ""}
              onChange={(e) => setSelLeagueId(parseInt(e.target.value))}
            >
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lt-select-wrap">
            <label>Saison</label>
            <select
              className="lt-select"
              value={selLSId || ""}
              onChange={(e) => setSelLSId(parseInt(e.target.value))}
            >
              {leagueSeasons.map((ls) => (
                <option key={ls.id} value={ls.id}>
                  {ls.season.year}
                </option>
              ))}
            </select>
          </div>
          <div className="lt-select-wrap">
            <label>Spieltag</label>
            <select
              className="lt-select"
              value={selRound || ""}
              onChange={(e) => handleRoundChange(e.target.value)}
            >
              {rounds.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="lt-select-wrap">
            <label>Spiel</label>
            <select
              className="lt-select"
              value={selMatchId || ""}
              onChange={(e) => setSelMatchId(parseInt(e.target.value))}
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team.name} vs {m.away_team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeTab !== "ligen" && (
        <div className="lt-nav">
          <div className="lt-select-wrap">
            <label>Spiel</label>
            <select
              className="lt-select"
              value={selMatchId || ""}
              onChange={(e) => setSelMatchId(parseInt(e.target.value))}
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team.name} vs {m.away_team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Match Header */}
      <MatchHeader
        match={match}
        leagueSeason={curLS}
        favorites={favorites}
        onToggleFav={toggleFav}
      />

      {/* Ticker Mode Bar */}
      {match && (
        <div className="ticker-mode-bar">
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              marginRight: "0.5rem",
              alignSelf: "center",
            }}
          >
            Modus:
          </span>
          {[
            ["auto", "🤖 Auto"],
            ["review", "✏️ Review"],
            ["manual", "📝 Manuell"],
          ].map(([m, label]) => (
            <button
              key={m}
              className={`mode-btn ${tickerMode === m ? "active" : ""}`}
              onClick={() => setTickerMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="lt-content">
        {/* Left – Ticker */}
        <div className="lt-left">
          <div className="events-list">
            {/* Prematch Events */}
            {prematch.map((e) => (
              <div key={`pre-${e.ticker_entry_id}`} className="event prematch">
                <span className="ev-minute">Vor</span>
                <span className="ev-icon">📋</span>
                <div className="ev-body">
                  <div className="ticker-text">{e.text}</div>
                  <div className="ticker-meta">{e.llm_model}</div>
                </div>
              </div>
            ))}

            {events.length === 0 && match && (
              <div className="no-events">Keine Events für dieses Spiel</div>
            )}
            {!match && (
              <div className="no-events">Bitte wähle ein Spiel aus</div>
            )}

            {events.map((ev) => (
              <TickerEvent
                key={ev.id}
                event={ev}
                tickerText={tickerTexts.find((t) => t.event_id === ev.id)}
                mode={tickerMode}
                generatingId={generatingId}
                onGenerate={generateTicker}
              />
            ))}
          </div>

          {/* Manual Input */}
          {match && tickerMode === "manual" && (
            <div className="manual-input">
              <textarea
                className="manual-textarea"
                placeholder="Ticker-Eintrag schreiben..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={2}
              />
              <button
                className="btn-send"
                onClick={async () => {
                  if (!manualText.trim()) return;
                  try {
                    await api.createManualTicker(selMatchId, manualText.trim());
                    setManualText("");
                    await reload.loadTickerTexts();
                  } catch {
                    alert("Fehler beim Speichern");
                  }
                }}
              >
                Senden
              </button>
            </div>
          )}
        </div>

        {/* Right – Stats Panel */}
        <div className="lt-right">
          <StatsPanel
            match={match}
            matchStats={matchStats}
            playerStats={playerStats}
            lineups={lineups}
            prematch={prematch}
          />
        </div>
      </div>
    </div>
  );
}
