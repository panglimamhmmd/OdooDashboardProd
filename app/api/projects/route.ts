import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.ODOO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const requestBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'erbe-trial5', // db
          2, // uid
          apiKey, // password (API key)
          'project.project', // model
          'search_read', // method
          [], // domain (empty)
          {
            fields: ['id', 'name' ,  "tag_ids" , "x_studio_related_field_1ur_1j3g3lopr" , "date_start" , "date"],
            limit: 5
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)

    // Check for JSON-RPC error
    if (data.error) {
      return NextResponse.json(
        { error: data.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: data.result || []
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}