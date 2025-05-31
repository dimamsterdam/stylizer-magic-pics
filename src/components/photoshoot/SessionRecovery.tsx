
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Image, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PhotoShootSession {
  id: string;
  product_id?: string;
  design_brief?: string;
  shoot_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SessionRecoveryProps {
  sessions: PhotoShootSession[];
  onContinueSession: (sessionId: string) => void;
  onStartNew: () => void;
  isLoading?: boolean;
}

export const SessionRecovery = ({ 
  sessions, 
  onContinueSession, 
  onStartNew,
  isLoading 
}: SessionRecoveryProps) => {
  const activeSessions = sessions.filter(s => s.status !== 'completed');
  
  if (isLoading) {
    return (
      <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeSessions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading text-[--p-text]">Continue Previous Session</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onStartNew}
          >
            Start New
          </Button>
        </div>
        
        <div className="space-y-3">
          {activeSessions.slice(0, 3).map((session) => (
            <div 
              key={session.id}
              className="flex items-center justify-between p-3 border rounded-lg border-[#E3E5E7] bg-[--p-surface-hovered] hover:bg-[#F6F6F7] cursor-pointer"
              onClick={() => onContinueSession(session.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {session.status === 'reviewing' ? (
                    <Image className="h-5 w-5 text-blue-500" />
                  ) : session.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[--p-text] truncate">
                    {session.design_brief ? 
                      session.design_brief.substring(0, 50) + (session.design_brief.length > 50 ? '...' : '') 
                      : 'Untitled session'
                    }
                  </p>
                  <p className="text-xs text-[--p-text-subdued]">
                    {session.shoot_type === 'standard' ? 'Standard shoot' : 'AI suggestions'} • 
                    Updated {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  session.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
