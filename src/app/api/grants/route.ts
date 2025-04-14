import _ from 'lodash';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel Edge Functions

export type GrantRow = {
  uuid: string;
  title: string;
  description?: string;
  projectImage?: string;
  address: string;
};

const getUuidFromUrlOrUuid = (urlOrUuid: string) => {
  // UUID v4 regex pattern
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Check if input is already a UUID
  if (uuidPattern.test(urlOrUuid)) {
    return urlOrUuid;
  }

  try {
    // Try to parse as URL and get last segment
    const url = new URL(urlOrUuid);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Check if last segment is UUID
    if (lastSegment && uuidPattern.test(lastSegment)) {
      return lastSegment;
    }
  } catch (e) {
    console.error(e);
  }

  return null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = 3,
) => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 503) {
        // Calculate exponential backoff delay (1s, 2s, 4s, etc.)
        const delay = 2 ** i * 1000;
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) throw error;
    }
  }

  throw lastError;
};

export async function GET(req: NextRequest) {
  const __ = cookies();
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        message: 'API key is not set',
      },
      {
        status: 500,
      },
    );
  }
  if (!sheetId) {
    return Response.json(
      {
        success: false,
        message: 'Sheet ID is not set',
      },
      {
        status: 500,
      },
    );
  }

  const headers = {
    'X-goog-api-key': apiKey,
  };

  try {
    // Fetch sheet names with retry logic
    const sheetNamesResponse = await fetchWithRetry(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`,
      { headers },
    );
    const sheetNames = await sheetNamesResponse.json();
    const title: string = sheetNames?.sheets[0]?.properties?.title;

    if (!title) {
      return Response.json(
        {
          success: false,
          message: 'Sheet title is not set',
        },
        {
          status: 500,
        },
      );
    }

    // Fetch sheet values with retry logic and optimized range
    const response = await fetchWithRetry(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${title}!A:E`,
      { headers },
    );
    const result = await response.json();

    const [header, ...rows] = result.values as string[][];
    const grants = _.chain(rows)
      .map((row) =>
        row.reduce(
          (acc, curr, index) => {
            acc[header[index].toLowerCase()] = curr;
            return acc;
          },
          {} as Record<string, string>,
        ),
      )
      .map(
        (grant) =>
          ({
            uuid: getUuidFromUrlOrUuid(grant.uuid),
            title: grant.title,
            description: grant.description,
            projectImage: grant.image,
            address: grant.address,
          }) as GrantRow,
      )
      .filter((grant) => !!grant.uuid)
      // If there are duplicates by (uuid, address), keep the bottom row
      .reverse()
      .uniqBy((grant) => `${grant.uuid}-${grant.address}`)
      .value();

    return Response.json(
      {
        data: grants,
        success: true,
        message: 'Grants fetched successfully',
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error fetching grants:', error);
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch grants',
      },
      {
        status: 503,
      },
    );
  }
}
