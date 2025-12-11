import React, { useState, useEffect } from 'react';
import { Play, Table as TableIcon, LogOut, Database, ChevronRight } from 'lucide-react';
import { ExecuteQuery } from '../../wailsjs/go/main/App';

interface DashboardProps {
    dbPath: string;
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ dbPath, onLogout }) => {
    const [query, setQuery] = useState("SELECT * FROM sqlite_master WHERE type='table' LIMIT 10;");
    const [results, setResults] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [tables, setTables] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await ExecuteQuery(dbPath, "SELECT name FROM sqlite_master WHERE type='table';");
            if (res.startsWith("Error")) {
                console.error(res);
                return;
            }
            // Parse JSON output from sqlite3 -json
            // Output format: [{"name":"table1"}, {"name":"table2"}]
            const parsed = JSON.parse(res);
            setTables(parsed.map((row: any) => row.name));
        } catch (e) {
            console.error("Failed to fetch tables", e);
        }
    };

    const handleExecute = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setColumns([]);

        try {
            const res = await ExecuteQuery(dbPath, query);
            if (res.startsWith("Error")) {
                setError(res);
            } else if (res.trim() === "") {
                setResults([]);
                setError("No results or empty response.");
            } else {
                const parsed = JSON.parse(res);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setResults(parsed);
                    setColumns(Object.keys(parsed[0]));
                } else {
                    setResults([]);
                    setError("Query executed successfully but returned no data.");
                }
            }
        } catch (e: any) {
            setError("Execution failed: " + e.toString());
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableClick = (tableName: string) => {
        setQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
        // Optionally auto-execute
    };

    return (
        <div className="flex h-screen bg-[#1E1E1E] text-[#CCCCCC] font-sans text-sm">
            {/* Sidebar */}
            <div className="w-60 bg-[#252526] border-r border-[#1E1E1E] flex flex-col">
                <div className="p-3 border-b border-[#1E1E1E] bg-[#2D2D2D]">
                    <div className="flex items-center gap-2 text-[#E0E0E0]">
                        <Database className="w-4 h-4 text-[#007FD4]" />
                        <span className="font-medium truncate text-xs" title={dbPath}>{dbPath.split('/').pop()}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] font-bold text-[#6F6F6F] uppercase tracking-wider">Tables</div>
                    <ul className="space-y-[1px]">
                        {tables.map(table => (
                            <li key={table}>
                                <button
                                    onClick={() => handleTableClick(table)}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs text-[#CCCCCC] hover:bg-[#2A2D2E] focus:bg-[#37373D] focus:outline-none transition-colors border-l-2 border-transparent focus:border-[#007FD4]"
                                >
                                    <TableIcon className="w-3 h-3 text-[#999999]" />
                                    {table}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-2 border-t border-[#1E1E1E] bg-[#252526]">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-[#CCCCCC] hover:bg-[#2A2D2E] px-3 py-1.5 rounded-sm text-xs w-full transition-colors"
                    >
                        <LogOut className="w-3 h-3" />
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1E1E1E]">
                {/* Query Editor */}
                <div className="h-1/3 border-b border-[#2D2D2D] flex flex-col bg-[#1E1E1E]">
                    <div className="px-3 py-1.5 bg-[#252526] border-b border-[#1E1E1E] flex justify-between items-center">
                        <span className="text-xs font-medium text-[#CCCCCC]">SQL Query</span>
                        <button
                            onClick={handleExecute}
                            disabled={isLoading}
                            className="bg-[#0E639C] hover:bg-[#1177BB] text-white text-xs px-3 py-1 rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Play className="w-3 h-3" />
                            Run
                        </button>
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-[#1E1E1E] text-[#D4D4D4] p-3 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                        placeholder="SELECT * FROM table..."
                        spellCheck={false}
                    />
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-hidden flex flex-col bg-[#1E1E1E]">
                    {error ? (
                        <div className="m-4 bg-[#3a1d1d] border border-[#5a2d2d] text-[#f87171] p-3 rounded-sm text-xs font-mono">
                            {error}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-[#252526] z-10 shadow-sm">
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col} className="px-3 py-1.5 border-b border-r border-[#333333] last:border-r-0 text-xs font-semibold text-[#CCCCCC] whitespace-nowrap select-none">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-xs">
                                    {results.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-[#2A2D2E] group">
                                            {columns.map(col => (
                                                <td key={`${idx}-${col}`} className="px-3 py-1 border-b border-r border-[#2D2D2D] last:border-r-0 text-[#D4D4D4] whitespace-nowrap group-hover:border-[#2D2D2D]">
                                                    {row[col] !== null ? (
                                                        String(row[col])
                                                    ) : (
                                                        <span className="text-[#555555] italic">NULL</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[#444444]">
                            <Database className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs">No data to display</p>
                        </div>
                    )}

                    {/* Footer Status Bar */}
                    <div className="bg-[#007FD4] text-white text-[10px] px-2 py-0.5 flex justify-between items-center">
                        <span>{results.length} rows</span>
                        <span>{isLoading ? 'Executing...' : 'Ready'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
