import React from 'react';
import { Eye, User } from 'lucide-react';

const SupervisorDetailsTable: React.FC = () => {
  const supervisors = [
    {
      id: 1,
      name: 'Ahmed raza',
      division: 'Lahore, Kasur',
      applicationsMonitored: 1245,
      performance: 82.3,
      status: 'active',
      avatar: 'AR'
    },
    {
      id: 2,
      name: 'Ahmed raza',
      division: 'Lahore, Kasur',
      applicationsMonitored: 1245,
      performance: 85.7,
      status: 'inactive',
      avatar: 'AR'
    },
    {
      id: 3,
      name: 'Ahmed raza',
      division: 'Lahore, Kasur',
      applicationsMonitored: 1245,
      performance: 78.9,
      status: 'active',
      avatar: 'AR'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  const getAvatarColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Supervisor Management</h1>
        <p className="text-gray-600">Performance based on number of files reviewed</p>
      </div>

      {/* Performance Overview Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Overall Performance</h2>
          <div className="text-3xl font-bold text-blue-600">82.3%</div>
        </div>
        <div className="text-sm text-gray-500">Total</div>
        
        {/* Performance Chart Placeholder */}
        <div className="mt-4 flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="82.3, 100"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">82.3%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-gray-600">Total Application Reviewed</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Ahmed Raza</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Asad Ali</span>
          </div>
        </div>
      </div>

      {/* Supervisors Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Supervisor Details</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division(s) Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications Monitored
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supervisors.map((supervisor) => (
                <tr key={supervisor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`relative w-10 h-10 rounded-full ${getAvatarColor(supervisor.status)} flex items-center justify-center`}>
                        <User className="w-5 h-5" />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${getStatusColor(supervisor.status)} rounded-full border-2 border-white`}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                      {supervisor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {supervisor.division}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {supervisor.applicationsMonitored.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${supervisor.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {supervisor.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 mr-4">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Supervisors</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Supervisors</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive Supervisors</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDetailsTable;