import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Search by title or description
    if (searchParams.has('search')) {
      const searchRegex = new RegExp(searchParams.get('search') as string, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Filter by shop category
    if (searchParams.has('shop_category')) {
      const shopCat = searchParams.get('shop_category');
      if (shopCat && shopCat !== 'Select Shop') query.shop_category = shopCat;
    }
    
    // Filter by categories
    if (searchParams.has('categories')) {
      const categories = searchParams.get('categories')?.split(',') || [];
      if (categories.length) query.categories = { $in: categories };
    }

    // Filter by price range
    if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
      query.price = {};
      if (searchParams.has('minPrice')) {
        query.price.$gte = parseFloat(searchParams.get('minPrice') as string);
      }
      if (searchParams.has('maxPrice')) {
        query.price.$lte = parseFloat(searchParams.get('maxPrice') as string);
      }
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Sorting safely
    let productsQuery = Product.find(query).skip(skip).limit(limit);

    if (searchParams.has('sort')) {
      const sortParam = searchParams.get('sort') as string;
      if (sortParam.includes(':')) {
        const [field, order] = sortParam.split(':');
        if (field && ['asc', 'desc'].includes(order)) {
          const sortObj: any = {};
          sortObj[field] = order === 'asc' ? 1 : -1;
          productsQuery = productsQuery.sort(sortObj);
        }
      }
    } else {
      // Default sorting
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    // Validate minimum fields
    if (!body.title || !body.price || !body.shop_category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    const status = error.message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
