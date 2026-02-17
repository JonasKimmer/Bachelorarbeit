import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./LiveTicker.css";

function Liveticker() {
  console.log("🔄 Component Render");

  // State
  const [activeTab, setActiveTab] = useState("ligen");
  const [leagues, setLeagues] = useState([]);
  const [leagueSeasons, setLeagueSeasons] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickerTexts, setTickerTexts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);

  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [selectedLeagueSeasonId, setSelectedLeagueSeasonId] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [match, setMatch] = useState(null);

  const [generatingEventId, setGeneratingEventId] = useState(null);

  // DEBUG
  console.log("State:", {
    leagues: leagues.length,
    leagueSeasons: leagueSeasons.length,
    matches: matches.length,
    selectedLeagueId,
    selectedLeagueSeasonId,
    selectedMatchId,
    match: match?.id,
  });

  // ==================== LOAD DATA ====================

  const loadLeagues = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/leagues");
      setLeagues(response.data);

      if (response.data.length > 0 && !selectedLeagueId) {
        setSelectedLeagueId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading leagues:", error);
    }
  }, [selectedLeagueId]);

  const loadSeasons = useCallback(async (leagueId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/leagues/${leagueId}/seasons`,
      );
      setLeagueSeasons(response.data);

      const currentSeason = response.data.find((ls) => ls.season.current);
      if (currentSeason) {
        setSelectedLeagueSeasonId(currentSeason.id);
      } else if (response.data.length > 0) {
        setSelectedLeagueSeasonId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading seasons:", error);
    }
  }, []);

  const loadRounds = useCallback(
    async (leagueSeasonId) => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/league-seasons/${leagueSeasonId}/rounds`,
        );
        setRounds(response.data);

        if (response.data.length > 0 && !selectedRound) {
          setSelectedRound(response.data[0]);
        }
      } catch (error) {
        console.error("Error loading rounds:", error);
      }
    },
    [selectedRound],
  );

  const loadMatches = useCallback(
    async (leagueSeasonId, round = null) => {
      try {
        let url = `http://localhost:8000/api/v1/matches?league_season_id=${leagueSeasonId}`;
        if (round) {
          url += `&round=${round}`;
        }

        const response = await axios.get(url);
        setMatches(response.data);

        if (response.data.length > 0 && !selectedMatchId) {
          setSelectedMatchId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error loading matches:", error);
      }
    },
    [selectedMatchId],
  );

  const loadTodayMatches = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/matches/today",
      );
      setMatches(response.data);

      if (response.data.length > 0) {
        setSelectedMatchId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading today's matches:", error);
    }
  }, []);

  const loadLiveMatches = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/matches/live",
      );
      setMatches(response.data);

      if (response.data.length > 0) {
        setSelectedMatchId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading live matches:", error);
    }
  }, []);

  const loadFavoriteMatches = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/favorites/matches?user_id=1",
      );
      setMatches(response.data);

      if (response.data.length > 0) {
        setSelectedMatchId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading favorite matches:", error);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/favorites?user_id=1",
      );
      setFavorites(response.data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/teams");
      setTeams(response.data);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  }, []);

  const loadMatch = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/matches/${selectedMatchId}`,
      );
      setMatch(response.data);
    } catch (error) {
      console.error("Error loading match:", error);
    }
  }, [selectedMatchId]);

  const loadEvents = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/events?match_id=${selectedMatchId}`,
      );
      setEvents(response.data.reverse());
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }, [selectedMatchId]);

  const loadTickerTexts = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/ticker/match/${selectedMatchId}`,
      );
      setTickerTexts(response.data);
    } catch (error) {
      console.error("Error loading ticker texts:", error);
    }
  }, [selectedMatchId]);

  const loadLineups = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/lineups/match/${selectedMatchId}`,
      );
      setLineups(response.data);
    } catch (error) {
      console.error("Error loading lineups:", error);
    }
  }, [selectedMatchId]);

  const loadMatchStats = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/match-statistics/match/${selectedMatchId}`,
      );
      setMatchStats(response.data);
    } catch (error) {
      console.error("Error loading match statistics:", error);
    }
  }, [selectedMatchId]);

  const loadPlayerStats = useCallback(async () => {
    if (!selectedMatchId) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/player-statistics/match/${selectedMatchId}`,
      );
      setPlayerStats(response.data);
    } catch (error) {
      console.error("Error loading player statistics:", error);
    }
  }, [selectedMatchId]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadLeagues();
    loadTeams();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLeagueId) {
      loadSeasons(selectedLeagueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueSeasonId) {
      loadRounds(selectedLeagueSeasonId);
      loadMatches(selectedLeagueSeasonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueSeasonId]);

  useEffect(() => {
    if (selectedLeagueSeasonId && selectedRound) {
      loadMatches(selectedLeagueSeasonId, selectedRound);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRound]);

  useEffect(() => {
    if (selectedMatchId) {
      loadMatch();
      loadEvents();
      loadTickerTexts();
      loadLineups();
      loadMatchStats();
      loadPlayerStats();

      const interval = setInterval(() => {
        loadEvents();
        loadTickerTexts();
      }, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatchId]);

  useEffect(() => {
    if (activeTab === "heute") {
      loadTodayMatches();
    } else if (activeTab === "live") {
      loadLiveMatches();
      const interval = setInterval(loadLiveMatches, 10000);
      return () => clearInterval(interval);
    } else if (activeTab === "favoriten") {
      loadFavoriteMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ==================== HANDLERS ====================

  const handleLeagueChange = (leagueId) => {
    setSelectedLeagueId(parseInt(leagueId));
    setSelectedLeagueSeasonId(null);
    setSelectedRound(null);
    setSelectedMatchId(null);
  };

  const handleSeasonChange = (leagueSeasonId) => {
    setSelectedLeagueSeasonId(parseInt(leagueSeasonId));
    setSelectedRound(null);
    setSelectedMatchId(null);
  };

  const handleRoundChange = (round) => {
    setSelectedRound(round);
    setSelectedMatchId(null);
  };

  const handleMatchChange = (matchId) => {
    setSelectedMatchId(parseInt(matchId));
  };

  const generateTickerText = async (eventId, style = "neutral") => {
    setGeneratingEventId(eventId);
    try {
      await axios.post(
        `http://localhost:8000/api/v1/ticker/generate/${eventId}?style=${style}`,
      );
      await loadTickerTexts();
    } catch (error) {
      console.error("Error generating ticker text:", error);
      alert("Fehler bei der Ticker-Generierung");
    } finally {
      setGeneratingEventId(null);
    }
  };

  const toggleFavorite = async (teamId) => {
    const isFavorite = favorites.some((fav) => fav.team_id === teamId);

    try {
      if (isFavorite) {
        await axios.delete(
          `http://localhost:8000/api/v1/favorites/${teamId}?user_id=1`,
        );
      } else {
        await axios.post("http://localhost:8000/api/v1/favorites", {
          user_id: 1,
          team_id: teamId,
        });
      }
      loadFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // ==================== HELPERS ====================

  const getEventIcon = (type) => {
    if (type === "Goal") return "⚽";
    if (type === "Card") return "🟨";
    if (type === "subst") return "🔄";
    return "•";
  };

  const getEventText = (event) => {
    if (event.type === "Goal") {
      let text = `Tor! ${event.player_name}`;
      if (event.assist_name && event.assist_name !== "null") {
        text += ` (Vorlage: ${event.assist_name})`;
      }
      return text;
    }
    if (event.type === "Card") {
      return `${event.detail} für ${event.player_name}`;
    }
    if (event.type === "subst") {
      return `Wechsel: ${event.player_name} für ${event.assist_name}`;
    }
    return event.detail;
  };

  const getTickerTextForEvent = (eventId) => {
    return tickerTexts.find((t) => t.event_id === eventId);
  };

  const getCurrentLeagueSeason = () => {
    return leagueSeasons.find((ls) => ls.id === selectedLeagueSeasonId);
  };

  // ==================== RENDER ====================

  return (
    <div className="liveticker">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === "favoriten" ? "active" : ""}
          onClick={() => setActiveTab("favoriten")}
        >
          ⭐ Favoriten
        </button>
        <button
          className={activeTab === "ligen" ? "active" : ""}
          onClick={() => setActiveTab("ligen")}
        >
          🌍 Ligen
        </button>
        <button
          className={activeTab === "heute" ? "active" : ""}
          onClick={() => setActiveTab("heute")}
        >
          📅 Heute
        </button>
        <button
          className={activeTab === "live" ? "active" : ""}
          onClick={() => setActiveTab("live")}
        >
          🔴 Live
        </button>
      </div>

      {/* Navigation based on Tab */}
      {activeTab === "ligen" && (
        <div className="navigation">
          <div className="dropdown-container">
            <label>Liga:</label>
            <select
              value={selectedLeagueId || ""}
              onChange={(e) => handleLeagueChange(e.target.value)}
              className="dropdown"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label>Season:</label>
            <select
              value={selectedLeagueSeasonId || ""}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="dropdown"
            >
              {leagueSeasons.map((ls) => (
                <option key={ls.id} value={ls.id}>
                  {ls.season.year}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label>Spieltag:</label>
            <select
              value={selectedRound || ""}
              onChange={(e) => handleRoundChange(e.target.value)}
              className="dropdown"
            >
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label>Spiel:</label>
            <select
              value={selectedMatchId || ""}
              onChange={(e) => handleMatchChange(e.target.value)}
              className="dropdown"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team.name} vs {m.away_team.name} ({m.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {(activeTab === "heute" ||
        activeTab === "live" ||
        activeTab === "favoriten") && (
        <div className="navigation">
          <div className="dropdown-container">
            <label>Spiel:</label>
            <select
              value={selectedMatchId || ""}
              onChange={(e) => handleMatchChange(e.target.value)}
              className="dropdown"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team.name} vs {m.away_team.name} ({m.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Match Header */}
      {match && (
        <div className="match-header">
          <div className="teams">
            <div className="team">
              {match.home_team.name}
              <button
                className="favorite-btn"
                onClick={() => toggleFavorite(match.home_team_id)}
              >
                {favorites.some((f) => f.team_id === match.home_team_id)
                  ? "⭐"
                  : "☆"}
              </button>
            </div>
            <div className="score">
              {match.score_home} : {match.score_away}
            </div>
            <div className="team">
              {match.away_team.name}
              <button
                className="favorite-btn"
                onClick={() => toggleFavorite(match.away_team_id)}
              >
                {favorites.some((f) => f.team_id === match.away_team_id)
                  ? "⭐"
                  : "☆"}
              </button>
            </div>
          </div>
          <div className="match-info">
            {getCurrentLeagueSeason()?.league.name}{" "}
            {getCurrentLeagueSeason()?.season.year} - {match.round} -{" "}
            {match.status}
          </div>
        </div>
      )}

      {/* No Match Selected */}
      {!match && matches.length === 0 && selectedLeagueSeasonId && (
        <div className="no-events">
          Keine Matches gefunden - bitte Daten via n8n importieren!
        </div>
      )}

      {!match && matches.length > 0 && (
        <div className="no-events">Bitte wähle ein Match aus</div>
      )}

      {/* Lineups */}
      {match && lineups.length > 0 && (
        <div className="lineups-section">
          <h3>📋 Aufstellungen</h3>

          <div className="lineups-grid">
            {/* Home Team */}
            <div className="lineup-column">
              <h4>{match.home_team.name}</h4>
              {(() => {
                const homeLineup = lineups.filter(
                  (l) => l.team_id === match.home_team_id && !l.is_substitute,
                );
                const formation = homeLineup[0]?.formation;

                return (
                  <>
                    {formation && (
                      <div className="formation">🔢 Formation: {formation}</div>
                    )}
                    <div className="starting-xi">
                      <strong>Startelf:</strong>
                      <ul>
                        {homeLineup.map((player) => (
                          <li key={player.id}>
                            #{player.number} {player.player_name} (
                            {player.position})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="substitutes">
                      <strong>Ersatzbank:</strong>
                      <ul>
                        {lineups
                          .filter(
                            (l) =>
                              l.team_id === match.home_team_id &&
                              l.is_substitute,
                          )
                          .map((player) => (
                            <li key={player.id}>
                              #{player.number} {player.player_name} (
                              {player.position})
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Away Team */}
            <div className="lineup-column">
              <h4>{match.away_team.name}</h4>
              {(() => {
                const awayLineup = lineups.filter(
                  (l) => l.team_id === match.away_team_id && !l.is_substitute,
                );
                const formation = awayLineup[0]?.formation;

                return (
                  <>
                    {formation && (
                      <div className="formation">🔢 Formation: {formation}</div>
                    )}
                    <div className="starting-xi">
                      <strong>Startelf:</strong>
                      <ul>
                        {awayLineup.map((player) => (
                          <li key={player.id}>
                            #{player.number} {player.player_name} (
                            {player.position})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="substitutes">
                      <strong>Ersatzbank:</strong>
                      <ul>
                        {lineups
                          .filter(
                            (l) =>
                              l.team_id === match.away_team_id &&
                              l.is_substitute,
                          )
                          .map((player) => (
                            <li key={player.id}>
                              #{player.number} {player.player_name} (
                              {player.position})
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Match Statistics */}
      {match && matchStats.length > 0 && (
        <div className="match-stats-section">
          <h3>📊 Spielstatistiken</h3>

          <div className="stats-grid">
            {/* Home Team Stats */}
            {(() => {
              const homeStats = matchStats.find(
                (s) => s.team_id === match.home_team_id,
              );
              const awayStats = matchStats.find(
                (s) => s.team_id === match.away_team_id,
              );

              if (!homeStats || !awayStats) return null;

              return (
                <>
                  {/* Ballbesitz */}
                  <div className="stat-row">
                    <div className="stat-value">
                      {homeStats.ball_possession}%
                    </div>
                    <div className="stat-label">Ballbesitz</div>
                    <div className="stat-value">
                      {awayStats.ball_possession}%
                    </div>
                  </div>

                  {/* Ballbesitz Bar */}
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar home"
                      style={{ width: `${homeStats.ball_possession}%` }}
                    />
                    <div
                      className="stat-bar away"
                      style={{ width: `${awayStats.ball_possession}%` }}
                    />
                  </div>

                  {/* Schüsse */}
                  <div className="stat-row">
                    <div className="stat-value">{homeStats.total_shots}</div>
                    <div className="stat-label">Schüsse gesamt</div>
                    <div className="stat-value">{awayStats.total_shots}</div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">{homeStats.shots_on_goal}</div>
                    <div className="stat-label">Schüsse aufs Tor</div>
                    <div className="stat-value">{awayStats.shots_on_goal}</div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">
                      {homeStats.shots_insidebox}
                    </div>
                    <div className="stat-label">Schüsse im Strafraum</div>
                    <div className="stat-value">
                      {awayStats.shots_insidebox}
                    </div>
                  </div>

                  {/* Pässe */}
                  <div className="stat-row">
                    <div className="stat-value">
                      {homeStats.passes_accurate}/{homeStats.total_passes}
                    </div>
                    <div className="stat-label">Pässe (präzise/gesamt)</div>
                    <div className="stat-value">
                      {awayStats.passes_accurate}/{awayStats.total_passes}
                    </div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">
                      {homeStats.passes_percentage}%
                    </div>
                    <div className="stat-label">Passgenauigkeit</div>
                    <div className="stat-value">
                      {awayStats.passes_percentage}%
                    </div>
                  </div>

                  {/* Weitere Stats */}
                  <div className="stat-row">
                    <div className="stat-value">{homeStats.corner_kicks}</div>
                    <div className="stat-label">Ecken</div>
                    <div className="stat-value">{awayStats.corner_kicks}</div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">{homeStats.fouls}</div>
                    <div className="stat-label">Fouls</div>
                    <div className="stat-value">{awayStats.fouls}</div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">{homeStats.offsides}</div>
                    <div className="stat-label">Abseits</div>
                    <div className="stat-value">{awayStats.offsides}</div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-value">{homeStats.yellow_cards}</div>
                    <div className="stat-label">Gelbe Karten</div>
                    <div className="stat-value">{awayStats.yellow_cards}</div>
                  </div>

                  {(homeStats.red_cards > 0 || awayStats.red_cards > 0) && (
                    <div className="stat-row">
                      <div className="stat-value">{homeStats.red_cards}</div>
                      <div className="stat-label">Rote Karten</div>
                      <div className="stat-value">{awayStats.red_cards}</div>
                    </div>
                  )}

                  <div className="stat-row">
                    <div className="stat-value">
                      {homeStats.goalkeeper_saves}
                    </div>
                    <div className="stat-label">Paraden</div>
                    <div className="stat-value">
                      {awayStats.goalkeeper_saves}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Player Statistics - Top Spieler */}
      {match && playerStats.length > 0 && (
        <div className="player-stats-section">
          <h3>⭐ Beste Spieler</h3>

          <div className="top-players">
            {playerStats
              .filter((p) => p.rating !== null && p.rating > 0)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((player, idx) => (
                <div key={player.id} className="top-player-card">
                  <div className="player-rank">#{idx + 1}</div>

                  <div className="player-main">
                    <div className="player-header">
                      <div className="player-name-container">
                        <span className="player-name">
                          {player.player_name}
                        </span>
                        {player.captain && (
                          <span className="captain-badge">©</span>
                        )}
                      </div>
                      <div className="player-meta">
                        {player.position} • #{player.number} •{" "}
                        {player.minutes_played}'
                      </div>
                    </div>

                    <div className="player-rating">
                      <span className="rating-value">{player.rating}</span>
                      <span className="rating-label">Rating</span>
                    </div>
                  </div>

                  <div className="player-stats-summary">
                    {player.goals_total > 0 && (
                      <div className="stat-badge goals">
                        <span className="stat-icon">⚽</span>
                        <span className="stat-value">{player.goals_total}</span>
                      </div>
                    )}
                    {player.goals_assists > 0 && (
                      <div className="stat-badge assists">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-value">
                          {player.goals_assists}
                        </span>
                      </div>
                    )}
                    {player.shots_on > 0 && (
                      <div className="stat-badge shots">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-value">
                          {player.shots_on}/{player.shots_total}
                        </span>
                        <span className="stat-label">Schüsse</span>
                      </div>
                    )}
                    {player.passes_accuracy > 0 && (
                      <div className="stat-badge passes">
                        <span className="stat-icon">⚡</span>
                        <span className="stat-value">
                          {player.passes_accuracy}%
                        </span>
                        <span className="stat-label">Pässe</span>
                      </div>
                    )}
                    {player.cards_yellow > 0 && (
                      <div className="stat-badge yellow">
                        <span className="stat-icon">🟨</span>
                        <span className="stat-value">
                          {player.cards_yellow}
                        </span>
                      </div>
                    )}
                    {player.cards_red > 0 && (
                      <div className="stat-badge red">
                        <span className="stat-icon">🟥</span>
                        <span className="stat-value">{player.cards_red}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Detaillierte Team-Statistiken (optional, ausklappbar) */}
          <details className="team-player-stats">
            <summary>📊 Alle Spieler-Statistiken</summary>

            <div className="teams-stats-grid">
              {/* Home Team */}
              {(() => {
                const homePlayers = playerStats
                  .filter((p) => p.team_id === match.home_team_id)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0));

                return (
                  <div className="team-stats-section">
                    <h4>{match.home_team.name}</h4>

                    <table className="players-table">
                      <thead>
                        <tr>
                          <th>Spieler</th>
                          <th>Pos</th>
                          <th>Min</th>
                          <th>Rating</th>
                          <th>⚽</th>
                          <th>🎯</th>
                          <th>Pässe</th>
                          <th>🟨</th>
                        </tr>
                      </thead>
                      <tbody>
                        {homePlayers.map((player) => (
                          <tr
                            key={player.id}
                            className={player.substitute ? "substitute" : ""}
                          >
                            <td>
                              {player.player_name}
                              {player.captain && (
                                <span className="captain-icon">©</span>
                              )}
                            </td>
                            <td>{player.position}</td>
                            <td>{player.minutes_played}'</td>
                            <td className="rating-cell">
                              {player.rating || "-"}
                            </td>
                            <td>{player.goals_total || "-"}</td>
                            <td>{player.goals_assists || "-"}</td>
                            <td>
                              {player.passes_total
                                ? `${player.passes_accuracy}%`
                                : "-"}
                            </td>
                            <td>{player.cards_yellow || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* Away Team */}
              {(() => {
                const awayPlayers = playerStats
                  .filter((p) => p.team_id === match.away_team_id)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0));

                return (
                  <div className="team-stats-section">
                    <h4>{match.away_team.name}</h4>

                    <table className="players-table">
                      <thead>
                        <tr>
                          <th>Spieler</th>
                          <th>Pos</th>
                          <th>Min</th>
                          <th>Rating</th>
                          <th>⚽</th>
                          <th>🎯</th>
                          <th>Pässe</th>
                          <th>🟨</th>
                        </tr>
                      </thead>
                      <tbody>
                        {awayPlayers.map((player) => (
                          <tr
                            key={player.id}
                            className={player.substitute ? "substitute" : ""}
                          >
                            <td>
                              {player.player_name}
                              {player.captain && (
                                <span className="captain-icon">©</span>
                              )}
                            </td>
                            <td>{player.position}</td>
                            <td>{player.minutes_played}'</td>
                            <td className="rating-cell">
                              {player.rating || "-"}
                            </td>
                            <td>{player.goals_total || "-"}</td>
                            <td>{player.goals_assists || "-"}</td>
                            <td>
                              {player.passes_total
                                ? `${player.passes_accuracy}%`
                                : "-"}
                            </td>
                            <td>{player.cards_yellow || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </details>
        </div>
      )}

      {/* Events */}
      {match && (
        <div className="events-container">
          {events.length === 0 ? (
            <div className="no-events">Keine Events für dieses Spiel</div>
          ) : (
            events.map((event) => {
              const tickerText = getTickerTextForEvent(event.id);

              return (
                <div
                  key={event.id}
                  className={`event event-${event.type.toLowerCase()}`}
                >
                  <div className="event-minute">{event.minute}'</div>
                  <div className="event-icon">{getEventIcon(event.type)}</div>

                  <div className="event-content">
                    {tickerText ? (
                      <div className="ticker-text-container">
                        <div className="ticker-text">{tickerText.text}</div>
                        <div className="ticker-meta">
                          {tickerText.style} | {tickerText.llm_model}
                        </div>
                      </div>
                    ) : (
                      <div className="event-text">{getEventText(event)}</div>
                    )}

                    {!tickerText && (
                      <div className="generate-buttons">
                        <button
                          onClick={() =>
                            generateTickerText(event.id, "neutral")
                          }
                          disabled={generatingEventId === event.id}
                          className="generate-btn"
                        >
                          {generatingEventId === event.id
                            ? "..."
                            : "📝 Neutral"}
                        </button>
                        <button
                          onClick={() =>
                            generateTickerText(event.id, "euphorisch")
                          }
                          disabled={generatingEventId === event.id}
                          className="generate-btn"
                        >
                          {generatingEventId === event.id
                            ? "..."
                            : "🎉 Euphorisch"}
                        </button>
                        <button
                          onClick={() =>
                            generateTickerText(event.id, "kritisch")
                          }
                          disabled={generatingEventId === event.id}
                          className="generate-btn"
                        >
                          {generatingEventId === event.id
                            ? "..."
                            : "🔍 Kritisch"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Liveticker;
