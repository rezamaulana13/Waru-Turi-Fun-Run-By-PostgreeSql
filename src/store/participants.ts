// src/store/participants.ts
import { writable } from 'svelte/store';
import type { Participant } from '../types';

export const participants = writable<{
  data: Participant[];
  loading: boolean;
  error: string | null;
}>({
  data: [],
  loading: false,
  error: null,
});

export async function fetchParticipants() {
  participants.update(state => ({ ...state, loading: true }));
  
  try {
    const response = await fetch('/api/participants');
    const data = await response.json();
    participants.set({ data, loading: false, error: null });
  } catch (error) {
    participants.update(state => ({ 
      ...state, 
      loading: false, 
      error: error.message 
    }));
  }
}

export async function deleteParticipant(id: number) {
  try {
    await fetch(`/api/participants/${id}`, { method: 'DELETE' });
    await fetchParticipants();
  } catch (error) {
    console.error('Delete failed:', error);
  }
}