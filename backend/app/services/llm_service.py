"""
LLM Service für Ticker-Text-Generierung.
Aktuell: Mock-Implementierung
Später: OpenAI/Claude API Integration
"""

from typing import Optional, Literal
import random


class LLMService:
    """Service für KI-gestützte Textgenerierung."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        provider: Literal["openai", "anthropic", "mock"] = "mock",
    ):
        """
        Args:
            api_key: API Key für OpenAI/Claude
            provider: 'openai', 'anthropic', oder 'mock'
        """
        self.provider = provider
        self.api_key = api_key

        if provider == "mock":
            print("⚠️  LLM Service läuft im MOCK-Modus")
        elif provider == "openai" and not api_key:
            raise ValueError("OpenAI API Key erforderlich")
        elif provider == "anthropic" and not api_key:
            raise ValueError("Anthropic API Key erforderlich")

    def generate_ticker_text(
        self,
        event_type: str,
        event_detail: str,
        minute: int,
        player_name: Optional[str] = None,
        assist_name: Optional[str] = None,
        team_name: Optional[str] = None,
        style: Literal["neutral", "euphorisch", "kritisch"] = "neutral",
        language: str = "de",
    ) -> str:
        """
        Generiert Liveticker-Text für ein Event.

        Args:
            event_type: 'Goal', 'Card', 'subst'
            event_detail: 'Normal Goal', 'Yellow Card', etc.
            minute: Spielminute
            player_name: Name des Spielers
            assist_name: Name des Vorlagengebers
            team_name: Name des Teams
            style: Schreibstil
            language: Sprache (de, en)

        Returns:
            Generierter Ticker-Text
        """
        if self.provider == "mock":
            return self._generate_mock_text(
                event_type,
                event_detail,
                minute,
                player_name,
                assist_name,
                team_name,
                style,
            )
        elif self.provider == "openai":
            return self._generate_openai_text(
                event_type,
                event_detail,
                minute,
                player_name,
                assist_name,
                team_name,
                style,
                language,
            )
        elif self.provider == "anthropic":
            return self._generate_claude_text(
                event_type,
                event_detail,
                minute,
                player_name,
                assist_name,
                team_name,
                style,
                language,
            )

    def _generate_mock_text(
        self,
        event_type: str,
        event_detail: str,
        minute: int,
        player_name: Optional[str],
        assist_name: Optional[str],
        team_name: Optional[str],
        style: str,
    ) -> str:
        """Mock-Implementierung mit Template-Texten."""

        # Goal Templates
        if event_type == "Goal":
            if style == "neutral":
                templates = [
                    f"Tor für {team_name}! {player_name} trifft in der {minute}. Minute.",
                    f"{minute}. Minute: {player_name} erzielt das Tor für {team_name}.",
                    f"Treffer! {player_name} bringt {team_name} in Führung.",
                ]
            elif style == "euphorisch":
                templates = [
                    f"TOOOOOOR! {player_name} mit einem Traumtor in der {minute}. Minute! Das Stadion tobt!",
                    f"WAHNSINN! {player_name} macht das Ding! {minute}. Minute - {team_name} jubelt!",
                    f"Unfassbar! {player_name} schießt {team_name} zum Sieg! {minute}. Minute!",
                ]
            else:  # kritisch
                templates = [
                    f"{minute}. Minute: {player_name} trifft. Die Abwehr hatte geschlafen.",
                    f"Tor durch {player_name} - das hätte verhindert werden müssen.",
                    f"{player_name} nutzt den Fehler der Defensive. {minute}. Minute.",
                ]

            text = random.choice(templates)
            if assist_name and assist_name != "null":
                text += f" Vorlage: {assist_name}."
            return text

        # Card Templates
        elif event_type == "Card":
            if event_detail == "Yellow Card":
                if style == "neutral":
                    return f"{minute}. Minute: Gelbe Karte für {player_name}."
                elif style == "euphorisch":
                    return (
                        f"{minute}. Minute: {player_name} sieht Gelb - das war unnötig!"
                    )
                else:
                    return f"Gelb für {player_name} ({minute}') - vollkommen berechtigt nach diesem Foul."
            else:  # Red Card
                return f"🔴 ROTE KARTE! {player_name} muss vom Platz! {minute}. Minute."

        # Substitution Templates
        elif event_type == "subst":
            if style == "neutral":
                return f"{minute}. Minute: Wechsel bei {team_name}. {player_name} kommt für {assist_name}."
            elif style == "euphorisch":
                return f"Frische Kräfte! {player_name} kommt für {assist_name}. Kann er den entscheidenden Impuls setzen?"
            else:
                return f"Wechsel ({minute}'): {player_name} für {assist_name} - eine fragwürdige Entscheidung."

        return f"{minute}. Minute: {event_type} - {event_detail}"

    def _generate_openai_text(
        self,
        event_type: str,
        event_detail: str,
        minute: int,
        player_name: Optional[str],
        assist_name: Optional[str],
        team_name: Optional[str],
        style: str,
        language: str,
    ) -> str:
        """OpenAI GPT-4 Integration (TODO)."""
        # TODO: Implementierung mit openai SDK
        raise NotImplementedError("OpenAI Integration noch nicht implementiert")

    def _generate_claude_text(
        self,
        event_type: str,
        event_detail: str,
        minute: int,
        player_name: Optional[str],
        assist_name: Optional[str],
        team_name: Optional[str],
        style: str,
        language: str,
    ) -> str:
        """Claude (Anthropic) Integration (TODO)."""
        # TODO: Implementierung mit anthropic SDK
        raise NotImplementedError("Claude Integration noch nicht implementiert")


# Singleton Instance
llm_service = LLMService(provider="mock")
