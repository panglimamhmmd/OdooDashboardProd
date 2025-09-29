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

export default function LiteLearningDashboard() {
    // ========== STATE MANAGEMENT ==========
    const [projects, setProjects] = useState<MainProject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showRawData, setShowRawData] = useState<boolean>(false);

    // ========== DATA FETCHING SIMULATION ==========
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            // Simulasi network delay
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Simulasi API call
            // console.log('📡 Fetching data from API...');

            // Di real app, ini akan jadi:
            const response = await fetch('/api/projectsProd');
            const data = await response.json();

            // const data = DUMMY_API_RESPONSE;
            if (data.success) {
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

    // Function untuk mapping data ke format yang diinginkan
    const mapProjectsToDisplay = (rawProjects: MainProject[]) => {
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

    // ========== LIFECYCLE ==========
    useEffect(() => {
        fetchProjects();
    }, []);

    const renderProcessedData = () => {
        const mappedProjects = mapProjectsToDisplay(projects);

        // Split projects into chunks of 7 for the grid layout
        const projectChunks = [];
        for (let i = 0; i < mappedProjects.length; i += 7) {
            projectChunks.push(mappedProjects.slice(i, i + 7));
        }

        // Enhanced PIC names with more variety

        // Calculate status color based on progress vs timeline
        const getProgressStatus = (progress: number, timeProgress: number) => {
            if (progress >= timeProgress + 10)
                return { color: '#22c55e', status: 'ahead' }; // Bright Green - Ahead
            if (progress < timeProgress - 10)
                return { color: '#f87171', status: 'behind' }; // Bright Red - Behind
            return { color: 'white', status: 'ontrack' }; // Bright Teal - On Track
        };

        const formatDate = (dateString: string) => {
            if (!dateString) return '13 NOV 2025';
            const date = new Date(dateString);
            return date
                .toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })
                .replace('.', '')
                .toUpperCase();
        };

        return (
            <div
                style={{
                    marginTop: '5px ',
                    padding: '1px',
                    minHeight: '100vh',
                }}
            >
                {projectChunks.map((chunk, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '5px',
                            marginBottom: '5px',
                            maxWidth: '100%',
                            borderColor: '#cbd5e1',
                        }}
                    >
                        {chunk.map((project, index) => {
                            // Calculate time progress for each phase
                            const designTimeProgress = Math.min(
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
                            );
                            const constructionTimeProgress = Math.min(
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
                            );
                            const interiorTimeProgress = Math.min(
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
                            );

                            const designStatus = getProgressStatus(
                                project.design,
                                designTimeProgress
                            );
                            const constructionStatus = getProgressStatus(
                                project.construction,
                                constructionTimeProgress
                            );
                            const interiorStatus = getProgressStatus(
                                project.interior,
                                interiorTimeProgress
                            );

                            return (
                                <div
                                    key={project.index}
                                    style={{
                                        backgroundColor: 'black',
                                        backdropFilter: 'blur(10px)',
                                        color: '#1e293b',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        minHeight: '420px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow:
                                            '0 4px 20px rgba(0,0,0,0.08)',
                                        border: '1px solid rgba(203, 213, 225, 0.4)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            'translateY(-4px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 12px 40px rgba(0,0,0,0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            'translateY(0)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 20px rgba(0,0,0,0.08)';
                                    }}
                                >
                                    {/* Status Indicator */}

                                    {/* Header - Project Name */}
                                    <div
                                        style={{
                                            background: 'black',
                                            padding: '6px',
                                            textAlign: 'center',
                                            position: 'relative',
                                            height: '70px', // Fixed height untuk 2 baris
                                            textOverflow: 'ellipsis',
                                            lineHeight: '1.2',
                                        }}
                                    >
                                        {/* <div
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '15px',
                                                fontSize:
                                                    'clamp(15px, 1vw, 12px)',
                                                fontWeight: '500',
                                                color: 'rgba(255,255,255,0.7)',
                                            }}
                                        >
                                            #{project.index}
                                        </div> */}
                                        <div
                                            style={{
                                                fontSize:
                                                    'clamp(22px, 1.8vw, 18px)',
                                                fontWeight: '600',
                                                color: 'white',
                                                letterSpacing: '0.5px',
                                                lineHeight: '1.3',
                                                margin: '10px 4px 10px 4px',
                                            }}
                                        >
                                            {project.name.toUpperCase()}
                                        </div>
                                        {/* <div
                                            style={{
                                                fontSize:
                                                    'clamp(12px, 1.2vw, 14px)',
                                                fontWeight: '500',
                                                color: 'rgba(255,255,255,0.9)',
                                                marginTop: '5px',
                                            }}
                                        >
                                            {project.total.toFixed(1)}% Complete
                                        </div> */}
                                    </div>

                                    {/* Progress Section */}
                                    <div
                                        style={{
                                            padding: '5px 20px 20px',
                                            flex: 1,
                                        }}
                                    >
                                        {/* Design Progress */}
                                        <div style={{ marginBottom: '3px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(18px, 2.5vw, 24px)',
                                                            fontWeight: '700',
                                                            color: designStatus.color,
                                                            minWidth: '55px',
                                                        }}
                                                    >
                                                        {project.design.toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(20px, 1.3vw, 14px)',
                                                            fontWeight: '600',
                                                            marginLeft: '12px',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        DESIGN
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(8px, 0.9vw, 10px)',
                                                        color: designStatus.color,
                                                        fontWeight: '600',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                >
                                                    {designStatus.status}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '18px',
                                                    backgroundColor: 'Black',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            >
                                                {/* Time progress (background) */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            '#e2e8f0',
                                                        width: `${designTimeProgress}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                                {/* Project progress (foreground) */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            designStatus.color,
                                                        width: `${project.design}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Construction Progress */}
                                        <div style={{ marginBottom: '3px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(18px, 2.5vw, 24px)',
                                                            fontWeight: '700',
                                                            color: constructionStatus.color,
                                                            minWidth: '55px',
                                                        }}
                                                    >
                                                        {project.construction.toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(20px, 1.3vw, 14px)',
                                                            fontWeight: '600',
                                                            marginLeft: '12px',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        SIPIL
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(8px, 0.9vw, 10px)',
                                                        color: constructionStatus.color,
                                                        fontWeight: '600',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                >
                                                    {constructionStatus.status}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '18px',
                                                    backgroundColor: 'black',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            '#e2e8f0',
                                                        width: `${constructionTimeProgress}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            constructionStatus.color,
                                                        width: `${project.construction}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Interior Progress */}
                                        <div style={{ marginBottom: '3px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(18px, 2.5vw, 24px)',
                                                            fontWeight: '700',
                                                            color: interiorStatus.color,
                                                            minWidth: '55px',
                                                        }}
                                                    >
                                                        {project.interior.toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                'clamp(20px, 1.3vw, 14px)',
                                                            fontWeight: '600',
                                                            marginLeft: '12px',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        INTERIOR
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(8px, 0.9vw, 10px)',
                                                        color: interiorStatus.color,
                                                        fontWeight: '600',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                >
                                                    {interiorStatus.status}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '15px',
                                                    backgroundColor: 'black ',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            >
                                                {/* cbd5e1 */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            '#e2e8f0',
                                                        width: `${interiorTimeProgress}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        height: '100%',
                                                        backgroundColor:
                                                            interiorStatus.color,
                                                        width: `${project.interior}%`,
                                                        transition:
                                                            'width 0.3s ease',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section - PIC Info */}
                                    <div
                                        style={{
                                            background: 'Black',
                                            padding: '18px',
                                            marginTop: 'auto',
                                        }}
                                    >
                                        {/* PIC List */}
                                        <PICList projectName={project.name} />

                                        {/* BAST Date */}
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize:
                                                    'clamp(11px, 1.3vw, 14px)',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            BAST :{' '}
                                            {formatDate(
                                                project.interiorDeadline
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Fill empty slots if chunk has less than 7 items */}
                        {Array.from(
                            { length: 7 - chunk.length },
                            (_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    style={{ visibility: 'hidden' }}
                                ></div>
                            )
                        )}
                    </div>
                ))}
            </div>
        );
    };
    // ========== MAIN RENDER ==========
    return (
        <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif' }}>
            {/* Error Display */}
            {error && (
                <div
                    style={{
                        padding: '0px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        marginBottom: '0px',
                    }}
                >
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Raw Data */}
            {/* {showRawData && renderRawData()} */}

            {/* Processed Data */}
            {!loading && !error && projects.length > 0 && renderProcessedData()}

            {/* No Data */}
            {!loading && !error && projects.length === 0 && (
                <div
                    style={{
                        padding: '0px',
                        textAlign: 'center',
                        backgroundColor: '#e2e3e5',
                        border: '1px solid #d1d3d4',
                    }}
                >
                    <h3>📭 No Data</h3>
                    <p>Click Refresh Data 🔄 to load projects</p>
                </div>
            )}
        </div>
    );
}
