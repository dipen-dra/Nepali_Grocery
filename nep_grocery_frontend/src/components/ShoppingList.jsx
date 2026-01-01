
import Draggable from 'react-draggable';
import React, { useState, useEffect, useRef } from 'react'; 
import { ChevronUp, ChevronDown, Trash2, Plus, Paperclip } from 'lucide-react';

const ShoppingList = () => {
  const [items, setItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem('shoppingList');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error("Failed to parse shopping list from localStorage", error);
      return [];
    }
  });

  const [newItemText, setNewItemText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  
  
  const nodeRef = useRef(null); 

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemText.trim() === '') return;
    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      checked: false,
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleCheck = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    
    <Draggable nodeRef={nodeRef} handle=".shopping-list-handle" bounds="parent">
      
      <div ref={nodeRef} className="fixed bottom-5 right-5 w-64 bg-yellow-200 shadow-2xl rounded-lg z-30 font-sans">
        <div
          className="shopping-list-handle flex items-center justify-between p-3 bg-yellow-300 rounded-t-lg cursor-move select-none"
          
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-">
            <Paperclip size={18} className="text-yellow-800 -rotate-45" />
            <h3 className="font-bold text-yellow-900">Shopping List</h3>
          </div>
          <button className="text-yellow-900" aria-label={isOpen ? 'Collapse list' : 'Expand list'}>
            {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-3">
            <div className="max-h-48 overflow-y-auto mb-2 pr-2">
              {items.length > 0 ? (
                <ul>
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-1.5 group">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleCheck(item.id)}
                        className="h-4 w-4 text-green-600 bg-yellow-100 border-yellow-400 rounded focus:ring-green-500 cursor-pointer flex-shrink-0"
                      />
                      <span className={`flex-1 text-sm break-words ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                        aria-label={`Delete ${item.text}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">Your list is empty.</p>
              )}
            </div>

            <form onSubmit={handleAddItem} className="flex items-center gap-2 mt-2 border-t border-yellow-300 pt-3">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add an item..."
                className="flex-1 bg-transparent border-b-2 border-yellow-400 focus:border-yellow-600 focus:outline-none text-sm text-gray-800 placeholder-gray-500 py-1"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full transition-colors disabled:bg-gray-400"
                aria-label="Add item"
                disabled={!newItemText.trim()}
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default ShoppingList;