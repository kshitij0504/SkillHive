import { useNavigate } from "react-router-dom";
import React from "react";
const CommunityCard = ({ name, members, courses, image, communityId }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={image} alt={name} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center">
          <h3 className="text-white font-bold text-xl">{name}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>{members} members</span>
          <span>{courses} courses</span>
        </div>
        <button
          onClick={() => navigate(`/communities/join/${communityId}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Join ${name} community`}
        >
          Join Community
        </button>
      </div>
    </div>
  );
};

export default CommunityCard