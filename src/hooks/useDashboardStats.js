import { useState, useEffect } from 'react';
import axios from 'axios';

const useDashboardStats = () => {
    const [stats, setStats] = useState({
        employeeCount: 0,
        orgCount: 0,
        dbStatus: 'Disconnected',
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:9999/api/v1/health', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const data = response.data.data;
                    setStats({
                        employeeCount: data.counts?.employees || 0,
                        orgCount: data.counts?.orgs || 0,
                        dbStatus: data.database,
                        loading: false
                    });
                }
            } catch (error) {
                console.error("Dashboard Sync Failed:", error);

                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }

                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    return stats;
};

export default useDashboardStats;
