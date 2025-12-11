import React, { useState, useEffect } from 'react';
import { Terminal, Key, Database, Server, Save, Trash2, Clock } from 'lucide-react';
import { GetSavedConnections, SaveConnection, DeleteConnection } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';

interface ConnectFormProps {
    onConnect: (host: string, user: string, keyPath: string, dbPath: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const ConnectForm: React.FC<ConnectFormProps> = ({ onConnect, isLoading, error }) => {
    const [host, setHost] = useState('');
    const [user, setUser] = useState('');
    const [keyPath, setKeyPath] = useState('');
    const [dbPath, setDbPath] = useState('');
    const [name, setName] = useState('');

    const [savedConns, setSavedConns] = useState<backend.SavedConnection[]>([]);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            const conns = await GetSavedConnections();
            setSavedConns(conns);
        } catch (e) {
            console.error("Failed to load connections", e);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect(host, user, keyPath, dbPath);
    };

    const handleSave = async () => {
        if (!host || !user || !keyPath || !dbPath) {
            alert("Please fill in all fields before saving.");
            return;
        }
        const connName = name || `${user}@${host}`;
        const id = Date.now().toString(); // Simple ID generation

        const conn = {
            id: id,
            name: connName,
            host: host,
            user: user,
            keyPath: keyPath,
            dbPath: dbPath
        };

        const err = await SaveConnection(conn);
        if (err) {
            console.error(err);
        } else {
            loadConnections();
            setName('');
        }
    };

    const handleSelect = (conn: backend.SavedConnection) => {
        setHost(conn.host);
        setUser(conn.user);
        setKeyPath(conn.keyPath);
        setDbPath(conn.dbPath);
        setName(conn.name);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this connection?")) {
            await DeleteConnection(id);
            loadConnections();
        }
    };

    return (
        <div className="flex min-h-screen bg-[#1E1E1E] text-[#CCCCCC] font-sans">
            {/* Sidebar for Saved Connections */}
            <div className="w-64 bg-[#252526] border-r border-[#1E1E1E] flex flex-col">
                <div className="p-4 border-b border-[#1E1E1E] bg-[#2D2D2D]">
                    <h2 className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Recent Connections
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {savedConns.map(conn => (
                        <div
                            key={conn.id}
                            onClick={() => handleSelect(conn)}
                            className="group flex items-center justify-between p-2 rounded-sm hover:bg-[#2A2D2E] cursor-pointer transition-colors"
                        >
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-[#E0E0E0] truncate">{conn.name}</span>
                                <span className="text-[10px] text-[#888888] truncate">{conn.user}@{conn.host}</span>
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, conn.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {savedConns.length === 0 && (
                        <div className="text-xs text-[#666666] text-center mt-4 italic">
                            No saved connections
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[450px] bg-[#252526] border border-[#454545] shadow-2xl">
                    {/* Title Bar */}
                    <div className="bg-[#333333] px-4 py-2 border-b border-[#1E1E1E] flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#CCCCCC]" />
                        <h2 className="text-sm font-medium text-[#CCCCCC]">New Connection</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-4">
                            {/* Connection Name (Optional) */}
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-xs text-[#999999] text-right">Name (Opt)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-2 h-8 px-2 text-sm rounded-sm bg-[#1E1E1E] border border-[#3E3E3E] focus:border-[#007FD4] outline-none"
                                    placeholder="My Production DB"
                                />
                            </div>

                            <div className="border-t border-[#333333] my-2"></div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-xs text-[#999999] text-right">Host</label>
                                <input
                                    type="text"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="col-span-2 h-8 px-2 text-sm rounded-sm bg-[#1E1E1E] border border-[#3E3E3E] focus:border-[#007FD4] outline-none"
                                    placeholder="127.0.0.1"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-xs text-[#999999] text-right">User</label>
                                <input
                                    type="text"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    className="col-span-2 h-8 px-2 text-sm rounded-sm bg-[#1E1E1E] border border-[#3E3E3E] focus:border-[#007FD4] outline-none"
                                    placeholder="root"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-xs text-[#999999] text-right">SSH Key</label>
                                <div className="col-span-2 relative">
                                    <input
                                        type="text"
                                        value={keyPath}
                                        onChange={(e) => setKeyPath(e.target.value)}
                                        className="w-full h-8 px-2 text-sm rounded-sm pr-8 bg-[#1E1E1E] border border-[#3E3E3E] focus:border-[#007FD4] outline-none"
                                        placeholder="~/.ssh/id_rsa"
                                        required
                                    />
                                    <Key className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666666]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-xs text-[#999999] text-right">Database</label>
                                <div className="col-span-2 relative">
                                    <input
                                        type="text"
                                        value={dbPath}
                                        onChange={(e) => setDbPath(e.target.value)}
                                        className="w-full h-8 px-2 text-sm rounded-sm pr-8 bg-[#1E1E1E] border border-[#3E3E3E] focus:border-[#007FD4] outline-none"
                                        placeholder="/var/db.sqlite"
                                        required
                                    />
                                    <Database className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666666]" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-[#3a1d1d] border border-[#5a2d2d] text-[#f87171] text-xs p-2 rounded-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-2 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="text-[#CCCCCC] hover:text-white text-xs flex items-center gap-1 hover:bg-[#333333] px-2 py-1 rounded transition-colors"
                            >
                                <Save className="w-3 h-3" />
                                Save
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#0E639C] hover:bg-[#1177BB] text-white text-xs px-6 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isLoading ? "Connecting..." : "Connect"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
