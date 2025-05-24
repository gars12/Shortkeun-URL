import { NextResponse } from 'next/server';
// import { createShortUrl } from '../../../../lib/shorturl';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { getUserFromSession } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { originalUrl, customSlug, expiry, userId } = await request.json();
    
    // Validasi URL
    if (!originalUrl) {
      return NextResponse.json(
        { success: false, message: 'URL wajib diisi' },
        { status: 400 }
      );
    }
    
    // Validasi format URL (harus dimulai dengan http:// atau https://)
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    if (!urlPattern.test(originalUrl)) {
      return NextResponse.json(
        { success: false, message: 'Format URL tidak valid' },
        { status: 400 }
      );
    }
    
    // Jika userId tidak disediakan, ambil dari session
    let finalUserId = userId;
    if (!finalUserId) {
      const user = await getUserFromSession();
      if (user) {
        finalUserId = user.id;
      } else {
        finalUserId = 1; // User anonymous
      }
    }
    
    // Generate kode pendek
    let shortCode = customSlug;
    if (!shortCode) {
      // Generate kode unik jika tidak ada custom slug
      shortCode = nanoid(6);
    }
    
    // Buat URL lengkap
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    
    // Siapkan data untuk database
    let expiresAt = null;
    
    // Jika ada expiry, hitung tanggalnya
    if (expiry && expiry.value && expiry.unit) {
      const now = new Date();
      const value = parseInt(expiry.value, 10);
      
      switch (expiry.unit) {
        case 'minutes':
          now.setMinutes(now.getMinutes() + value);
          break;
        case 'hours':
          now.setHours(now.getHours() + value);
          break;
        case 'days':
          now.setDate(now.getDate() + value);
          break;
        case 'weeks':
          now.setDate(now.getDate() + (value * 7));
          break;
        case 'months':
          now.setMonth(now.getMonth() + value);
          break;
        default:
          // Default to days if unit tidak valid
          now.setDate(now.getDate() + value);
      }
      
      expiresAt = now.toISOString();
    }
    
    // Prepare data untuk insert
    const now = new Date();
    const insertData = {
      original_url: originalUrl,
      shortened_url: shortenedUrl,
      click_count: 0,
      expired_at: expiresAt,
      created_at: now,
      updated_at: now,
      user_id: finalUserId
    };
    
    // Insert ke Supabase menggunakan REST API langsung
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Make API request to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/short_urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    });
    
    if (!response.ok) {
      throw new Error(`Database error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Gagal menyimpan URL pendek');
    }
    
    // Return response
    return NextResponse.json(
      {
        success: true,
        message: 'URL pendek berhasil dibuat',
        shortUrl: {
          id: data[0].id,
          originalUrl: data[0].original_url,
          shortenedUrl: data[0].shortened_url,
          clickCount: data[0].click_count,
          expiredAt: data[0].expired_at,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
          userId: data[0].user_id
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 