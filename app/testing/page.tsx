'use client';
import PICList from '@/components/ui/PIC';

import { useState, useEffect } from 'react';

// ========== INTERFACES (Data Structure) ==========
interface SubProject {
    id: number;
    code: string;
    division: string;
    progress: number; // 0.0 to 1.0
    start_date: string; // ISO date string
    deadline: string; // ISO date string
}

interface MainProject {
    main_project: string;
    sub_projects: SubProject[];
}

interface ApiResponse {
    success: boolean;
    projects: MainProject[];
    error?: string;
}

// ========== DUMMY DATA FOR LEARNING ==========
const DUMMY_API_RESPONSE: ApiResponse = {
    success: true,
    projects: [
        {
            main_project: 'PADEL REMPOA',
            sub_projects: [
                {
                    id: 1,
                    code: 'S001',
                    division: 'Design',
                    progress: 0.88,
                    start_date: '2023-01-01',
                    deadline: '2023-12-31',
                },
                {
                    id: 2,
                    code: 'S002',
                    division: 'Construction',
                    progress: 0.52,
                    start_date: '2023-01-01',
                    deadline: '2023-12-31',
                },
                {
                    id: 3,
                    code: 'S003',
                    division: 'Interior',
                    progress: 0.17,
                    start_date: '2023-01-01',
                    deadline: '2023-12-31',
                },
            ],
        },
        {
            main_project: 'WELLNESS PIK',
            sub_projects: [
                {
                    id: 4,
                    code: 'S004',
                    division: 'Design',
                    progress: 0.95,
                    deadline: '2023-12-31',
                    start_date: '2023-01-01',
                },
                {
                    id: 5,
                    code: 'S005',
                    division: 'Construction',
                    progress: 0.73,
                    deadline: '2023-12-31',
                    start_date: '2023-01-01',
                },
                // Note: Tidak ada Interior project
            ],
        },
        {
            main_project: 'LSP MUI',
            sub_projects: [
                {
                    id: 6,
                    code: 'S006',
                    division: 'Interior',
                    progress: 0.35,
                    deadline: '2023-12-31',
                    start_date: '2023-01-01',
                },
                // Note: Hanya ada Interior project
            ],
        },
    ],
};

export default function LiteLearningDashboard() {
    // ========== STATE MANAGEMENT ==========
    const [projects, setProjects] = useState<MainProject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showRawData, setShowRawData] = useState<boolean>(false);

    // ========== DATA FETCHING SIMULATION ==========
    const fetchProjects = async () => {
        console.log('🚀 Starting API call...');
        setLoading(true);
        setError(null);

        try {
            // Simulasi network delay
            console.log('⏳ Simulating network delay...');
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulasi API call
            // console.log('📡 Fetching data from API...');

            // Di real app, ini akan jadi:
            const response = await fetch('/api/projects');
            const data = await response.json();

            // const data = DUMMY_API_RESPONSE;
            console.log('📦 Raw API Response:', data);

            if (data.success) {
                console.log('✅ API call successful');
                console.log(
                    '📊 Number of projects received:',
                    data.projects.length
                );

                // Set data ke state
                setProjects(data.projects);

                // Log setiap project untuk pembelajaran
                data.projects.forEach((project: MainProject, index: number) => {
                    console.log(
                        `📋 Project ${index + 1}: ${project.main_project}`
                    );
                    console.log(
                        `   └── Sub-projects: ${project.sub_projects.length}`
                    );
                    project.sub_projects.forEach((sub) => {
                        console.log(
                            `       └── ${sub.division}: ${(
                                sub.progress * 100
                            ).toFixed(1)}%`
                        );
                    });
                });
            } else {
                throw new Error(data.error || 'API returned error');
            }
        } catch (err) {
            console.error('❌ Error occurred:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
            console.log('🏁 API call completed');
        }
    };

    // ========== DATA PROCESSING FUNCTIONS ==========

    // Function untuk cari progress berdasarkan division
    const findProgressByDivision = (
        subProjects: SubProject[],
        targetDivision: string
    ): number => {
        const found = subProjects.find(
            (project) =>
                project.division.toLowerCase() === targetDivision.toLowerCase()
        );
        const result = found ? found.progress * 100 : 0;
        return result;
    };

    const findDeadlineByDivision = (
        subProjects: SubProject[],
        targetDivision: string
    ): string => {
        const found = subProjects.find(
            (project) =>
                project.division.toLowerCase() === targetDivision.toLowerCase()
        );
        const result = found ? found.deadline : 'N/A';
        return result;
    };

    const findStartDateByDivision = (
        subProjects: SubProject[],
        targetDivision: string
    ): string => {
        const found = subProjects.find(
            (project) =>
                project.division.toLowerCase() === targetDivision.toLowerCase()
        );

        const result = found ? found.start_date : 'N/A';
        return result;
    };

    // Function untuk hitung total progress semua division
    const calculateTotalProgress = (subProjects: SubProject[]): number => {
        if (subProjects.length === 0) return 0;

        const total = subProjects.reduce((sum, project) => {
            console.log(`   Adding ${project.division}: ${project.progress}`);
            return sum + project.progress;
        }, 0);

        const average = (total / subProjects.length) * 100;
        console.log(`   Total average: ${average.toFixed(1)}%`);
        return average;
    };

    // Function untuk mapping data ke format yang diinginkan
    const mapProjectsToDisplay = (rawProjects: MainProject[]) => {
        console.log('🔄 Mapping projects for display...');

        return rawProjects.map((project, index) => {
            console.log(`\n📋 Processing: ${project.main_project}`);

            const designProgress = findProgressByDivision(
                project.sub_projects,
                'Design'
            );
            const constructionProgress = findProgressByDivision(
                project.sub_projects,
                'Construction'
            );
            const interiorProgress = findProgressByDivision(
                project.sub_projects,
                'Interior'
            );

            const designDeadline = findDeadlineByDivision(
                project.sub_projects,
                'Design'
            );
            const constructionDeadline = findDeadlineByDivision(
                project.sub_projects,
                'Construction'
            );
            const interiorDeadline = findDeadlineByDivision(
                project.sub_projects,
                'Interior'
            );

            const designStartDate = findStartDateByDivision(
                project.sub_projects,
                'Design'
            );
            const constructionStartDate = findStartDateByDivision(
                project.sub_projects,
                'Construction'
            );
            const interiorStartDate = findStartDateByDivision(
                project.sub_projects,
                'Interior'
            );

            const totalProgress = calculateTotalProgress(project.sub_projects);

            const mapped = {
                index: index + 1,
                name: project.main_project,
                design: designProgress,
                construction: constructionProgress,
                interior: interiorProgress,
                total: totalProgress,
                subProjectCount: project.sub_projects.length,
                designDeadline,
                constructionDeadline,
                interiorDeadline,
                designStartDate,
                constructionStartDate,
                interiorStartDate,
                rawData: project, // Keep original for reference
            };
            return mapped;
        });
    };

    // ========== LIFECYCLE ==========
    useEffect(() => {
        console.log('🏗️ Component mounted, fetching initial data...');
        fetchProjects();
    }, []);

    // ========== RENDER FUNCTIONS ==========

    const renderRawData = () => (
        <div
            style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
            }}
        >
            <h3>🔍 Raw API Data (untuk pembelajaran)</h3>
            <pre
                style={{
                    backgroundColor: '#000',
                    color: '#0f0',
                    padding: '15px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '400px',
                }}
            >
                {JSON.stringify(projects, null, 2)}
            </pre>
        </div>
    );

    const renderProcessedData = () => {
        console.log('\n🎨 Rendering processed data...');
        const mappedProjects = mapProjectsToDisplay(projects);

        return (
            <div style={{ marginTop: '20px' }}>
                <h3>📊 Processed Data (Hasil Mapping)</h3>
                <table
                    border={1}
                    style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                    <thead style={{ backgroundColor: '#e0e0e0' }}>
                        <tr>
                            <th style={{ padding: '10px' }}>No</th>
                            <th style={{ padding: '10px' }}>Project Name</th>
                            <th style={{ padding: '10px' }}>Design %</th>
                            <th style={{ padding: '10px' }}>Construction %</th>
                            <th style={{ padding: '10px' }}>Interior %</th>
                            <th style={{ padding: '10px' }}>Average %</th>

                            <th style={{ padding: '10px' }}>Sub Projects</th>
                            <th style={{ padding: '10px' }}>Deadline Design</th>
                            <th style={{ padding: '10px' }}>
                                Deadline Construction
                            </th>
                            <th style={{ padding: '10px' }}>
                                Deadline Interior
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedProjects.map((project) => (
                            <tr key={project.index}>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {project.index}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {project.name}
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {project.design.toFixed(1)}%
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {project.construction.toFixed(1)}%
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {project.interior.toFixed(1)}%
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                        backgroundColor:
                                            project.total > 50
                                                ? '#d4edda'
                                                : '#f8d7da',
                                    }}
                                >
                                    {project.total.toFixed(1)}%
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {project.subProjectCount}
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Start: {project.designStartDate || ''}{' '}
                                    <br />
                                    End {project.designDeadline || ''}
                                    <br />
                                    <div className="relative w-full h-4 bg-gray-200 rounded">
                                        {/* Time progress (belakang) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-gray-400 rounded"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        Math.round(
                                                            ((new Date().getTime() -
                                                                new Date(
                                                                    project.designStartDate
                                                                ).getTime()) /
                                                                (new Date(
                                                                    project.designDeadline
                                                                ).getTime() -
                                                                    new Date(
                                                                        project.designStartDate
                                                                    ).getTime())) *
                                                                100
                                                        )
                                                    )
                                                )}%`,
                                            }}
                                        ></div>

                                        {/* Project progress (depan) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-green-500 rounded"
                                            style={{
                                                width: `${project.design}%`,
                                            }}
                                        ></div>
                                    </div>
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Start: {project.constructionStartDate || ''}{' '}
                                    <br />
                                    End {project.constructionDeadline || ''}
                                    <br />
                                    <div className="relative w-full h-4 bg-gray-200 rounded">
                                        {/* Time progress (belakang) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-gray-400 rounded"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        Math.round(
                                                            ((new Date().getTime() -
                                                                new Date(
                                                                    project.constructionStartDate
                                                                ).getTime()) /
                                                                (new Date(
                                                                    project.constructionDeadline
                                                                ).getTime() -
                                                                    new Date(
                                                                        project.constructionStartDate
                                                                    ).getTime())) *
                                                                100
                                                        )
                                                    )
                                                )}%`,
                                            }}
                                        ></div>

                                        {/* Project progress (depan) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-green-500 rounded"
                                            style={{
                                                width: `${project.construction}%`,
                                            }}
                                        ></div>
                                    </div>
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Start: {project.interiorStartDate || ''}{' '}
                                    <br />
                                    End {project.interiorDeadline || ''}
                                    <br />
                                    <div className="relative w-full h-4 bg-gray-200 rounded">
                                        {/* Time progress (belakang) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-gray-400 rounded"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        Math.round(
                                                            ((new Date().getTime() -
                                                                new Date(
                                                                    project.interiorStartDate
                                                                ).getTime()) /
                                                                (new Date(
                                                                    project.interiorDeadline
                                                                ).getTime() -
                                                                    new Date(
                                                                        project.interiorStartDate
                                                                    ).getTime())) *
                                                                100
                                                        )
                                                    )
                                                )}%`,
                                            }}
                                        ></div>

                                        {/* Project progress (depan) */}
                                        <div
                                            className="absolute top-0 left-0 h-4 bg-green-500 rounded"
                                            style={{
                                                width: `${project.interior}%`,
                                            }}
                                        ></div>
                                    </div>
                                </td>

                                {/* progress bar desain */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🎓 Lite Learning Dashboard</h1>
            <p>
                <em>
                    Fokus pada data structure dan mapping - UI sederhana untuk
                    pembelajaran
                </em>
            </p>

            {/* Controls */}
            <div
                style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #add8e6',
                }}
            >
                <h3>🎛️ Controls</h3>
                <button
                    onClick={fetchProjects}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: loading ? '#cccccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
                </button>

                <button
                    onClick={() => setShowRawData(!showRawData)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: showRawData ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {showRawData ? '👁️ Hide Raw Data' : '🔍 Show Raw Data'}
                </button>

                <button
                    onClick={() => console.clear()}
                    style={{
                        padding: '10px 20px',
                        marginLeft: '10px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    🧹 Clear Console
                </button>
            </div>

            {/* Status */}
            <div
                style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                }}
            >
                <h3>📊 Status</h3>
                <p>
                    <strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}
                </p>
                <p>
                    <strong>Error:</strong> {error || '❌ None'}
                </p>
                <p>
                    <strong>Projects Count:</strong> {projects.length}
                </p>
                <p>
                    <strong>Console:</strong> Buka Developer Tools (F12) untuk
                    melihat log detail!
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div
                    style={{
                        padding: '15px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        marginBottom: '20px',
                    }}
                >
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Raw Data */}
            {showRawData && renderRawData()}

            {/* Processed Data */}
            {!loading && !error && projects.length > 0 && renderProcessedData()}

            {/* No Data */}
            {!loading && !error && projects.length === 0 && (
                <div
                    style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#e2e3e5',
                        border: '1px solid #d1d3d4',
                    }}
                >
                    <h3>📭 No Data</h3>
                    <p>Click Refresh Data 🔄 to load projects</p>
                </div>
            )}

            {/* Learning Notes */}
            <div
                style={{
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#e7f3ff',
                    border: '1px solid #b3d9ff',
                }}
            >
                <h3>📚 Learning Points</h3>
                <PICList projectName="Sentul Raquet Club" />
            </div>
        </div>
    );
}
