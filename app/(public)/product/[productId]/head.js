export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.productId}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const product = data.product;

    if (!product) {
      return {
        title: "Product not found | BopStore",
      };
    }

    return {
      title: `${product.name} | Buy Online on BopStore`,
      description: product.description?.slice(0, 160),

      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.images?.[0]],
        url: `https://bopstore.com.ng/product/${product.id}`,
      },

      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: [product.images?.[0]],
      },
    };
  } catch (error) {
    return {
      title: "Product | BopStore",
    };
  }
}
