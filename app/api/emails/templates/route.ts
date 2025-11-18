import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API Routes for Email Templates CRUD
 */

// GET all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching templates:', error);
      throw error;
    }

    return NextResponse.json({ templates: data || [] });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        error: `Failed to fetch templates: ${error.message}`,
        hint: 'Make sure you have run the email_management migration'
      },
      { status: 500 }
    );
  }
}

// POST new template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();
    console.log('Creating template:', templateData);

    const { data, error } = await supabase
      .from('email_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating template:', error);
      throw error;
    }

    console.log('Template created successfully:', data);
    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { 
        error: `Failed to create template: ${error.message || 'Unknown error'}`,
        details: error.message,
        hint: 'Make sure the email_templates table exists in your database'
      },
      { status: 500 }
    );
  }
}

// PUT update template
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
