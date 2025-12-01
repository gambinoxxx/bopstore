'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

const OrderItem = ({ order }) => {
    return (
        <>
            {/* --- FIX: Removed onClick handler and cursor-pointer class --- */}
            <tr className="text-sm hover:bg-gray-50 transition-colors">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto object-contain"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm gap-1">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    <p>
                                        {formatPrice(item.price)} x {item.quantity}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(order.createdAt).toDateString()}
                                    </p>
                                    {/* --- FIX: Removed "Rate Product" button and related logic --- */}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center font-medium max-md:hidden">{formatPrice(order.total)}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address.name}, {order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                    <p>{order.address.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 capitalize ${
                            order.status === 'DELIVERED'
                                ? 'text-green-500 bg-green-100'
                                : 'text-yellow-500 bg-yellow-100'
                        }`}
                    >
                        <DotIcon size={10} className="scale-150" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address.name}, {order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                    <p>{order.address.phone}</p>
                    <br />
                    <div className="flex items-center capitalize">
                        <span className='text-center mx-auto px-6 py-1.5 rounded bg-green-100 text-green-700' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem;
