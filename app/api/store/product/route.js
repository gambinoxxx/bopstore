import authSeller from "@/middlewares/authSeller";
import {getAuth} from "@clerk/nextjs/server" 
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import imagekit from "@/configs/imageKit";


// add a new product
export async function POST(request) {
    try{
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }
        //get the data from the form    
        const formData = await request.formData()
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const category = formData.get("category")
        const images = formData.getAll("images")
        const specificationsString = formData.get("specifications");

        if (!name || !description || !mrp || !price || !category || !images){
            return NextResponse.json({error: "missing product details"}, {status: 400})
        }
        // uploading images to imagekit
        const imagesUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products"
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto"},
                    {format: "Webp"},
                    {width: "1024"}
                ]
            })
            return url
        }))

        // Parse the specifications string back into a JSON object
        const specifications = specificationsString ? JSON.parse(specificationsString) : {};

        await prisma.product.create({
            data:{
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId,
                specifications, // Add the parsed object here
            }
        })
        return NextResponse.json({message: "product added successfully"})   

    } 
    catch (error) {

        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//get all products for a seller 
export async function GET(request){
    try{
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }
        const products = await prisma.product.findMany({
            where: {
                storeId,
                isArchived: false // Only show non-archived products to the seller
            }
        })
        return NextResponse.json({products})
    }catch (error){
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, 
            {status: 400})

    }   
}

// update product stock
export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const body = await request.json();
        const { productId, stock, isHotDeal } = body;

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId: storeId,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found or you don't have permission to edit it." }, { status: 404 });
        }

        // Scenario 1: Update stock
        if (stock !== undefined) {
            if (isNaN(stock)) {
                return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
            }
            await prisma.product.update({
                where: { id: productId },
                data: { stock: Number(stock) },
            });
            return NextResponse.json({ message: "Stock updated successfully" });
        }

        // Scenario 2: Update Hot Deal status
        if (typeof isHotDeal === 'boolean') {
            await prisma.product.update({
                where: { id: productId },
                data: { isHotDeal },
            });
            return NextResponse.json({ message: "Hot Deal status updated" });
        }

        return NextResponse.json({ error: "Missing or invalid update details" }, { status: 400 });
    } catch (error) {
        console.error("Error updating stock:", error);
        return NextResponse.json({ error: error.message || "Failed to update stock" }, { status: 500 });
    }
}

// soft delete a product (archive)
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Perform a "soft delete" by archiving the product
        await prisma.product.update({
            where: { id: productId, storeId: storeId }, // Ensure seller can only archive their own product
            data: { isArchived: true },
        });

        return NextResponse.json({ message: 'Product archived successfully' });
    } catch (error) {
        console.error("Error archiving product:", error);
        return NextResponse.json({ error: "Failed to archive product" }, { status: 500 });
    }
}