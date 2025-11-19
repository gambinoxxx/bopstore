import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import { ClerkProvider}  from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "BOPSTORE. - shop all you want",
    description: "BOPSTORE. - shop all you want",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <ClerkProvider
                    proxyUrl="https://accounts.bopstore.com.ng"
                    appearance={{
                        elements: {
                            modalBackdrop: "bg-black/50",
                        },
                    }}
                >
                    <StoreProvider>
                        <Toaster />
                        {children}
                    </StoreProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
