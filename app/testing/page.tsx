'use client';

import PICList from '@/components/ui/PIC';
import { useState, useEffect } from 'react';

// ========== INTERFACES ==========
interface SubProject {
    id: number;
    code: string;
    division: string;
    progress: number;
    start_date: string;
    deadline: string;
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

export default function LiteLearningDashboard() {
    const [projects, setProjects] = useState<MainProject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
    const [autoRotateEnabled, setAutoRotateEnabled] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

    // ========== UTILITY FUNCTIONS ==========
    const findByDivision = (
        subProjects: SubProject[],
        division: string,
        field: 'progress' | 'deadline' | 'start_date'
    ) => {
        const found = subProjects.find(
            (p) => p.division.toLowerCase() === division.toLowerCase()
        );
        if (!found) return field === 'progress' ? 0 : 'N/A';
        return field === 'progress' ? found.progress * 100 : found[field];
    };

    const calcTimeProgress = (startDate: string, deadline: string): number => {
        if (startDate === 'N/A' || deadline === 'N/A') return 0;
        const now = new Date().getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(deadline).getTime();
        return Math.min(
            100,
            Math.max(0, Math.round(((now - start) / (end - start)) * 100))
        );
    };

    const getProgressStatus = (progress: number, timeProgress: number) => {
        if (progress >= timeProgress + 10)
            return { color: '#22c55e', status: 'ahead' };
        if (progress < timeProgress - 10)
            return { color: '#f87171', status: 'behind' };
        return { color: 'white', status: 'ontrack' };
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === 'N/A') return 'Date not set';
        return new Date(dateString)
            .toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            .replace('.', '')
            .toUpperCase();
    };

    const calculateTotalProgress = (subProjects: SubProject[]): number => {
        if (subProjects.length === 0) return 0;
        const total = subProjects.reduce((sum, p) => sum + p.progress, 0);
        return (total / subProjects.length) * 100;
    };

    // ========== FLIP HANDLER ==========
    const handleCardFlip = (index: number) => {
        setFlippedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // ========== DATA FETCHING ==========
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const response = await fetch('/api/projectsProd');
            const data = await response.json();

            if (data.success) {
                setProjects(data.projects);
            } else {
                throw new Error(data.error || 'API returned error');
            }
        } catch (err) {
            console.error('Error occurred:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const mapProjectsToDisplay = (rawProjects: MainProject[]) => {
        return rawProjects.map((project, index) => {
            const divisions = ['Design', 'Construction', 'Interior'];
            const mapped: any = {
                index: index + 1,
                name: project.main_project,
                total: calculateTotalProgress(project.sub_projects),
                subProjectCount: project.sub_projects.length,
                rawData: project,
            };

            divisions.forEach((div) => {
                const key = div.toLowerCase();
                mapped[key] = findByDivision(
                    project.sub_projects,
                    div,
                    'progress'
                );
                mapped[`${key}Deadline`] = findByDivision(
                    project.sub_projects,
                    div,
                    'deadline'
                );
                mapped[`${key}StartDate`] = findByDivision(
                    project.sub_projects,
                    div,
                    'start_date'
                );
            });

            return mapped;
        });
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // ========== AUTO ROTATE EFFECT ==========
    useEffect(() => {
        if (!autoRotateEnabled || projects.length === 0) return;

        const interval = setInterval(() => {
            // Clear semua card yang lagi flip, terus flip 2 card baru
            setFlippedCards(() => {
                const newSet = new Set<number>();

                // Hitung 2 card yang akan di-flip (1-based indexing)
                const firstCard = (currentCardIndex % projects.length) + 1;
                const secondCard =
                    ((currentCardIndex + 1) % projects.length) + 1;

                // Flip 2 card ini
                newSet.add(firstCard);
                newSet.add(secondCard);

                return newSet;
            });

            // Update index, loncat 2 card
            setCurrentCardIndex((prev) => (prev + 2) % projects.length);
        }, 6000); // 6000ms = 6 detik

        return () => clearInterval(interval);
    }, [autoRotateEnabled, projects.length, currentCardIndex]);

    const renderProcessedData = () => {
        const mappedProjects = mapProjectsToDisplay(projects);
        const projectChunks = [];
        for (let i = 0; i < mappedProjects.length; i += 7) {
            projectChunks.push(mappedProjects.slice(i, i + 7));
        }

        return (
            <div
                style={{ marginTop: '5px', padding: '1px', minHeight: '100vh' }}
            >
                {projectChunks.map((chunk, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(70px, 1fr))',
                            gap: '5px',
                            marginBottom: '5px',
                            maxWidth: '100%',
                        }}
                    >
                        {chunk.map((project) => {
                            const isFlipped = flippedCards.has(project.index);
                            const phases = [
                                { name: 'design', label: 'DESIGN' },
                                { name: 'construction', label: 'SIPIL' },
                                { name: 'interior', label: 'INTERIOR' },
                            ];

                            return (
                                <div
                                    key={project.index}
                                    style={{
                                        perspective: '500px',
                                        minHeight: '350px',
                                    }}
                                    onClick={() =>
                                        handleCardFlip(project.index)
                                    }
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '300px',
                                            transition: 'transform 0.6s',
                                            transformStyle: 'preserve-3d',
                                            transform: isFlipped
                                                ? 'rotateY(180deg)'
                                                : 'rotateY(0deg)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {/* FRONT SIDE - Progress */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                backgroundColor: 'black',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow:
                                                    '0 4px 20px rgba(0,0,0,0.08)',
                                                border: '1px solid rgba(203, 213, 225, 0.4)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                style={{
                                                    background: 'black',
                                                    padding: '3px',
                                                    textAlign: 'center',
                                                    height: '70px',
                                                    lineHeight: '1.2',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(22px, 1.8vw, 18px)',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        letterSpacing: '0.5px',
                                                        lineHeight: '1.3',
                                                        margin: '10px 4px',
                                                    }}
                                                >
                                                    {project.name.toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Progress Section */}
                                            <div
                                                style={{
                                                    padding: '0px  20px',
                                                    // flex: 1,
                                                }}
                                            >
                                                {phases.map(
                                                    ({ name, label }) => {
                                                        const progress =
                                                            project[name];
                                                        const timeProgress =
                                                            calcTimeProgress(
                                                                project[
                                                                    `${name}StartDate`
                                                                ],
                                                                project[
                                                                    `${name}Deadline`
                                                                ]
                                                            );
                                                        const status =
                                                            getProgressStatus(
                                                                progress,
                                                                timeProgress
                                                            );

                                                        return (
                                                            <div
                                                                key={name}
                                                                style={{
                                                                    marginBottom:
                                                                        '3px',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        justifyContent:
                                                                            'space-between',
                                                                        alignItems:
                                                                            'center',
                                                                        marginBottom:
                                                                            '8px',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                fontSize:
                                                                                    'clamp(18px, 2.5vw, 24px)',
                                                                                fontWeight:
                                                                                    '700',
                                                                                color: status.color,
                                                                                minWidth:
                                                                                    '55px',
                                                                            }}
                                                                        >
                                                                            {progress.toFixed(
                                                                                0
                                                                            )}
                                                                            %
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                fontSize:
                                                                                    'clamp(20px, 1.3vw, 14px)',
                                                                                fontWeight:
                                                                                    '600',
                                                                                marginLeft:
                                                                                    '12px',
                                                                                color: 'white',
                                                                            }}
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                'clamp(8px, 0.9vw, 10px)',
                                                                            color: status.color,
                                                                            fontWeight:
                                                                                '600',
                                                                            textTransform:
                                                                                'uppercase',
                                                                        }}
                                                                    >
                                                                        {
                                                                            status.status
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        position:
                                                                            'relative',
                                                                        width: '100%',
                                                                        height: '18px',
                                                                        backgroundColor:
                                                                            'black',
                                                                        borderRadius:
                                                                            '4px',
                                                                        overflow:
                                                                            'hidden',
                                                                        border: '1px solid #e2e8f0',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            height: '100%',
                                                                            backgroundColor:
                                                                                '#e2e8f0',
                                                                            width: `${timeProgress}%`,
                                                                            transition:
                                                                                'width 0.3s ease',
                                                                        }}
                                                                    ></div>
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            height: '100%',
                                                                            backgroundColor:
                                                                                status.color,
                                                                            width: `${progress}%`,
                                                                            transition:
                                                                                'width 0.3s ease',
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>

                                            {/* Bottom - BAST */}
                                            <div
                                                style={{
                                                    background: 'black',
                                                    padding: '15px 14px',
                                                    marginTop: '5px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
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
                                                {/* <div
                                                    style={{
                                                        color: 'rgba(255,255,255,0.5)',
                                                        fontSize:
                                                            'clamp(9px, 1vw, 11px)',
                                                        marginTop: '8px',
                                                    }}
                                                >
                                                    Click to see PIC
                                                </div> */}
                                            </div>
                                        </div>

                                        {/* BACK SIDE - PIC */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                backgroundColor: 'black',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow:
                                                    '0 4px 20px rgba(0,0,0,0.08)',
                                                border: '1px solid rgba(203, 213, 225, 0.4)',
                                                transform: 'rotateY(180deg)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                style={{
                                                    background: 'black',
                                                    padding: '3px',
                                                    textAlign: 'center',
                                                    height: '70px',
                                                    lineHeight: '1.2',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(22px, 1.8vw, 18px)',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        letterSpacing: '0.5px',
                                                        lineHeight: '1.3',
                                                        margin: '10px 4px',
                                                    }}
                                                >
                                                    {project.name.toUpperCase()}
                                                </div>
                                            </div>

                                            {/* PIC Content */}
                                            <div
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: 'white',
                                                        fontSize:
                                                            'clamp(16px, 1.5vw, 18px)',
                                                        fontWeight: '600',
                                                        marginBottom: '20px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    Person In Charge
                                                </div>
                                                <PICList
                                                    projectName={project.name}
                                                />
                                            </div>

                                            {/* Bottom */}
                                            <div
                                                style={{
                                                    background: 'black',
                                                    padding: '15px 14px',
                                                    marginTop: '20px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: 'rgba(255,255,255,0.5)',
                                                        fontSize:
                                                            'clamp(9px, 1vw, 11px)',
                                                    }}
                                                >
                                                    Click to see Progress
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

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

    return (
        <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif' }}>
            {/* Auto Rotate Toggle */}
            <div
                style={{
                    position: 'fixed',
                    left: '20px',
                    bottom: '20px',
                    zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                }}
            >
                <label
                    style={{
                        color: 'white',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                    }}
                >
                    <input
                        type="checkbox"
                        checked={autoRotateEnabled}
                        onChange={(e) => setAutoRotateEnabled(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <span style={{ cursor: 'pointer' }}>Auto Rotate (6s)</span>
                </label>
            </div>

            {error && (
                <div
                    style={{
                        padding: '0px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        marginBottom: '0px',
                    }}
                >
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && projects.length > 0 && renderProcessedData()}

            {!loading && !error && projects.length === 0 && (
                <div
                    style={{
                        padding: '0px',
                        textAlign: 'center',
                        backgroundColor: '#e2e3e5',
                        border: '1px solid #d1d3d4',
                    }}
                >
                    <h3>No Data</h3>
                    <p>Click Refresh Data to load projects</p>
                </div>
            )}
        </div>
    );
}
