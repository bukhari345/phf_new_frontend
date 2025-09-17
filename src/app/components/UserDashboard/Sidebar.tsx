import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
    currentView: 'dashboard' | 'loanTracker' | 'installmentPlans' | 'viewDocuments';
    onNavigate: (view: 'dashboard' | 'loanTracker' | 'installmentPlans' | 'viewDocuments') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className="w-64 bg-white shadow-sm min-h-screen">
            <div className="p-6">
                <nav className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        User Dashboard
                    </div>

                    <button
                        onClick={() => onNavigate('dashboard')}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium w-full ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded ${currentView === 'dashboard' ? 'bg-blue-700' : 'bg-gray-400'}`}></div>
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        <span className="flex items-center space-x-3">
                            <span>Loan Requests</span>
                        </span>
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Sub Menu */}
                    {open && (
                        <div className="ml-6 mt-1 space-y-1">
                            <button
                                onClick={() => onNavigate('loanTracker')}
                                className={`block px-3 py-1 text-sm w-full text-left rounded ${currentView === 'loanTracker' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                • Loan Tracker
                            </button>
                            <button
                                onClick={() => onNavigate('installmentPlans')}
                                className={`block px-3 py-1 text-sm w-full text-left rounded ${currentView === 'installmentPlans' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                • Installment Plans
                            </button>
                            <button
                                className="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900 w-full text-left"
                            >
                                • Installment Details
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => onNavigate('viewDocuments')}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium w-full ${currentView === 'viewDocuments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <FileText className={`w-5 h-5 ${currentView === 'viewDocuments' ? 'text-blue-700' : 'text-gray-500'}`} />
                        <span>View Documents</span>
                    </button>

                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full">
                        <span className="w-5 h-5 text-gray-500 flex items-center justify-center">?</span>
                        <span>Help & Support</span>
                    </button>

                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full">
                        <span className="w-5 h-5 text-gray-500 flex items-center justify-center">⚙</span>
                        <span>Settings</span>
                    </button>

                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full">
                        <span className="w-5 h-5 text-gray-500 flex items-center justify-center">↗</span>
                        <span>Log out</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;