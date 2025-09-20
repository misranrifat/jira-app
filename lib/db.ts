export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used for authentication, not returned in API responses
  avatar?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user?: User;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'bug' | 'feature' | 'task' | 'epic';
  assigneeId?: string;
  reporterId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  labels: string[];
  assignee?: User;
  reporter?: User;
  comments?: Comment[];
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  leadId: string;
  createdAt: Date;
  lead?: User;
}

class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private issues: Map<string, Issue> = new Map();
  private projects: Map<string, Project> = new Map();
  private comments: Map<string, Comment> = new Map();
  private issueCounter: number = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed users with passwords (password: "password123" for all demo users)
    const users: User[] = [
      { id: 'u1', name: 'John Doe', email: 'john@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    ];
    users.forEach(user => this.users.set(user.id, user));

    // Seed projects
    const projects: Project[] = [
      {
        id: 'p1',
        key: 'PROJ',
        name: 'Main Project',
        description: 'Our primary product development',
        leadId: 'u1',
        createdAt: new Date('2024-01-01'),
      },
    ];
    projects.forEach(project => this.projects.set(project.id, project));

    // Seed issues
    const issues: Issue[] = [
      {
        id: `PROJ-1`,
        title: 'Setup authentication system',
        description: 'Implement JWT-based authentication for the application',
        status: 'in-progress',
        priority: 'high',
        type: 'feature',
        assigneeId: 'u1',
        reporterId: 'u2',
        projectId: 'p1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        labels: ['backend', 'security'],
      },
      {
        id: `PROJ-2`,
        title: 'Fix navigation menu on mobile',
        description: 'The navigation menu is not responsive on mobile devices',
        status: 'todo',
        priority: 'medium',
        type: 'bug',
        assigneeId: 'u2',
        reporterId: 'u3',
        projectId: 'p1',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        labels: ['frontend', 'mobile'],
      },
      {
        id: `PROJ-3`,
        title: 'Database optimization',
        description: 'Optimize database queries for better performance',
        status: 'done',
        priority: 'low',
        type: 'task',
        assigneeId: 'u3',
        reporterId: 'u1',
        projectId: 'p1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        labels: ['backend', 'performance'],
      },
      {
        id: `PROJ-4`,
        title: 'User Dashboard Redesign',
        description: 'Complete redesign of the user dashboard with new metrics and visualizations',
        status: 'todo',
        priority: 'high',
        type: 'epic',
        assigneeId: 'u1',
        reporterId: 'u2',
        projectId: 'p1',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
        labels: ['frontend', 'ux'],
      },
    ];
    issues.forEach(issue => {
      this.issues.set(issue.id, issue);
      this.issueCounter = Math.max(this.issueCounter, parseInt(issue.id.split('-')[1]) + 1);
    });

    // Seed comments
    const comments: Comment[] = [
      {
        id: 'c1',
        issueId: 'PROJ-1',
        userId: 'u2',
        content: 'I have started working on the JWT implementation.',
        createdAt: new Date('2024-01-16'),
      },
      {
        id: 'c2',
        issueId: 'PROJ-1',
        userId: 'u1',
        content: 'Great! Let me know if you need any help.',
        createdAt: new Date('2024-01-17'),
      },
    ];
    comments.forEach(comment => this.comments.set(comment.id, comment));
  }

  // User methods
  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  getUserById(id: string): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  createUser(userData: Omit<User, 'id' | 'avatar'>): User {
    const newUser: User = {
      ...userData,
      id: `u${this.users.size + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
    };
    this.users.set(newUser.id, newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  validateUser(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Project methods
  getAllProjects(): Project[] {
    return Array.from(this.projects.values()).map(project => ({
      ...project,
      lead: this.users.get(project.leadId),
    }));
  }

  getProjectById(id: string): Project | undefined {
    const project = this.projects.get(id);
    if (project) {
      return {
        ...project,
        lead: this.users.get(project.leadId),
      };
    }
    return undefined;
  }

  createProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const newProject: Project = {
      ...project,
      id: `p${this.projects.size + 1}`,
      createdAt: new Date(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  deleteProject(id: string): boolean {
    // Delete all issues associated with this project
    const projectIssues = Array.from(this.issues.values()).filter(issue => issue.projectId === id);
    projectIssues.forEach(issue => {
      this.deleteIssue(issue.id);
    });

    return this.projects.delete(id);
  }

  // Issue methods
  getAllIssues(projectId?: string): Issue[] {
    let issues = Array.from(this.issues.values());

    if (projectId) {
      issues = issues.filter(issue => issue.projectId === projectId);
    }

    return issues.map(issue => ({
      ...issue,
      assignee: issue.assigneeId ? this.users.get(issue.assigneeId) : undefined,
      reporter: this.users.get(issue.reporterId),
      comments: this.getCommentsByIssueId(issue.id),
    }));
  }

  getIssueById(id: string): Issue | undefined {
    const issue = this.issues.get(id);
    if (issue) {
      return {
        ...issue,
        assignee: issue.assigneeId ? this.users.get(issue.assigneeId) : undefined,
        reporter: this.users.get(issue.reporterId),
        comments: this.getCommentsByIssueId(issue.id),
      };
    }
    return undefined;
  }

  createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Issue {
    const project = this.projects.get(issue.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newIssue: Issue = {
      ...issue,
      id: `${project.key}-${this.issueCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.set(newIssue.id, newIssue);
    return newIssue;
  }

  updateIssue(id: string, updates: Partial<Omit<Issue, 'id' | 'createdAt'>>): Issue | undefined {
    const issue = this.issues.get(id);
    if (issue) {
      const updatedIssue = {
        ...issue,
        ...updates,
        updatedAt: new Date(),
      };
      this.issues.set(id, updatedIssue);
      return this.getIssueById(id);
    }
    return undefined;
  }

  deleteIssue(id: string): boolean {
    // Delete associated comments
    const comments = Array.from(this.comments.values()).filter(c => c.issueId === id);
    comments.forEach(comment => this.comments.delete(comment.id));

    return this.issues.delete(id);
  }

  // Comment methods
  getCommentsByIssueId(issueId: string): Comment[] {
    return Array.from(this.comments.values())
      .filter(comment => comment.issueId === issueId)
      .map(comment => ({
        ...comment,
        user: this.users.get(comment.userId),
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const newComment: Comment = {
      ...comment,
      id: `c${this.comments.size + 1}`,
      createdAt: new Date(),
    };
    this.comments.set(newComment.id, newComment);

    // Update issue's updatedAt
    const issue = this.issues.get(comment.issueId);
    if (issue) {
      issue.updatedAt = new Date();
      this.issues.set(comment.issueId, issue);
    }

    return newComment;
  }

  deleteComment(id: string): boolean {
    return this.comments.delete(id);
  }
}

// Create singleton instance
const db = new InMemoryDatabase();

export default db;