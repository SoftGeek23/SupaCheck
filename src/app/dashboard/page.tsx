'use client';

import { useState } from 'react';
import SecurityAIChat from '@/components/SecurityAIChat';

interface SecurityLog {
  id: number;
  feature: 'RLS' | 'MFA' | 'PITR';
  status: boolean;
  resource_name: string | null;
  timestamp: string;
  suggested_fix: string | null;
  auto_fixable: boolean;
}

interface CheckResult {
  MFA: {
    id: string;
    email: string | null;
    mfa_enabled: boolean;
  }[];
  RLS: {
    table: string;
    rls_enabled: boolean;
    has_policies: boolean;
    policy_count: number;
  }[];
  PITR: boolean;
  logs: SecurityLog[];
}

const DashboardPage = () => {
  const [results, setResults] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<{
    feature: 'RLS' | 'MFA' | 'PITR';
    resourceName?: string;
    context: string;
  } | null>(null);

  const handleRunChecks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-checks');
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error running checks:', error);
      alert('Failed to run checks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = (feature: 'RLS' | 'MFA' | 'PITR', resourceName?: string) => {
    // Implement auto-fix logic here
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Supabase Compliance Dashboard</h1>
          <button
            onClick={handleRunChecks}
            disabled={loading}
            className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Checks...' : 'Run Compliance Checks'}
          </button>
        </div>

        {results && (
          <div className="grid grid-cols-1 gap-6">
            {/* MFA Check Results */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">MFA Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {results.MFA.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-gray-700">{user.email || 'No email'}</span>
                      <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.mfa_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.mfa_enabled ? 'MFA Enabled' : 'MFA Disabled'}
                    </span>
                        {!user.mfa_enabled && (
                          <button
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                            onClick={() => {
                              setSelectedIssue({
                                feature: 'MFA',
                                resourceName: user.email || undefined,
                                context: 'How to enable and configure MFA for this user'
                              });
                              setChatOpen(true);
                            }}
                          >
                            Get Help
                          </button>
                        )}
                      </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RLS Check Results */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Row Level Security Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
              {results.RLS.map((table, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-gray-700">{table.table}</span>
                        {table.has_policies && (
                          <p className="text-sm text-gray-500 mt-1">
                      {table.policy_count} {table.policy_count === 1 ? 'policy' : 'policies'} active
                          </p>
                        )}
                  </div>
                      <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        table.rls_enabled 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {table.rls_enabled ? 'RLS Enabled' : 'RLS Disabled'}
                    </span>
                        {(!table.rls_enabled || !table.has_policies) && (
                          <button
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                            onClick={() => {
                              setSelectedIssue({
                                feature: 'RLS',
                                resourceName: table.table,
                                context: `How to ${!table.rls_enabled ? 'enable RLS' : 'add security policies'} for ${table.table}`
                              });
                              setChatOpen(true);
                            }}
                          >
                            Get Help
                          </button>
                        )}
                      </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PITR Status */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Point in Time Recovery Status</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      results.PITR 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {results.PITR ? 'PITR Enabled' : 'PITR Disabled'}
                    </span>
                    {!results.PITR && (
                      <button
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                        onClick={() => {
                          setSelectedIssue({
                            feature: 'PITR',
                            context: 'How to enable and configure Point in Time Recovery for your project'
                          });
                          setChatOpen(true);
                        }}
                      >
                        Get Help
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logs */}
            {results?.logs?.data && (
              <div className="bg-[#F8F9FA] rounded-xl border border-gray-800 overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Security Logs</h2>
                    </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {results.logs.data.map((log) => (
                      <div key={log.id} className="flex flex-col space-y-2 border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            {log.feature} {log.resource_name ? `(${log.resource_name})` : ''}
                      </span>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                        log.status 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                      }`}>
                            {log.status ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {!log.status && log.suggested_fix && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{log.suggested_fix}</p>
                            {log.auto_fixable && (
                        <button
                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                          onClick={() => {
                            setSelectedIssue({
                              feature: log.feature,
                              resourceName: log.resource_name || undefined,
                                    context: log.suggested_fix || ''
                            });
                            setChatOpen(true);
                          }}
                        >
                                Chat with AI to fix this
                        </button>
                      )}
                    </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              )}
            </div>
        )}

        {/* Initial State */}
        {!results && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Run compliance checks to see your results</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-400">Running compliance checks...</p>
          </div>
        )}

        {chatOpen && selectedIssue && (
          <SecurityAIChat
            feature={selectedIssue.feature}
            resourceName={selectedIssue.resourceName}
            initialContext={selectedIssue.context}
            onClose={() => {
              setChatOpen(false);
              setSelectedIssue(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
