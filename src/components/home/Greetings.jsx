import { useState, useEffect } from 'react'
import { useSelector } from "react-redux";

const greeting = (hour) => (hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");

const Greetings = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const { name: userName, role } = useSelector((state) => state.user);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="flex justify-between items-center px-8 mt-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-wide">{greeting(dateTime.getHours())}, {userName}</h1>
        <p className="text-[#ababab] text-sm">
          {role === "Client" ? "Welcome! What would you like to eat today?" : "Give your best services for your customers!"}
        </p>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-[#f5f5f5] tracking-wide w-[130px]">{formatTime(dateTime)}</h1>
        <p className="text-[#ababab] text-sm">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
