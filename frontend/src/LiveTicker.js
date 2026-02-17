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
