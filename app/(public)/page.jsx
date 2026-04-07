'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import Faq from "@/components/Faq";
import JoeDiscovery from "@/components/JoeDiscovery"; // New section to introduce JOE

export default function Home() {
    return (
        <div>
            <Hero />
            <JoeDiscovery /> {/* Introduce AI assistant early in the user journey */}
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Faq />
            <Newsletter />
        </div>
    );
}
