'use client';

import { useState, useEffect } from 'react';
import { Issue } from '@/lib/db';
import { IssueCard } from '@/components/issue-card';
import { IssueModal } from '@/components/issue-modal';
import { CreateIssueModal } from '@/components/create-issue-modal';
import { Navbar } from '@/components/layout/navbar';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, priorityFilter, typeFilter]);

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

  const filterIssues = () => {
    let filtered = issues;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(issue => issue.type === typeFilter);
    }

    setFilteredIssues(filtered);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const handleUpdateIssue = () => {
    fetchIssues();
  };

  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleIssueCreated = () => {
    fetchIssues();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'warning';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar onCreateIssue={handleCreateIssue} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar onCreateIssue={handleCreateIssue} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-gray-900">All Issues</h1>
            <Badge variant="outline" className="text-sm">
              {filteredIssues.length} of {issues.length} issues
            </Badge>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </Select>
              </div>

              <div>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>

              <div>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="task">Task</option>
                  <option value="epic">Epic</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first issue to get started'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="relative">
                  <IssueCard
                    issue={issue}
                    onClick={() => handleIssueClick(issue)}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusBadgeVariant(issue.status)} className="text-xs">
                      {issue.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <IssueModal
            issue={selectedIssue}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdate={handleUpdateIssue}
          />

          <CreateIssueModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCreated={handleIssueCreated}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}