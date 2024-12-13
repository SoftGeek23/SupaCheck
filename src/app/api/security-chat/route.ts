import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Context for different security features
const securityDocs = {
  RLS: `
    Enabling Row Level Security (RLS) in Supabase Dashboard:
    1. Navigate to Authentication > Policies in your Supabase dashboard
    2. Find the table you want to secure
    3. Click "Enable RLS" button
    4. Add policies through the UI:
       - Click "New Policy"
       - Use policy templates or create custom ones
       - Set who can access what data
    
    Common settings:
    - Enable read-only access
    - Allow authenticated users only
    - Enable full access for authenticated users
    - Custom policy with specific conditions
  `,
  
  MFA: `
    Setting up Multi-Factor Authentication (MFA) in Supabase:
    1. Go to Authentication > Providers in dashboard
    2. Enable MFA in authentication settings
    3. Guide users through MFA setup:
       - Users go to account settings
       - Click enable MFA
       - Scan QR code with authenticator app
       - Enter verification code
    
    Dashboard settings:
    - Optional vs Required MFA
    - Allowed authentication factors
    - Recovery options
    - User management
  `,
  
  PITR: `
    Enabling Point in Time Recovery (PITR) in Supabase:
    1. Go to Database > Backups in dashboard
    2. Find PITR section
    3. Enable PITR feature
    4. Select retention period
    
    Dashboard options:
    - Backup frequency
    - Retention period selection
    - Recovery point status
    - Backup health monitoring
  `
};

export async function POST(req: NextRequest) {
  try {
    const { messages, feature, resourceName } = await req.json();

    const systemPrompt = `You are a Supabase security expert assistant. You help users fix security issues and implement best practices.
    Current context: ${securityDocs[feature]}
    ${resourceName ? `Specifically for resource: ${resourceName}` : ''}
    
    Provide specific, actionable advice based on Supabase documentation. Include code examples when relevant.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in security chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 