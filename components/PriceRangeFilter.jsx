'use client';

import { useState } from 'react';

// Define the price ranges you want to offer
const priceOptions = [
    { id: 'all', label: 'All Prices', value: null },
    { id: 'under-10k', label: 'Under ₦10,000', value: { min: 0, max: 9999.99 } },
    { id: '10k-50k', label: '₦10,000 - ₦50,000', value: { min: 10000, max: 50000 } },
    { id: '50k-100k', label: '₦50,000 - ₦100,000', value: { min: 50000, max: 100000 } },
    { id: 'over-100k', label: 'Over ₦100,000', value: { min: 100000, max: Infinity } },
];

const PriceRangeFilter = ({ setSelectedPriceRange }) => {
    const [activeId, setActiveId] = useState('all');

    const handlePriceChange = (option) => {
        setActiveId(option.id);
        setSelectedPriceRange(option.value);
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-3 text-slate-800">Price Range</h3>
            <div className="space-y-2">
                {priceOptions.map(option => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price-range"
                            checked={activeId === option.id}
                            onChange={() => handlePriceChange(option)}
                            className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300"
                        />
                        <span className="text-slate-600">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PriceRangeFilter;