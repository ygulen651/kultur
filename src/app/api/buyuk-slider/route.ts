import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BuyukSlider } from '@/models/BuyukSlider';

export async function GET() {
  try {
    await connectDB();
    
    const sliders = await BuyukSlider.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      items: sliders,
      count: sliders.length
    });
  } catch (error: any) {
    console.error('Error fetching buyuk sliders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Görsel gerekli' },
        { status: 400 }
      );
    }

    // Create new slider
    const slider = new BuyukSlider({
      title: body.title,
      subtitle: body.subtitle || '',
      description: body.description || '',
      imageUrl: body.imageUrl,
      imageFilename: body.imageFilename || '',
      link: body.link || '',
      buttonText: body.buttonText || '',
      buttonLink: body.buttonLink || '',
      order: body.order || 1,
      isActive: body.isActive !== undefined ? body.isActive : true,
      backgroundColor: body.backgroundColor || '#000000',
      textColor: body.textColor || '#ffffff',
      createdBy: 'admin', // TODO: Get from auth
    });

    await slider.save();

    return NextResponse.json({
      success: true,
      item: slider,
      message: 'Slider başarıyla eklendi'
    });
  } catch (error: any) {
    console.error('Error creating buyuk slider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
