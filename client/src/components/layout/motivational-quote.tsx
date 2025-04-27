import { useState, useEffect } from "react";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getItem, setItem } from "@/lib/local-storage";

export default function MotivationalQuote() {
  const [visible, setVisible] = useState(true);
  const [quote, setQuote] = useState(getQuoteOfTheDay());
  const { user } = useAuth();
  
  // Check local storage for hide status when component mounts
  useEffect(() => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const quoteStatus = getItem<{ hidden: boolean, date: string }>('quote_status', { hidden: false, date: '' });
    
    // If the quote was hidden today, keep it hidden
    if (quoteStatus.hidden && quoteStatus.date === today) {
      setVisible(false);
    } else {
      // If it's a new day, reset status and show quote
      setVisible(true);
      setItem('quote_status', { hidden: false, date: today });
    }
  }, [user]);
  
  const hideQuote = () => {
    setVisible(false);
    
    // Save hide status to local storage with today's date
    const today = new Date().toISOString().split('T')[0];
    setItem('quote_status', { hidden: true, date: today });
    
    // Auto-hide after animation completes
    setTimeout(() => {
      setVisible(false);
    }, 500);
  };
  
  // Auto-hide after 10 seconds if visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hideQuote();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-primary text-white shadow-md transition-all duration-300 ease-in-out transform`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <p className="font-accent text-sm font-medium">{quote.text}</p>
        <button 
          className="text-white opacity-70 hover:opacity-100 focus:outline-none"
          onClick={hideQuote}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
