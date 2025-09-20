import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  try {
    const issues = db.getAllIssues(projectId || undefined);
    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const issue = db.createIssue(body);
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}