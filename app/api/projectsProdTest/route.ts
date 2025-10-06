import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Types
interface OdooProject {
  id: number;
  name: string;
  tag_ids: number[];
  x_progress_project: number;
  date_start: string | false;
  date: string | false;
}

interface OdooResponse {
  result?: OdooProject[];
  error?: {
    data?: {
      message: string;
    };
  };
}

interface SubProject {
  id: number;
  code: string;
  division: string;
  progress: number;
  deadline: string | false;
  start_date: string | false;
}

interface GroupedProject {
  main_project: string;
  sub_projects: SubProject[];
}

export async function GET() {
  try {
    const apiKey = process.env.ODOO_API_KEY_PROD;
    
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
          'erbe', // db
          2, // uid
          apiKey, // password (API key)
          'project.project', // model
          'search_read', // method
          [ 
            [["stage_id", "!=", 4], ["name", "!=", "Internal"]]
          ],
          {
            fields: ['id', 'name', "tag_ids", "x_progress_project", "date_start", "date"],
            limit: 50,
            "order": "create_date asc"
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
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OdooResponse = await response.json();

    // Check for JSON-RPC error
    if (data.error) {
      return NextResponse.json(
        { error: data.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    console.dir(data.result, { depth: null });

    const dataProject = data.result || [];
    
    const tagMap: Record<number, string> = {
      1: "Construction",
      2: "Interior",
      3: "Design"
    };

    const grouped = dataProject.reduce<Record<string, GroupedProject>>((acc, item) => {
      // Amanin split supaya ga error
      const parts = item.name?.split(" - ") ?? [];
      const code = parts[0] || "Unknown";
      const mainName = (parts[1]?.replace(" (copy)", "").trim()) || item.name || "Untitled";

      if (!acc[mainName]) {
        acc[mainName] = {
          main_project: mainName,
          sub_projects: []
        };
      }

      acc[mainName].sub_projects.push({
        id: item.id,
        code,
        division: tagMap[item.tag_ids?.[0]] || "Unknown",
        progress: item.x_progress_project ?? 0,
        deadline: item.date,
        start_date: item.date_start,
      });

      return acc;
    }, {});

    // Ubah object ke array biar lebih gampang dipakai
    const result = Object.values(grouped);

    
    return NextResponse.json({
      success: true,
      projects: result
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}