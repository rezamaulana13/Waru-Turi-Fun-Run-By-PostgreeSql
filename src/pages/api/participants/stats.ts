import type { APIRoute } from 'astro';
import { getParticipantStats } from '../../../lib/participants';

export const GET: APIRoute = async () => {
  try {
    const stats = await getParticipantStats();
    return new Response(JSON.stringify({
      success: true,
      data: stats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
