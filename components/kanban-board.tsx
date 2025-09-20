'use client';

import { useState, useEffect } from 'react';
import { Issue } from '@/lib/db';
import { IssueCard } from './issue-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KanbanBoardProps {
  onIssueClick: (issue: Issue) => void;
}

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
  { id: 'done', title: 'Done', status: 'done' as const },
];

export function KanbanBoard({ onIssueClick }: KanbanBoardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter(issue => issue.status === status);
  };

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', issue.id);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedIssue || draggedIssue.status === newStatus) {
      setDraggedIssue(null);
      return;
    }

    try {
      const response = await fetch(`/api/issues/${draggedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draggedIssue,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setIssues(prevIssues =>
          prevIssues.map(issue =>
            issue.id === draggedIssue.id
              ? { ...issue, status: newStatus as any }
              : issue
          )
        );
      }
    } catch (error) {
      console.error('Failed to update issue status:', error);
    } finally {
      setDraggedIssue(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnIssues = getIssuesByStatus(column.status);

        return (
          <Card
            key={column.id}
            className={`h-fit transition-all duration-200 ${
              dragOverColumn === column.status
                ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50'
                : ''
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                {column.title}
                <Badge variant="secondary">{columnIssues.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent
              className={`space-y-3 min-h-[200px] transition-all duration-200 ${
                dragOverColumn === column.status ? 'bg-blue-50/50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {columnIssues.length === 0 ? (
                <div className={`text-sm text-center py-8 rounded-lg border-2 border-dashed transition-all duration-200 ${
                  dragOverColumn === column.status
                    ? 'border-blue-300 bg-blue-100/50 text-blue-600'
                    : 'border-gray-200 text-gray-500'
                }`}>
                  {dragOverColumn === column.status
                    ? 'Drop issue here'
                    : 'No issues in this column'
                  }
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`transition-all duration-200 ${
                      draggedIssue?.id === issue.id ? 'opacity-50' : ''
                    }`}
                  >
                    <IssueCard
                      issue={issue}
                      onClick={() => onIssueClick(issue)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                ))
              )}
              {dragOverColumn === column.status && columnIssues.length > 0 && (
                <div className="h-2 bg-blue-200 rounded-full opacity-75"></div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}