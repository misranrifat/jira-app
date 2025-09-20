'use client';

import { Issue } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bug, CheckSquare, Layers, Zap } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, issue: Issue) => void;
  onDragEnd?: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const typeIcons = {
  bug: Bug,
  feature: Zap,
  task: CheckSquare,
  epic: Layers,
};

export function IssueCard({ issue, onClick, onDragStart, onDragEnd }: IssueCardProps) {
  const Icon = typeIcons[issue.type];

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:cursor-grabbing"
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart?.(e, issue)}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">{issue.id}</span>
            </div>
            <Badge className={priorityColors[issue.priority]}>
              {issue.priority}
            </Badge>
          </div>

          <h3 className="font-medium text-gray-900 line-clamp-2">
            {issue.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {issue.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {issue.labels.map((label) => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>

            {issue.assignee && (
              <div className="flex items-center space-x-2">
                {issue.assignee.avatar && (
                  <img
                    src={issue.assignee.avatar}
                    alt={issue.assignee.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {issue.assignee.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}