'use client';
import React, { use, useEffect } from 'react';

export default function TestPage() {
    const fetchProject = async () => {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        const data = await res.json();
        console.log(data);
    };
    useEffect(() => {
        fetchProject();
    }, []);

    return <div>Test Page</div>;
}
