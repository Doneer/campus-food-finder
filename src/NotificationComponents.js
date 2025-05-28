import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from './AuthContext';

export const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
	  //Only show notifications for demo student user
	  if (user && user.preferences.notifications && user.email === '111111@edu.p.lodz.pl') {
		if (notifications.length === 0) {
		  setNotifications([
			{
			  id: 1,
			  title: "New Discount at GIÀ pasta bar!",
			  message: "20% off all pasta dishes today for students",
			  type: "discount",
			  read: false,
			  timestamp: new Date(Date.now() - 1000 * 60 * 30) 
			},
			{
			  id: 2,
			  title: "New vegetarian option available",
			  message: "Bar Ha Long now offers vegetarian spring rolls",
			  type: "new_option",
			  read: false,
			  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) 
			}
		  ]);
		}
	  } else if (!user || user.email !== '111111@edu.p.lodz.pl') {
		setNotifications([]);
	  }
	}, [user, notifications.length]); 

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = user.preferences.notifications ? notifications.filter(n => !n.read).length : 0;

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-white hover:bg-blue-700 rounded-lg"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
		  {!user.preferences.notifications ? (
			<div className="p-4 text-center text-gray-500">
			  <p className="text-sm">Notifications are disabled</p>
			  <p className="text-xs mt-1">Enable them in your profile to receive updates</p>
			</div>
		  ) : notifications.length === 0 ? (
			<div className="p-4 text-center text-gray-500">
			  No notifications yet
			</div>
		  ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};