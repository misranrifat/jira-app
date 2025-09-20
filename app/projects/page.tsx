'use client';

import { useState, useEffect } from 'react';
import { Project, Issue } from '@/lib/db';
import { Navbar } from '@/components/layout/navbar';
import { CreateIssueModal } from '@/components/create-issue-modal';
import { CreateProjectModal } from '@/components/create-project-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Users, Calendar, BarChart3, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface ProjectWithStats extends Project {
  issueCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; projectId: string | null }>({ show: false, projectId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjectsWithStats();
  }, []);

  const fetchProjectsWithStats = async () => {
    try {
      const [projectsResponse, issuesResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/issues')
      ]);

      const projectsData = await projectsResponse.json();
      const issuesData = await issuesResponse.json();

      // Calculate stats for each project
      const projectsWithStats = projectsData.map((project: Project) => {
        const projectIssues = issuesData.filter((issue: Issue) => issue.projectId === project.id);

        return {
          ...project,
          issueCount: projectIssues.length,
          todoCount: projectIssues.filter((issue: Issue) => issue.status === 'todo').length,
          inProgressCount: projectIssues.filter((issue: Issue) => issue.status === 'in-progress').length,
          doneCount: projectIssues.filter((issue: Issue) => issue.status === 'done').length,
        };
      });

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleIssueCreated = () => {
    fetchProjectsWithStats();
  };

  const handleCreateProject = () => {
    setIsCreateProjectModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };

  const handleProjectCreated = () => {
    fetchProjectsWithStats();
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchProjectsWithStats();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ show: false, projectId: null });
    }
  };

  const getCompletionPercentage = (project: ProjectWithStats) => {
    if (project.issueCount === 0) return 0;
    return Math.round((project.doneCount / project.issueCount) * 100);
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
            <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </Badge>
              <Button onClick={handleCreateProject} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started with issue tracking
              </p>
              <Button onClick={handleCreateProject}>
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => {
                const completionPercentage = getCompletionPercentage(project);

                return (
                  <Card key={project.id} className="hover:shadow-lg transition-all duration-200 relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center space-x-2">
                            <Folder className="h-5 w-5 text-blue-600" />
                            <span>{project.name}</span>
                          </CardTitle>
                          <Badge variant="outline" className="text-xs w-fit">
                            {project.key}
                          </Badge>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {completionPercentage}%
                            </div>
                            <div className="text-xs text-gray-500">Complete</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ show: true, projectId: project.id })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {project.issueCount}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-600">
                            {project.todoCount}
                          </div>
                          <div className="text-xs text-gray-500">Todo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {project.inProgressCount}
                          </div>
                          <div className="text-xs text-gray-500">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {project.doneCount}
                          </div>
                          <div className="text-xs text-gray-500">Done</div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>Project Lead</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {project.lead?.avatar && (
                              <img
                                src={project.lead.avatar}
                                alt={project.lead.name}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="font-medium">{project.lead?.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Created</span>
                          </div>
                          <span className="text-gray-900">
                            {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between">
                          <a href="/">
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Board
                            </Button>
                          </a>
                          <a href="/issues">
                            <Button variant="ghost" size="sm">
                              View Issues
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <CreateIssueModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCreated={handleIssueCreated}
          />

          <CreateProjectModal
            isOpen={isCreateProjectModalOpen}
            onClose={handleCloseCreateProjectModal}
            onCreated={handleProjectCreated}
          />

          {/* Delete Confirmation Dialog */}
          {deleteConfirm.show && deleteConfirm.projectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Delete Project</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Are you sure you want to delete this project? All associated issues and data will be permanently deleted.
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ show: false, projectId: null })}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteProject(deleteConfirm.projectId!)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}