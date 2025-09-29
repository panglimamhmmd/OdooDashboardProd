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
                    }}
                >
                    <span
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 'clamp(15px, 1.2vw, 12px)',
                            minWidth: '45px',
                            marginRight: '10px',
                        }}
                    >
                        {role}
                    </span>
                    <div
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            color: '#1a1a1a',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            fontSize: 'clamp(15px, 1vw, 11px)',
                            fontWeight: 'bold',
                            flex: 1,
                            textAlign: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            backdropFilter: 'blur(5px)',
                        }}
                    >
                        {name}
                    </div>
                </div>
            ))}
        </div>
    );
}
