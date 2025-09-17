"use client";

export function DebugPanel() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded shadow text-xs max-w-md">
      <h4 className="font-bold mb-2">Debug Info (Production)</h4>
      <div className="space-y-1">
        <div>
          <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'undefined'}
        </div>
        <div>
          <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}
        </div>
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  );
}