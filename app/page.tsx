'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Folder, RefreshCw } from 'lucide-react';

interface Project {
  id: number;
  name: string;
}

interface ApiResponse {
  success: boolean;
  projects: Project[];
  error?: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/projects');
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      if (data.success) {
        setProjects(data.projects);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = () => {
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Odoo Projects
          </h1>
          <p className="text-slate-600 text-lg">
            Fetched from Odoo JSON-RPC API
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Project List
            </CardTitle>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 flex-1" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error loading projects</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Check your Odoo configuration or API key.</p>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-mono">
                        ID: {project.id}
                      </Badge>
                      <h3 className="font-medium text-slate-900">
                        {project.name}
                      </h3>
                    </div>
                    <Folder className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500">
          <p>
            Connected to: <span className="font-mono">erbe-trial5.odoo.com</span>
          </p>
          <p className="mt-1">
            Showing up to 5 projects from your Odoo instance
          </p>
        </div>
      </div>
    </div>
  );
}