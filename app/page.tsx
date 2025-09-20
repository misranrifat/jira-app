'use client';

import { useState } from 'react';
import { Issue } from '@/lib/db';
import { KanbanBoard } from '@/components/kanban-board';
import { IssueModal } from '@/components/issue-modal';
import { CreateIssueModal } from '@/components/create-issue-modal';
import { Navbar } from '@/components/layout/navbar';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function HomePage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const handleUpdateIssue = () => {
    // Force refresh of the board
    window.location.reload();
  };

  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleIssueCreated = () => {
    // Force refresh of the board
    window.location.reload();
  };

  return (
    <ProtectedRoute>
      <Navbar onCreateIssue={handleCreateIssue} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">
              Project Board
            </h1>
          </div>

          <KanbanBoard onIssueClick={handleIssueClick} />

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