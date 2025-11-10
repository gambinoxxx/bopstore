"use client";

import { useState } from "react";
import {
  Search,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const faqs = [
  // Shopping FAQs
  {
    id: "shopping-1",
    question: "How do I place an order?",
    answer:
      "To place an order, browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or sign in, then provide your shipping information and payment details to complete your purchase.",
    category: "shopping",
  },
  {
    id: "shopping-2",
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "You can modify or cancel your order within 30 minutes of placing it. After this time, if your order hasn't been processed yet, please contact our customer service team immediately. Once your order is being prepared or shipped, modifications may not be possible.",
    category: "shopping",
  },
  {
    id: "shopping-3",
    question: "How do I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section. Real-time tracking information will be available there.",
    category: "shopping",
  },

  // Payment FAQs
  {
    id: "payment-1",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and other digital payment methods. All payments are processed securely through our encrypted payment system.",
    category: "payment",
  },
  {
    id: "payment-2",
    question: "Is my payment information secure?",
    answer:
      "Yes, absolutely. We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed securely through trusted payment gateways.",
    category: "payment",
  },

  // Shipping FAQs
  {
    id: "shipping-1",
    question: "How much does shipping cost?",
    answer:
      "Shipping costs vary based on your location and the shipping method you choose. Standard shipping is often free for orders over a certain amount. Express shipping options are available at checkout.",
    category: "shipping",
  },
  {
    id: "shipping-2",
    question: "How long does delivery take?",
    answer:
      "Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days. International shipping may take longer depending on the destination country.",
    category: "shipping",
  },

  // Returns FAQs
  {
    id: "returns-1",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy from the date of delivery. Items must be unused, in original condition, and include all original packaging and accessories. Some items may not be returnable.",
    category: "returns",
  },

  // Account FAQs
  {
    id: "account-1",
    question: "How do I create an account?",
    answer:
      "Click 'Sign Up' at the top of any page and provide your email address and create a password. You can also sign up using your Google or Facebook account for faster registration.",
    category: "account",
  },
  {
    id: "account-2",
    question: "I forgot my password. How do I reset it?",
    answer:
      "Click 'Sign In' and then 'Forgot Password'. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "account",
  },
];

const categories = [
  { id: "all", label: "All", icon: HelpCircle },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "account", label: "Account", icon: User },
];

const Faq = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Find answers to common questions about shopping, payments, shipping,
            and more.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-slate-200 focus:border-slate-400 rounded-xl shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-8 shadow-sm border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-sm ${
                        activeCategory === category.id
                          ? "bg-slate-700 text-white shadow-md"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{category.label}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="md:col-span-3">
            <div>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-2 hover:shadow-md transition-shadow"
                    >
                      <AccordionTrigger className="text-left text-slate-800 font-semibold hover:text-slate-600 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed pt-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    No results found
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your search terms or browse different
                    categories.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("all");
                    }}
                    variant="outline"
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;