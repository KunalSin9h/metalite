import { useState } from 'react';
import { ConnectForm } from './components/ConnectForm';
import { Dashboard } from './components/Dashboard';
import { ConnectSSH } from '../wailsjs/go/main/App';

function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [dbPath, setDbPath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (host: string, user: string, keyPath: string, remoteDbPath: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const err = await ConnectSSH(host, user, keyPath);
            if (err && err.length > 0) {
                setError(err);
            } else {
                setDbPath(remoteDbPath);
                setIsConnected(true);
            }
        } catch (e: any) {
            setError("Connection failed: " + e.toString());
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setIsConnected(false);
        setDbPath('');
        setError(null);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {isConnected ? (
                <Dashboard dbPath={dbPath} onLogout={handleLogout} />
            ) : (
                <ConnectForm onConnect={handleConnect} isLoading={isLoading} error={error} />
            )}
        </div>
    );
}

export default App;
