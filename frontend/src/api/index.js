import axios from "axios";
import config from "../config/whitelabel";

const api = axios.create({ baseURL: config.apiBase });
const n8n = axios.create({ baseURL: config.n8nBase });

export const fetchLeagues = () => api.get("/leagues/");
export const fetchSeasons = (leagueId) =>
  api.get(`/leagues/${leagueId}/seasons`);
export const fetchRounds = (lsId) => api.get(`/league-seasons/${lsId}/rounds`);
export const fetchMatches = (lsId, round) =>
  api.get(
    `/matches/?league_season_id=${lsId}&round=${encodeURIComponent(round)}`,
  );
export const fetchMatch = (id) => api.get(`/matches/${id}`);
export const fetchEvents = (matchId) => api.get(`/events/?match_id=${matchId}`);
export const fetchTickerTexts = (matchId) =>
  api.get(`/ticker/match/${matchId}`);
export const fetchPrematch = (matchId) =>
  api.get(`/ticker/match/${matchId}/prematch`);
export const fetchLineups = (matchId) => api.get(`/lineups/match/${matchId}`);
export const fetchMatchStats = (matchId) =>
  api.get(`/match-statistics/match/${matchId}`);
export const fetchPlayerStats = (matchId) =>
  api.get(`/player-statistics/match/${matchId}`);
export const fetchFavorites = () => api.get(`/favorites/?user_id=1`);
export const fetchFavoriteMatches = () =>
  api.get(`/favorites/matches?user_id=1`);
export const fetchTodayMatches = () => api.get(`/matches/today`);
export const fetchLiveMatches = () => api.get(`/matches/live`);
export const generateTicker = (eventId, style) =>
  api.post(`/ticker/generate/${eventId}?style=${style}`);
export const addFavorite = (teamId) =>
  api.post(`/favorites`, { user_id: 1, team_id: teamId });
export const removeFavorite = (teamId) =>
  api.delete(`/favorites/${teamId}?user_id=1`);
export const importMatches = (leagueId, season, round) =>
  n8n.post("/import-matches", { league_id: leagueId, season, round });
export const createManualTicker = (matchId, text) =>
  api.post(`/ticker/manual`, { match_id: matchId, text });
