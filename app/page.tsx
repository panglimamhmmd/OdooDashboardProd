'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertCircle,
    Folder,
    RefreshCw,
    Building,
    Palette,
} from 'lucide-react';

// Interface untuk sub project
interface SubProject {
    id: number;
    code: string;
    division: string;
    progress: number;
}

// Interface untuk main project yang berisi array sub projects
interface MainProject {
    main_project: string;
    sub_projects: SubProject[];
}

// Type untuk response API keseluruhan
type ProjectApiResponse = MainProject[];

// Interface untuk API response wrapper
interface ApiResponse {
    success: boolean;
    projects: MainProject[];
    error?: string;
}

// Dummy PIC data
const dummyPICs = {
    ARCH: ['MALAZI', 'BUDI', 'SARI', 'ANDI', 'RINI'],
    INTR: ['AVIVA', 'DINI', 'RIAN', 'MAYA', 'YOGA'],
    DRFT: ['ALDI', 'DIKA', 'NINA', 'FICO', 'TARA'],
    'P.M.': ['PAK DAR', 'IBU SRI', 'PAK TOM', 'BU INA', 'PAK JON'],
    PGWS: ['UJANG', 'DADANG', 'ASEP', 'JAJANG', 'CECEP'],
};

export default function Home() {
    const [projects, setProjects] = useState<MainProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    type ViewMode = 'list' | 'grid';
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
                setProjects(data.projects.slice(0, 14)); // Ambil max 14 projects untuk grid 7x2
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'An unknown error occurred'
            );
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

    // Function untuk mendapatkan progress berdasarkan division
    const getProgressByDivision = (
        subProjects: SubProject[],
        division: string
    ): number => {
        const project = subProjects.find(
            (p) => p.division.toLowerCase() === division.toLowerCase()
        );
        return project ? project.progress * 100 : 0;
    };

    // Function untuk mendapatkan icon division
    const getDivisionIcon = (division: string) => {
        switch (division.toLowerCase()) {
            case 'design':
                return <Palette className="h-4 w-4 text-blue-500" />;
            case 'construction':
                return <Building className="h-4 w-4 text-orange-500" />;
            case 'interior':
                return <Building className="h-4 w-4 text-green-500" />;
            default:
                return <Folder className="h-4 w-4 text-gray-500" />;
        }
    };

    // Function untuk mendapatkan warna progress bar
    const getProgressColor = (progress: number) => {
        if (progress === 0) return 'bg-gray-200';
        if (progress < 30) return 'bg-red-400';
        if (progress < 70) return 'bg-yellow-400';
        return 'bg-green-400';
    };

    const getRandomPIC = (category: string): string => {
        const pics = dummyPICs[category] || dummyPICs['P.M.'];
        return pics[Math.floor(Math.random() * pics.length)];
    };

    const formatDate = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        };
        return now
            .toLocaleDateString('en-GB', options)
            .replace(/ /g, ' ')
            .toUpperCase();
    };

    // Project Card Component for Grid View
    const ProjectCard = ({
        project,
        index,
    }: {
        project: MainProject;
        index: number;
    }) => {
        const designProgress = getProgressByDivision(
            project.sub_projects,
            'design'
        );
        const constructionProgress = getProgressByDivision(
            project.sub_projects,
            'construction'
        );
        const interiorProgress = getProgressByDivision(
            project.sub_projects,
            'interior'
        );

        return (
            <div className="bg-gray-900 text-white p-8 rounded-xl relative overflow-hidden h-full min-h-[450px] flex flex-col">
                {/* Project Title */}
                <h2 className="text-2xl font-bold text-teal-400 mb-8 uppercase tracking-wide leading-tight">
                    {project.main_project}
                </h2>

                {/* Progress Bars */}
                <div className="space-y-6 mb-8 flex-grow">
                    {/* Design Progress */}
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-white w-20 text-center">
                            {Math.round(designProgress)}%
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-medium text-white mb-2">
                                DESIGN {designProgress < 100 ? '(revisi)' : ''}
                            </div>
                            <div className="w-full bg-gray-700 rounded-none h-4 border-2 border-teal-400">
                                <div
                                    className="bg-teal-400 h-full transition-all duration-1000 ease-out"
                                    style={{ width: `${designProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Construction Progress */}
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-white w-20 text-center">
                            {Math.round(constructionProgress)}%
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-medium text-white mb-2">
                                SIPIL
                            </div>
                            <div className="w-full bg-gray-700 rounded-none h-4 border-2 border-teal-400">
                                <div
                                    className="bg-teal-400 h-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${constructionProgress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Interior Progress */}
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-white w-20 text-center">
                            {Math.round(interiorProgress)}%
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-medium text-white mb-2">
                                INTERIOR
                            </div>
                            <div className="w-full bg-gray-700 rounded-none h-4 border-2 border-teal-400">
                                <div
                                    className="bg-teal-400 h-full transition-all duration-1000 ease-out"
                                    style={{ width: `${interiorProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section with PICs */}
                <div className="bg-teal-500 -mx-8 -mb-8 p-6 mt-auto">
                    <div className="grid grid-cols-2 gap-3 text-base">
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">ARCH</span>
                            <span className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium">
                                {getRandomPIC('ARCH')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">INTR</span>
                            <span className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium">
                                {getRandomPIC('INTR')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">DRFT</span>
                            <span className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium">
                                {getRandomPIC('DRFT')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">P.M.</span>
                            <span className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium">
                                {getRandomPIC('P.M.')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center col-span-2">
                            <span className="text-white font-medium">PGWS</span>
                            <span className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium">
                                {getRandomPIC('PGWS')}
                            </span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="text-center mt-4 pt-4 border-t border-teal-400">
                        <span className="text-white font-bold text-base">
                            BAST : {formatDate()}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (viewMode === 'grid') {
        if (loading) {
            return (
                <div className="min-h-screen bg-gray-100 p-8">
                    <div className="max-w-[2400px] mx-auto">
                        <div className="flex justify-center items-center h-96">
                            <RefreshCw className="w-12 h-12 animate-spin text-teal-500" />
                            <span className="ml-4 text-2xl text-gray-600">
                                Loading projects...
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="min-h-screen bg-gray-100 p-8">
                    <div className="max-w-[2400px] mx-auto">
                        <div className="flex justify-center items-center h-96">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <span className="ml-4 text-2xl text-red-600">
                                {error}
                            </span>
                            <button
                                onClick={handleRefresh}
                                className="ml-6 px-6 py-3 text-lg bg-teal-500 text-white rounded hover:bg-teal-600"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-[2400px] mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-6xl font-bold text-gray-900 mb-4">
                                Project Management Dashboard
                            </h1>
                            <p className="text-slate-600 text-2xl">
                                Main Projects with Division Progress
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    const newMode: ViewMode =
                                        viewMode === 'grid' ? 'list' : 'grid';
                                    setViewMode(newMode);
                                }}
                                className="px-6 py-3 text-lg bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                {viewMode === 'grid'
                                    ? 'List View'
                                    : 'Grid View'}
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-3 px-6 py-3 text-lg bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                            >
                                <RefreshCw className="w-6 h-6" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Grid 7x2 */}
                    {projects.length > 0 && (
                        <>
                            <div className="grid grid-cols-7 gap-8 mb-10">
                                {projects.slice(0, 7).map((project, index) => (
                                    <ProjectCard
                                        key={index}
                                        project={project}
                                        index={index}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-8 mb-12">
                                {projects.slice(7, 14).map((project, index) => (
                                    <ProjectCard
                                        key={index + 7}
                                        project={project}
                                        index={index + 7}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {projects.length === 0 && !loading && (
                        <div className="text-center py-16 text-slate-500">
                            <Folder className="h-20 w-20 mx-auto mb-6 opacity-50" />
                            <p className="text-2xl font-medium mb-2">
                                No projects found
                            </p>
                            <p className="text-lg">
                                Check your API configuration.
                            </p>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-center text-lg text-slate-500">
                        <p>
                            Connected to:{' '}
                            <span className="font-mono">
                                erbe-trial5.odoo.com
                            </span>
                        </p>
                        <p className="mt-2">
                            Displaying {projects.length} projects in grid view
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // List View (Original)
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Project Management Dashboard
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Main Projects with Division Progress
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            Main Projects
                        </CardTitle>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const newMode: ViewMode =
                                        viewMode === 'grid' ? 'list' : 'grid';
                                    setViewMode(newMode);
                                }}
                                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Grid View
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        loading ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="space-y-6">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-6 border rounded-lg"
                                    >
                                        <Skeleton className="h-6 w-64 mb-4" />
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">
                                        Error loading projects
                                    </p>
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!loading && !error && projects.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">
                                    No projects found
                                </p>
                                <p className="text-sm">
                                    Check your API configuration.
                                </p>
                            </div>
                        )}

                        {!loading && !error && projects.length > 0 && (
                            <div className="space-y-6">
                                {projects.map((project, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        {/* Main Project Name */}
                                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Folder className="h-5 w-5 text-slate-600" />
                                            {project.main_project}
                                        </h2>

                                        {/* Division Progress */}
                                        <div className="space-y-3">
                                            {/* Design Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon('design')}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Design:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'design'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'design'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'design'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Construction Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon(
                                                        'construction'
                                                    )}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Construction:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'construction'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'construction'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'construction'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Interior Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon(
                                                        'interior'
                                                    )}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Interior:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'interior'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'interior'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'interior'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sub Projects Count */}
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {project.sub_projects.length}{' '}
                                                sub-project
                                                {project.sub_projects.length !==
                                                1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {projects.map((project, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        {/* Main Project Name */}
                                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Folder className="h-5 w-5 text-slate-600" />
                                            {project.main_project}
                                        </h2>

                                        {/* Division Progress */}
                                        <div className="space-y-3">
                                            {/* Design Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon('design')}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Design:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'design'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'design'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'design'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Construction Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon(
                                                        'construction'
                                                    )}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Construction:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'construction'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'construction'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'construction'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Interior Progress */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {getDivisionIcon(
                                                        'interior'
                                                    )}
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Progress Interior:
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                                getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'interior'
                                                                )
                                                            )}`}
                                                            style={{
                                                                width: `${getProgressByDivision(
                                                                    project.sub_projects,
                                                                    'interior'
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-right">
                                                        {getProgressByDivision(
                                                            project.sub_projects,
                                                            'interior'
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sub Projects Count */}
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {project.sub_projects.length}{' '}
                                                sub-project
                                                {project.sub_projects.length !==
                                                1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-slate-500">
                    <p>
                        Connected to:{' '}
                        <span className="font-mono">erbe-trial5.odoo.com</span>
                    </p>
                    <p className="mt-1">
                        Showing main projects with division progress breakdown
                    </p>
                </div>
            </div>
        </div>
    );
}
