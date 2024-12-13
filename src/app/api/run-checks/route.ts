import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function logSecurityIssue(
  supabase: any, 
  feature: 'RLS' | 'MFA' | 'PITR', 
  status: boolean, 
  resourceName?: string
) {
  const suggestedFixes = {
    RLS: "Enable RLS with: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY; and add appropriate policies",
    MFA: "Enable MFA in authentication settings and require users to set up 2FA",
    PITR: "Enable PITR in your project settings for better backup and recovery options"
  };

  const autoFixable = {
    RLS: true,
    MFA: false,
    PITR: false
  };

  await supabase
    .from('security_logs')
    .insert({
      feature,
      status,
      resource_name: resourceName,
      suggested_fix: !status ? suggestedFixes[feature] : null,
      auto_fixable: !status ? autoFixable[feature] : false
    });
}

async function checkRLSStatus(supabase: any) {
  const { data: rlsData, error: rlsError } = await supabase
    .rpc('check_rls_status');

  if (rlsError) {
    console.error('RLS check failed:', rlsError);
    return [{
      table: 'posts_table',
      rls_enabled: false,
      has_policies: false,
      policy_count: 0
    }];
  }

  // Log status for each table
  for (const table of rlsData) {
    await logSecurityIssue(
      supabase,
      'RLS',
      table.rls_enabled && table.has_policies,
      table.table_name
    );
  }

  return rlsData.map(table => ({
    table: table.table_name,
    rls_enabled: table.rls_enabled,
    has_policies: table.has_policies,
    policy_count: table.policy_count
  }));
}

export async function GET(req: NextRequest) {
  const projectUrl = req.cookies.get('projectUrl')?.value;
  const serviceKey = req.cookies.get('serviceKey')?.value;

  if (!projectUrl || !serviceKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = createClient(projectUrl, serviceKey);

  try {
    // Check and log MFA status
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const mfaResults = users.map(user => ({
      id: user.id,
      email: user.email,
      mfa_enabled: Boolean(user.factors?.length > 0)
    }));

    // Log MFA status for each user
    for (const user of mfaResults) {
      await logSecurityIssue(
        supabase,
        'MFA',
        user.mfa_enabled,
        user.email
      );
    }

    // Check and log RLS status
    const rlsResults = await checkRLSStatus(supabase);

    // Check and log PITR status
    const { data: pitrData, error: pitrError } = await supabase
      .rpc('check_pitr_status');

    if (pitrError) {
      console.error('PITR check error:', pitrError);
    }

    // Log PITR status
    await logSecurityIssue(
      supabase,
      'PITR',
      pitrData?.[0]?.pitr_enabled || false
    );

    return NextResponse.json({
      MFA: mfaResults,
      RLS: rlsResults,
      PITR: pitrData?.[0]?.pitr_enabled || false,
      // Include recent logs in the response
      logs: await supabase
        .from('security_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)
    });
  } catch (error) {
    console.error('Error running checks:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error
    }, { status: 500 });
  }
}