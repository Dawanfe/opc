"use client";

import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiUrl } from '@/lib/utils';

interface Event {
  id: number;
  location: string;
  organizer: string;
  date: string;
  name: string;
  registrationLink: string;
  guests: string;
  guestTitles: string;
  description: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/admin/events'))
      .then(res => res.json())
      .then(data => {
        // 按日期排序，取最新的活动
        const sortedEvents = data.sort((a: Event, b: Event) => {
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
        });
        setEvents(sortedEvents.slice(0, 12));
      })
      .catch(err => console.error('Failed to load events:', err));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">AI社区活动</h2>
          <p className="text-sm text-gray-500 mt-1">参加线上线下AI活动,认识更多同道中人,获取最新行业资讯</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{event.date}</span>
                </div>
                <h3 className="font-semibold text-[#111827] mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {event.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{event.location || '待定'}</span>
                </div>
                <p className="text-xs text-gray-400">主办方：{event.organizer}</p>
                {event.guestTitles && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    嘉宾：{event.guestTitles}
                  </p>
                )}
              </div>
            </div>

            {event.registrationLink && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  立即报名
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
