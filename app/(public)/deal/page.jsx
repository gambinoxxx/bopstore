"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Flame, Gift, Sparkles, Timer } from "lucide-react";

import Container from "@/components/Container";
import { Card, CardContent } from "@/app/(public)/ui/card";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2024-12-31") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return null;
    }
    return (
      <div key={interval} className="flex flex-col items-center bg-white rounded-lg p-3 shadow-md border">
        <span className="text-2xl font-bold text-slate-800">{timeLeft[interval]}</span>
        <span className="text-xs text-slate-500 uppercase">{interval}</span>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-4 gap-2">
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

const DealPage = () => {
  const products = useSelector((state) => state.product.list);
  const dealProducts = products.filter(p => p.discount > 15).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <Container className="pt-6">
        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span className="mx-2">/</span>
          <span>Hot Deals</span>
        </div>
      </Container>

      <Container className="py-8 sm:py-12">
        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Flame size={16} /> Hot Deal
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  End of Year Mega Sale
                </h1>
                <p className="max-w-2xl text-white/90">
                  Don't miss out on our biggest sale of the year! Get up to 70% off on your favorite brands and products. Limited time offer.
                </p>
              </div>
              <div className="lg:flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Timer size={20} />
                      <span className="font-semibold">Ends in:</span>
                    </div>
                    <CountdownTimer />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>

      <Container className="py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <Title title="Grab These Deals Now" description="All products in this collection are on a special discount for a limited time." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
};

export default DealPage;