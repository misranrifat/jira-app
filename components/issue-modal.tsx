'use client';

import { useState, useEffect } from 'react';
import { Issue, User } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MessageSquare, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface IssueModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function IssueModal({ issue, isOpen, onClose, onUpdate }: IssueModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId || '',
      });
    }
  }, [issue]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleUpdate = async () => {
    if (!issue) return;

    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assigneeId: formData.assigneeId || undefined,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update issue:', error);
    }
  };

  const handleAddComment = async () => {
    if (!issue || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'u1', // Default user for demo
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onClose();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete issue:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold">{issue.id}</h2>
            <Badge className={`${
              issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {issue.priority}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Issue title"
                  />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Issue description"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdate}>Save</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{issue.title}</h1>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{issue.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({issue.comments?.length || 0})
                </h3>

                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  {issue.comments?.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={comment.user?.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.user?.name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    {isEditing ? (
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-600 capitalize">{issue.status.replace('-', ' ')}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    {isEditing ? (
                      <Select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-600 capitalize">{issue.priority}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Assignee</label>
                    {isEditing ? (
                      <Select
                        value={formData.assigneeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {issue.assignee ? (
                          <>
                            <img
                              src={issue.assignee.avatar}
                              alt={issue.assignee.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">{issue.assignee.name}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Reporter</label>
                    <div className="flex items-center space-x-2">
                      {issue.reporter && (
                        <>
                          <img
                            src={issue.reporter.avatar}
                            alt={issue.reporter.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{issue.reporter.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Labels</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {issue.labels.map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created
                    </label>
                    <p className="text-sm text-gray-600">
                      {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Delete Issue</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{issue.id}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Issue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}