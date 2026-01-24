import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Product from '../../../lib/models/product';

export async function GET(req: NextRequest) {
  await connectDB(); // Ensure MongoDB connected

  try {
    const { searchParams } = new URL(req.url);

    // Extract query params safely
    const page = Number(searchParams.get('page') || '1');
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || '';
    const order = searchParams.get('order') || '';
    const color = searchParams.get('color') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const shop_category = searchParams.get('shop_category') || '';

    // Build Mongo query
    const query: any = {};

    if (q) query.title = { $regex: q, $options: 'i' }; // text search
    if (color) query.colors = color;                   // filter by colors
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (shop_category && shop_category !== 'Select Shop') {
      query.shop_category = shop_category;
    }

    // Sorting safely
    const sortObj: any = {};
    if (sort && order && ['asc', 'desc'].includes(order.toLowerCase())) {
      sortObj[sort] = order.toLowerCase() === 'asc' ? 1 : -1;
    }

    // Pagination
    const limit = 10; // items per page
    const skip = (page - 1) * limit;

    // Fetch products from DB
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('Error fetching products:', err.message);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
