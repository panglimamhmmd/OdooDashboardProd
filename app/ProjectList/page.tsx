'use client';

import PICList from '@/components/ui/PIC';
import { useState, useEffect } from 'react';

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
            return {
                color: '#34C759',
                gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                status: 'ahead',
            };
        if (progress < timeProgress - 10)
            return {
                color: '#FF3B30',
                gradient: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
                status: 'behind',
            };
        return {
            color: '#007AFF',
            gradient: 'linear-gradient(135deg, #007AFF 0%, #0A84FF 100%)',
            status: 'on track',
        };
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === 'N/A') return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const calculateTotalProgress = (subProjects: SubProject[]): number => {
        if (subProjects.length === 0) return 0;
        const total = subProjects.reduce((sum, p) => sum + p.progress, 0);
        return (total / subProjects.length) * 100;
    };

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

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const response = await fetch('/api/FetchGroupProjects');
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

    useEffect(() => {
        if (!autoRotateEnabled || projects.length === 0) return;

        const interval = setInterval(() => {
            setFlippedCards(() => {
                const newSet = new Set<number>();
                const firstCard = (currentCardIndex % projects.length) + 1;
                const secondCard =
                    ((currentCardIndex + 1) % projects.length) + 1;
                newSet.add(firstCard);
                newSet.add(secondCard);
                return newSet;
            });
            setCurrentCardIndex((prev) => (prev + 2) % projects.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [autoRotateEnabled, projects.length, currentCardIndex]);

    const renderProcessedData = () => {
        const mappedProjects = mapProjectsToDisplay(projects);
        const projectChunks = [];
        for (let i = 0; i < mappedProjects.length; i += 7) {
            projectChunks.push(mappedProjects.slice(i, i + 7));
        }

        return (
            <div style={{ padding: '20px', minHeight: '100vh' }}>
                {projectChunks.map((chunk, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '20px',
                            marginBottom: '20px',
                        }}
                    >
                        {chunk.map((project) => {
                            const isFlipped = flippedCards.has(project.index);
                            const phases = [
                                { name: 'design', label: 'Design', icon: '✏️' },
                                {
                                    name: 'construction',
                                    label: 'Construction',
                                    icon: '🏗️',
                                },
                                {
                                    name: 'interior',
                                    label: 'Interior',
                                    icon: '🎨',
                                },
                            ];

                            return (
                                <div
                                    key={project.index}
                                    style={{
                                        perspective: '1000px',
                                        minHeight: '400px',
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
                                            minHeight: '400px',
                                            transition:
                                                'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            transformStyle: 'preserve-3d',
                                            transform: isFlipped
                                                ? 'rotateY(180deg)'
                                                : 'rotateY(0deg)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {/* FRONT SIDE */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                background:
                                                    'rgba(255, 255, 255, 0.7)',
                                                backdropFilter:
                                                    'blur(20px) saturate(180%)',
                                                WebkitBackdropFilter:
                                                    'blur(20px) saturate(180%)',
                                                borderRadius: '20px',
                                                overflow: 'hidden',
                                                boxShadow:
                                                    '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.3s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform =
                                                    'translateY(-4px)';
                                                e.currentTarget.style.boxShadow =
                                                    '0 12px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform =
                                                    'translateY(0)';
                                                e.currentTarget.style.boxShadow =
                                                    '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)';
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                style={{
                                                    background:
                                                        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                                    padding: '24px 20px',
                                                    textAlign: 'center',
                                                    borderBottom:
                                                        '1px solid rgba(0, 0, 0, 0.06)',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(18px, 2vw, 22px)',
                                                        fontWeight: '600',
                                                        color: '#1d1d1f',
                                                        letterSpacing: '-0.5px',
                                                        lineHeight: '1.2',
                                                    }}
                                                >
                                                    {project.name}
                                                </div>
                                            </div>

                                            {/* Progress Section */}
                                            <div
                                                style={{
                                                    padding: '24px 20px',
                                                    flex: 1,
                                                }}
                                            >
                                                {phases.map(
                                                    ({ name, label, icon }) => {
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
                                                                        '20px',
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
                                                                            '10px',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            gap: '8px',
                                                                        }}
                                                                    >
                                                                        {/* <span
                                                                            style={{
                                                                                fontSize:
                                                                                    '16px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                icon
                                                                            }
                                                                        </span> */}
                                                                        <span
                                                                            style={{
                                                                                fontSize:
                                                                                    '20px',
                                                                                fontWeight:
                                                                                    '600',
                                                                                color: '#1d1d1f',
                                                                                letterSpacing:
                                                                                    '-0.3px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            gap: '12px',
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                fontSize:
                                                                                    '13px',
                                                                                fontWeight:
                                                                                    '600',
                                                                                color: status.color,
                                                                                textTransform:
                                                                                    'capitalize',
                                                                            }}
                                                                        >
                                                                            {
                                                                                status.status
                                                                            }
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                fontSize:
                                                                                    '20px',
                                                                                fontWeight:
                                                                                    '700',
                                                                                color: '#1d1d1f',
                                                                                letterSpacing:
                                                                                    '-0.5px',
                                                                            }}
                                                                        >
                                                                            {progress.toFixed(
                                                                                0
                                                                            )}
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        position:
                                                                            'relative',
                                                                        width: '100%',
                                                                        height: '8px',
                                                                        backgroundColor:
                                                                            'rgba(0, 0, 0, 0.06)',
                                                                        borderRadius:
                                                                            '10px',
                                                                        overflow:
                                                                            'hidden',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            height: '100%',
                                                                            background:
                                                                                status.gradient,
                                                                            width: `${progress}%`,
                                                                            borderRadius:
                                                                                '10px',
                                                                            transition:
                                                                                'width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div
                                                style={{
                                                    padding: '16px 20px',
                                                    background:
                                                        'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 100%)',
                                                    borderTop:
                                                        '1px solid rgba(0, 0, 0, 0.04)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '13px',
                                                        color: '#86868b',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    BAST:{' '}
                                                    {formatDate(
                                                        project.interiorDeadline
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                background:
                                                    'rgba(255, 255, 255, 0.7)',
                                                backdropFilter:
                                                    'blur(20px) saturate(180%)',
                                                WebkitBackdropFilter:
                                                    'blur(20px) saturate(180%)',
                                                borderRadius: '20px',
                                                overflow: 'hidden',
                                                boxShadow:
                                                    '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                                transform: 'rotateY(180deg)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                style={{
                                                    background:
                                                        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                                    padding: '24px 20px',
                                                    textAlign: 'center',
                                                    borderBottom:
                                                        '1px solid rgba(0, 0, 0, 0.06)',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            'clamp(18px, 2vw, 22px)',
                                                        fontWeight: '600',
                                                        color: '#1d1d1f',
                                                        letterSpacing: '-0.5px',
                                                        lineHeight: '1.2',
                                                    }}
                                                >
                                                    {project.name}
                                                </div>
                                            </div>

                                            {/* PIC Content */}
                                            <div
                                                style={{
                                                    flex: 1,
                                                    padding: '30px 20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: '#1d1d1f',
                                                        fontSize: '17px',
                                                        fontWeight: '600',
                                                        marginBottom: '20px',
                                                        textAlign: 'center',
                                                        letterSpacing: '-0.3px',
                                                    }}
                                                >
                                                    Team Members
                                                </div>
                                                <PICList
                                                    projectName={project.name}
                                                />
                                            </div>

                                            {/* Footer */}
                                            <div
                                                style={{
                                                    padding: '16px 20px',
                                                    background:
                                                        'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 100%)',
                                                    borderTop:
                                                        '1px solid rgba(0, 0, 0, 0.04)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '13px',
                                                        color: '#86868b',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    Tap to see progress
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
        <div
            style={{
                padding: '0px',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ea 100%)',
                minHeight: '100vh',
            }}
        >
            {/* Auto Rotate Toggle */}
            <div
                style={{
                    position: 'fixed',
                    left: '20px',
                    bottom: '20px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    boxShadow:
                        '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                <label
                    style={{
                        color: '#1d1d1f',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        letterSpacing: '-0.2px',
                    }}
                >
                    <input
                        type="checkbox"
                        checked={autoRotateEnabled}
                        onChange={(e) => setAutoRotateEnabled(e.target.checked)}
                        style={{
                            cursor: 'pointer',
                            width: '18px',
                            height: '18px',
                            accentColor: '#007AFF',
                        }}
                    />
                    Auto Rotate
                </label>
            </div>

            {error && (
                <div
                    style={{
                        margin: '20px',
                        padding: '16px',
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid rgba(255, 59, 48, 0.3)',
                        borderRadius: '12px',
                    }}
                >
                    <h3 style={{ color: '#FF3B30', margin: '0 0 8px 0' }}>
                        Error
                    </h3>
                    <p style={{ color: '#1d1d1f', margin: 0 }}>{error}</p>
                </div>
            )}

            {!loading && !error && projects.length > 0 && renderProcessedData()}

            {!loading && !error && projects.length === 0 && (
                <div
                    style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        margin: '20px',
                    }}
                >
                    <h3 style={{ color: '#1d1d1f' }}>No Data</h3>
                    <p style={{ color: '#86868b' }}>Refresh to load projects</p>
                </div>
            )}
        </div>
    );
}
