import { NextResponse } from 'next/server';
import { getAllShortUrls, isExpired } from '../../../../lib/shorturl';
import supabase from '../../../../lib/supabase';
import { getUserFromSession } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    // Verifikasi user dari session
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Ambil semua URL pendek milik user
    const { data: urls, error } = await supabase
      .from('short_urls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Juga ambil data klik untuk setiap URL (jika ada)
    const { data: clickData, error: clickError } = await supabase
      .from('clicks')
      .select('*')
      .in('short_url_id', urls.map(url => url.id));
    
    // Process URLs and clicks if available
    const processedUrls = urls.map(url => {
      // Find click data for this URL
      const urlClicks = clickData?.filter(click => click.short_url_id === url.id) || [];
      
      return {
        id: url.id,
        originalUrl: url.original_url,
        shortenedUrl: url.shortened_url,
        clickCount: url.click_count || 0,
        expiredAt: url.expired_at,
        createdAt: url.created_at,
        updatedAt: url.updated_at,
        clicks: urlClicks
      };
    });
    
    return NextResponse.json(
      {
        success: true,
        data: processedUrls
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 