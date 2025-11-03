import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BuyukSlider } from '@/models/BuyukSlider';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const slider = await BuyukSlider.findById(id).lean();
    
    if (!slider) {
      return NextResponse.json(
        { success: false, error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: slider
    });
  } catch (error: any) {
    console.error('Error fetching buyuk slider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const { id } = await params;
    const slider = await BuyukSlider.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!slider) {
      return NextResponse.json(
        { success: false, error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: slider,
      message: 'Slider başarıyla güncellendi'
    });
  } catch (error: any) {
    console.error('Error updating buyuk slider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const slider = await BuyukSlider.findByIdAndDelete(id);

    if (!slider) {
      return NextResponse.json(
        { success: false, error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slider başarıyla silindi'
    });
  } catch (error: any) {
    console.error('Error deleting buyuk slider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
