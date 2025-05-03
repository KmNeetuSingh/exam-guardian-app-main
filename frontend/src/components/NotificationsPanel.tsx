import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, UserCheck, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: 'verification' | 'session' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsPanel = ({ 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsPanelProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'session':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            View your recent notifications and updates
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
        
        <div className="space-y-4 mt-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(notification.type)}
                    <h3 className="text-sm font-medium">{notification.title}</h3>
                  </div>
                  {!notification.read && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 ml-8">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2 ml-8">{formatDate(notification.timestamp)}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel; 