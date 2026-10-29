import { NextRequest, NextResponse } from 'next/server';
import { diagnosePlantIssue } from '@/lib/ai-doctor';
import { DiagnosisRequest } from '@/types/diagnosis';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DiagnosisRequest;

    if (!body || !body.symptoms || body.symptoms.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please describe the symptoms or visible issues on the plant.' },
        { status: 400 }
      );
    }

    const diagnosis = await diagnosePlantIssue(body);
    return NextResponse.json(diagnosis, { status: 200 });
  } catch (error) {
    console.error('AI Doctor API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during diagnosis. Please try again.' },
      { status: 500 }
    );
  }
}
