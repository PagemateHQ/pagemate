import { atom } from 'jotai';
import { ChatMessage } from './views/ChatView';

export const currentViewAtom = atom<'intro' | 'chat'>('intro');
export const messagesAtom = atom<ChatMessage[]>([]);
export const loadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
// If true, ChatView suppresses ACTION parsing even for the last message.
export const suppressActionParsingAtom = atom<boolean>(false);
