// src/app/api/shorturl/all/route.js
import { NextResponse } from 'next/server';
import supabase from '../../../../lib/supabase';
import { getUserFromSession } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const user = await getUserFromSession();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - User session not found or invalid' },
        { status: 401 }
      );
    }
    
    const { data: urls, error: urlsError } = await supabase
      .from('short_urls')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (urlsError) {
      console.error("Error fetching user's short URLs:", urlsError);
      throw urlsError;
    }

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }
    
    const urlIds = urls.map(url => url.id);
    let detailedClickData = [];

    if (urlIds.length > 0) {
        const { data: clicksFromDb, error: clickError } = await supabase
            .from('clicks')
            .select('short_url_id, created_at')
            .in('short_url_id', urlIds);

        if (clickError) {
            console.error("Error fetching detailed click history:", clickError);
        } else {
            detailedClickData = clicksFromDb || [];
        }
    }
    
    const processedUrls = urls.map(url => {
      const urlSpecificClicks = detailedClickData
        .filter(click => click.short_url_id === url.id)
        .map(click => ({ 
            timestamp: click.created_at,
        }));
      
      const isUrlExpired = url.expired_at ? new Date() > new Date(url.expired_at) : false;

      return {
        id: url.id,
        originalUrl: url.original_url,
        shortenedUrl: url.shortened_url,
        clickCount: url.click_count || 0,
        expiredAt: url.expired_at,
        createdAt: url.created_at,
        updatedAt: url.updated_at,
        isExpired: isUrlExpired,
        clickHistory: urlSpecificClicks,
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
    console.error("API /api/shorturl/all error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
