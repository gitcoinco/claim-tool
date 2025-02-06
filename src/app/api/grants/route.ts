import _ from 'lodash';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  const __ = cookies();
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!apiKey) {
    return Response.json({
      success: false,
      message: 'API key is not set',
    });
  }
  if (!sheetId) {
    return Response.json({
      success: false,
      message: 'Sheet ID is not set',
    });
  }

  // Fetch sheet names
  const sheetNamesResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?&fields=sheets.properties`,
    {
      headers: {
        'X-goog-api-key': apiKey,
      },
    },
  );
  const sheetNames = await sheetNamesResponse.json();
  const title: string = sheetNames?.sheets[0]?.properties?.title;
  if (!title) {
    return Response.json({
      success: false,
      message: 'Sheet title is not set',
    });
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${title}`,
    {
      headers: {
        'X-goog-api-key': apiKey,
      },
    },
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

  return Response.json({
    data: grants,
    success: true,
    message: 'Grants fetched successfully',
  });
}
