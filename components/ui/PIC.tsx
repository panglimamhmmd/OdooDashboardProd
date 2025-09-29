import { PIC_MAP, ProjectName } from '@/app/PIC';

// Ubah prop type untuk menerima string apapun
export default function PICList({ projectName }: { projectName: string }) {
    const projectPICs =
        PIC_MAP[projectName.toUpperCase() as keyof typeof PIC_MAP];
    if (!projectPICs)
        return (
            <div
                style={{
                    color: 'white',
                    fontSize: 'clamp(10px, 1.2vw, 12px)',
                    textAlign: 'center',
                }}
            >
                No PIC available
            </div>
        );

    return (
        <div style={{ marginBottom: '16px' }}>
            {Object.entries(projectPICs).map(([role, name]) => (
                <div
                    key={role}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '6px',
                        gap: '10px',
                    }}
                >
                    <span
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 'clamp(11px, 1.2vw, 20px)',
                            minWidth: '80px',
                            maxWidth: '120px',
                            marginRight: '0',
                            flexShrink: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {role}
                    </span>
                    <div
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            color: '#1a1a1a',
                            padding: '3px',
                            borderRadius: '10px',
                            fontSize: 'clamp(20px, 1vw, 15px)',
                            fontWeight: 'bold',
                            flex: 1,
                            textAlign: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            backdropFilter: 'blur(5px)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: 0,
                        }}
                    >
                        {name}
                    </div>
                </div>
            ))}
        </div>
    );
}
