import React, { useState } from "react";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to your chat service
    console.log("Message sent:", message);
    setMessage("");
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white dark:bg-[#0f1f3a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-semibold">DEBBY Support</h3>
              <p className="text-xs text-blue-100 dark:text-blue-200">We're here to help!</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#0a1628]">
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#0f1f3a] rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Hi! 👋 How can we help you today?
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a1628] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                aria-label="Send message"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
