import React from "react";

const CategoryCard = ({ icon, name, count }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all p-4 text-center cursor-pointer">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="text-gray-500 text-sm">{count} courses</p>
    </div>
  );
};

export default CategoryCard;
