import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.ODOO_API_KEY_PROD;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 1. Fetch projects dulu
    const projectsRequestBody = {
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
            [
              ["stage_id", "!=", 4],
              ["name", "!=", "Internal"],
              ["name", "!=", "Padelio"],
              ["tag_ids", "in", [3]]
            ]
          ],
          {
            fields: ['id', 'name', 'tag_ids', 'x_progress_project', 'task_ids'],
            limit: 100,
            order: "create_date asc"
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const projectsResponse = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectsRequestBody),
      cache: 'no-store',
    });

    if (!projectsResponse.ok) {
      throw new Error(`HTTP error! status: ${projectsResponse.status}`);
    }

    const projectsData = await projectsResponse.json();

    if (projectsData.error) {
      return NextResponse.json(
        { error: projectsData.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const projects = projectsData.result || [];

    // 2. Collect semua task IDs
    const allTaskIds = projects.flatMap((p: any) => p.task_ids || []);

    // Kalau tidak ada tasks, return projects aja
    if (allTaskIds.length === 0) {
      return NextResponse.json({
        success: true,
        projects: projects.map((p: any) => ({ ...p, currentTask: null }))
      });
    }

    // 3. Fetch detail semua tasks sekaligus
    const tasksRequestBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'erbe',
          2,
          apiKey,
          'project.task', // model task
          'read', // method read (bukan search_read karena sudah punya IDs)
          [
            allTaskIds // array of task IDs
          ],
          {
            fields: ['id', 'name', 'project_id', 'x_studio_persentase']
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const tasksResponse = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tasksRequestBody),
      cache: 'no-store',
    });

    if (!tasksResponse.ok) {
      throw new Error(`HTTP error fetching tasks! status: ${tasksResponse.status}`);
    }

    const tasksData = await tasksResponse.json();

    if (tasksData.error) {
      console.error('Error fetching tasks:', tasksData.error);
      // Kalau error fetch tasks, return projects tanpa tasks
      return NextResponse.json({
        success: true,
        projects: projects.map((p: any) => ({ ...p, currentTask: null }))
      });
    }

    const tasks = tasksData.result || [];

    // 4. Filter tasks yang belum 100% dan group by project_id
    const tasksByProjectId: Record<number, any[]> = {};
    tasks.forEach((task: any) => {
      // Filter: hanya ambil task yang belum 100%
      if (task.x_studio_persentase < 100) {
        const projectId = Array.isArray(task.project_id) ? task.project_id[0] : task.project_id;
        if (!tasksByProjectId[projectId]) {
          tasksByProjectId[projectId] = [];
        }
        tasksByProjectId[projectId].push(task);
      }
    });

    // 5. Untuk setiap project, ambil task dengan ID terkecil (stage paling awal)
    const projectsWithCurrentTask = projects.map((project: any) => {
      const projectTasks = tasksByProjectId[project.id] || [];
      
      // Sort by ID ascending dan ambil yang pertama (ID terkecil)
      const currentTask = projectTasks.length > 0
        ? projectTasks.sort((a, b) => a.id - b.id)[0]
        : null;

      return {
        ...project,
        currentTask: currentTask
      };
    });

    console.dir(projectsWithCurrentTask, { depth: null });
    console.log(`Fetched ${projectsWithCurrentTask.length} projects with their current tasks.`);
    
    return NextResponse.json({
      success: true,
      projects: projectsWithCurrentTask
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}