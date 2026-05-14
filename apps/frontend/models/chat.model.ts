// MessageType re-exported from domain — values: 'REGULAR' | 'BET' | 'SYSTEM' | 'DONATION'
export { MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import { MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';

// SystemMessageType, BetType, and composite message interfaces have no equivalent
// in packages/domain (domain uses a flat ChatMessage entity with optional fields).
// They remain local until the chat feature is fully aligned with the domain model.

export enum SystemMessageType {
    MATCH_START = 'match_start',
    MATCH_END = 'match_end',
    GOAL = 'goal',
    USER_JOINED = 'user_joined',
    USER_LEFT = 'user_left',
    DONATION = 'donation',
    SUBSCRIPTION = 'subscription',
    BET_PLACED = 'bet'
}

export enum BetType {
    MATCH_WINNER = 'match_winner',
    OVER_UNDER = 'over_under',
    BOTH_TEAMS_SCORE = 'both_teams_score',
    DOUBLE_CHANCE = 'double_chance',
    DRAW_NO_BET = 'draw_no_bet',
    FIRST_HALF_WINNER = 'first_half_winner',
    FIRST_HALF_GOALS = 'first_half_goals',
    HT_FT = 'ht_ft',
    CORRECT_SCORE = 'correct_score',
    EXACT_GOALS_NUMBER = 'exact_goals_number',
    GOALSCORERS = 'goalscorers',
    CLEAN_SHEET = 'clean_sheet',
    WIN_TO_NIL = 'win_to_nil',
    HIGHEST_SCORING_HALF = 'highest_scoring_half',
    ODD_EVEN_GOALS = 'odd_even_goals',
    FIRST_HALF_ODD_EVEN = 'first_half_odd_even'
}

export interface ChatMessage {
    id: string;
    matchId: number;
    streamId?: string | null;
    userId: string;
    walletAddress: string;
    username: string;
    message: string;
    type: MessageType;
    createdAt: Date;
    updatedAt: Date;
    isFeatured?: boolean;
    systemEventType?: SystemMessageType;
}

export interface BetMessage extends ChatMessage {
    betType: BetType;
    betSubType?: string;
    betAmount: number;
    betOdds: number;
}

export interface SystemMessage extends ChatMessage {
    data?: unknown;
}
