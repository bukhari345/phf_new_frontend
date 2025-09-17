// ApplicationsList.tsx
import React from 'react';
import {
  Search, Filter, X, User, MapPin, DollarSign, FileText, Loader2, AlertCircle, Edit3
} from 'lucide-react';
import { Application, PUNJAB_DISTRICTS, formatCurrency, getStatusBadge, getDocumentsSummaryBadge } from './types';

interface ApplicationsListProps {
  applications: Application[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
  onSelectApplication: (app: Application) => void;
  onEditApplication: (app: Application) => void;
  onClearFilters: () => void;
  onClearError: () => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  onSelectApplication,
  onEditApplication,
  onClearFilters,
  onClearError
}) => {
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.includes(searchTerm) ||
      app.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || app.district === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter !== 'all') filters.push(`Status: ${statusFilter.replace('_', ' ')}`);
    if (locationFilter !== 'all') filters.push(`District: ${locationFilter}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters.join(' • ');
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Document Verification System</h2>
        <p className="text-blue-100">Review documents and manage applications</p>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, CNIC, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-900 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white text-gray-900 pl-10 pr-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm appearance-none min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-white text-gray-900 pl-10 pr-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm appearance-none min-w-[200px]"
              >
                <option value="all">All Districts</option>
                {PUNJAB_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {(statusFilter !== 'all' || locationFilter !== 'all' || searchTerm) && (
              <button
                onClick={onClearFilters}
                className="bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="mr-2 w-5 h-5" />
            <span>{error}</span>
            <button onClick={onClearError} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-3 w-6 h-6 text-blue-600" />
            <span className="text-gray-600">Loading applications...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Applications ({filteredApplications.length})
                </h3>
                <div className="text-sm text-gray-600">
                  {getFilterSummary() || 'Showing all applications'}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNIC
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-16">
                        <div className="font-mono text-blue-600 font-medium text-xs">
                          #{app.id.substring(0, 5)}
                        </div>
                      </td>
                      <td className="px-3 py-4 w-40">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">{app.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900 font-mono w-32">
                        {app.cnic}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 w-32">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <div className="font-medium text-xs truncate">{app.district}</div>
                            <div className="text-xs text-gray-500 truncate">{app.tehsil}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-28">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-24">
                        {getDocumentsSummaryBadge(app)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-28">
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs">{formatCurrency(app.loanAmount || 0)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium w-32">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => onSelectApplication(app)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onEditApplication(app)}
                            className="text-amber-600 hover:text-amber-900 hover:bg-amber-50 px-2 py-1 rounded transition-colors flex items-center text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found matching your criteria.</p>
                {(statusFilter !== 'all' || locationFilter !== 'all' || searchTerm) && (
                  <button
                    onClick={onClearFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear filters to see all applications
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;