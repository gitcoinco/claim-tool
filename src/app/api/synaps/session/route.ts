import type { NextRequest } from 'next/server';

const getSessionId = async (alias: string) => {
  const apiKey = process.env.SYNAPS_API_KEY_PER_WHITELABEL?.split(',')
    .find((key) => key.includes(alias))
    ?.split(':')[1];
  console.log('apiKey', apiKey);
  if (!apiKey) {
    return null;
  }
  const response = await fetch('https://api.synaps.io/v4/session/init', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      alias,
    }),
  });
  const data = await response.json();
  console.log('data', data);
  return data.session_id as string | null;
};

export type ResponseData = {
  data: {
    sessionId: string;
  };
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { alias } = body as {
    alias: string;
  };

  const sessionId = await getSessionId(alias);

  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: 'failed to initialize session' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify(sessionId), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
