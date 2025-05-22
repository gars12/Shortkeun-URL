import { NextResponse } from 'next/server';
import { deleteShortUrl } from '../../../../../lib/shorturl';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Hapus URL pendek (soft delete)
    await deleteShortUrl(id);

    return NextResponse.json(
      { success: true, message: 'URL pendek berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error menghapus URL pendek:', error);

    // Specific error handling
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, message: 'URL pendek tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menghapus URL pendek' },
      { status: 500 }
    );
  }
} 