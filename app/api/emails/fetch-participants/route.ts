import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Fetch participants from Google Sheet
 * Extracts participant names and emails from a public Google Sheet
 */
export async function POST(request: NextRequest) {
  try {
    const { sheetUrl } = await request.json();

    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheet URL is required' },
        { status: 400 }
      );
    }

    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Google Sheet URL' },
        { status: 400 }
      );
    }

    const sheetId = sheetIdMatch[1];

    // Construct CSV export URL for the first sheet
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    // Fetch the CSV data
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Google Sheet. Make sure the sheet is publicly accessible.' },
        { status: 400 }
      );
    }

    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Sheet is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Get headers (first row)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    // Find name and email column indices
    const nameIndex = headers.findIndex(h => 
      h.includes('name') || h.includes('participant') || h.includes('leader')
    );
    const emailIndex = headers.findIndex(h => 
      h.includes('email') || h.includes('mail')
    );

    if (nameIndex === -1 || emailIndex === -1) {
      return NextResponse.json(
        { 
          error: 'Could not find Name and Email columns. Please ensure your sheet has columns named "Name" and "Email"',
          headers: headers 
        },
        { status: 400 }
      );
    }

    // Parse participant data
    const participants = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      const name = row[nameIndex]?.trim();
      const email = row[emailIndex]?.trim();

      if (name && email && email.includes('@')) {
        participants.push({ name, email });
      }
    }

    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'No valid participants found. Make sure your sheet has Name and Email columns with valid data.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      participants,
      count: participants.length
    });

  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants from Google Sheet' },
      { status: 500 }
    );
  }
}
