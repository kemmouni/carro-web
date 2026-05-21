"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, Phone, Package, Clock, CheckCheck, Search } from "lucide-react";

interface Message {
  id: string;
  productId: string | null;
  storeId: string;
  fromUserId: string | null;
  fromName: string;
  fromEmail: string | null;
  fromPhone: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  product: { id: string; title: string } | null;
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function MessagesClient({ initialMessages, storeId }: { initialMessages: Message[]; storeId: string }) {
  const [messages, setMessages]     = useState<Message[]>(initialMessages);
  const [selected, setSelected]     = useState<Message | null>(null);
  const [search, setSearch]         = useState("");

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.fromName.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      (m.fromEmail ?? "").toLowerCase().includes(q)
    );
  });

  const unread = messages.filter((m) => !m.isRead).length;

  async function markRead(msg: Message) {
    if (msg.isRead) { setSelected(msg); return; }
    setSelected(msg);
    await fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
  }

  async function markAllRead() {
    const unreadIds = messages.filter((m) => !m.isRead).map((m) => m.id);
    if (!unreadIds.length) return;
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });
    // Also mark messages
    await Promise.all(
      unreadIds.map((id) =>
        fetch(`/api/messages/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        })
      )
    );
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-dark-border flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-white">Messages</h1>
              {unread > 0 && (
                <p className="text-[12px] text-brand-orange">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="w-full bg-dark-input border border-dark-border rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-4 text-center">
              <MessageSquare size={40} className="text-gray-600 mb-3" />
              <p className="text-[13px] font-semibold text-white mb-1">No messages yet</p>
              <p className="text-[12px] text-gray-500">Inquiries from buyers will appear here.</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => markRead(msg)}
                className={`w-full text-left px-4 py-3.5 border-b border-dark-border transition-colors ${
                  selected?.id === msg.id
                    ? "bg-brand-orange/10 border-l-2 border-l-brand-orange"
                    : "hover:bg-dark-secondary/50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-dark-input flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-brand-orange">
                    {msg.fromName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[13px] font-semibold truncate ${!msg.isRead ? "text-white" : "text-gray-300"}`}>
                        {msg.fromName}
                      </span>
                      <span className="text-[11px] text-gray-500 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                    </div>
                    {msg.product && (
                      <p className="text-[11px] text-brand-orange truncate">{msg.product.title}</p>
                    )}
                    <p className="text-[12px] text-gray-500 truncate mt-0.5">{msg.content}</p>
                    {!msg.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-orange mt-1" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="hidden md:flex flex-1 flex-col">
        {selected ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-input flex items-center justify-center text-[14px] font-bold text-brand-orange">
                  {selected.fromName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">{selected.fromName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {selected.fromEmail && (
                      <a href={`mailto:${selected.fromEmail}`} className="text-[12px] text-gray-400 hover:text-brand-orange flex items-center gap-1 transition-colors">
                        <Mail size={11} /> {selected.fromEmail}
                      </a>
                    )}
                    {selected.fromPhone && (
                      <a href={`tel:${selected.fromPhone}`} className="text-[12px] text-gray-400 hover:text-brand-orange flex items-center gap-1 transition-colors">
                        <Phone size={11} /> {selected.fromPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selected.product && (
                <div className="flex items-center gap-2 bg-dark-secondary rounded-lg px-4 py-3 mb-4 text-[12px]">
                  <Package size={13} className="text-brand-orange flex-shrink-0" />
                  <span className="text-gray-400">Regarding: </span>
                  <Link href={`/product/${selected.product.id}`} target="_blank" className="text-brand-orange hover:underline font-semibold">
                    {selected.product.title}
                  </Link>
                </div>
              )}

              <div className="bg-dark-secondary rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl">
                <p className="text-[14px] text-white leading-relaxed whitespace-pre-line">{selected.content}</p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-500">
                  <Clock size={11} />
                  {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Reply hint */}
              <div className="mt-6 p-4 rounded-xl bg-brand-orange/5 border border-brand-orange/20 text-[12px] text-gray-400">
                <p className="font-semibold text-brand-orange mb-1">Reply to this inquiry</p>
                {selected.fromEmail ? (
                  <p>Send a reply to <a href={`mailto:${selected.fromEmail}`} className="text-brand-orange hover:underline">{selected.fromEmail}</a></p>
                ) : selected.fromPhone ? (
                  <p>Call or WhatsApp <a href={`https://wa.me/${selected.fromPhone.replace(/\D/g, "")}`} target="_blank" className="text-brand-orange hover:underline">{selected.fromPhone}</a></p>
                ) : (
                  <p>No contact info provided by the buyer.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={56} className="text-gray-700 mb-4" />
            <p className="text-[15px] font-bold text-white mb-2">Select a message</p>
            <p className="text-[13px] text-gray-500">Click on an inquiry from the list to read it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
