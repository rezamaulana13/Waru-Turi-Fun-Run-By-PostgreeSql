import type { APIRoute } from 'astro';
import { getParticipantById, updateParticipant, deleteParticipant } from '../../../lib/participants';

export const GET: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '0');
  const data = await getParticipantById(id);
  return new Response(JSON.stringify(data[0]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const id = parseInt(params.id || '0');
  const body = await request.json();
  const data = await updateParticipant(id, body);
  return new Response(JSON.stringify({ success: true, data: data[0] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '0');
  await deleteParticipant(id);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};