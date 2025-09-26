  import { NextRequest, NextResponse } from 'next/server';

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
                [["stage_id", "!=", 4]]
            ], // domain (empty)
            {
              fields: ['id', 'name' ,  "tag_ids" ,"x_progress_project" , "date_start" , "date" ],
              limit: 10,
              "order": "create_date desc"
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

      const dataProject= data.result;
      const tagMap : any = {
        1: "Interior",
        2: "Construction",
        3: "Design"
      };
      const grouped = dataProject.reduce((acc: any, item: any) => {
        // amanin split supaya ga error
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
    
      // console.dir({result} , {depth: null})


      // Check for JSON-RPC error
      if (data.error) {
        return NextResponse.json(
          { error: data.error.data?.message || 'Odoo API error' },
          { status: 400 }
        );
      }


      return NextResponse.json({
        success: true,
        projects: result || []
      });

    } catch (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects from Odoo' },
        { status: 500 }
      );
    }
  }