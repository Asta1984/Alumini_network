'use client'

import React, { useState } from 'react'
import { Github, Linkedin, Twitter, Instagram, Globe } from 'lucide-react'

interface SocialLink {
  platform: 'GITHUB' | 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'PORTFOLIO'
  profileUrl: string
}

interface Message {
  id: string
  text: string
}

interface AlumniCardProps {
  avatarUrl: string | null
  name: string
  nickname?: string | null
  bio?: string | null
  socialLinks: SocialLink[]
  messages?: Message[]
  profileUrl?: string
}

const platformIconMap: Record<string, React.ComponentType<{ size: number; className: string }>> = {
  GITHUB: Github,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  INSTAGRAM: Instagram,
  PORTFOLIO: Globe,
}

export function AlumniCard({ avatarUrl, name, nickname, bio, socialLinks, messages, profileUrl }: AlumniCardProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <div className="relative w-full max-w-sm">
      <div
        className="relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 ease-out backdrop-blur-xl bg-card/40 border-white/10 hover:border-white/20 cursor-pointer group"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => profileUrl && window.location.href && (window.location.href = profileUrl)}
      >
        {/* Avatar */}
        <div className="w-24 h-24 mb-4 rounded-full p-1 border-2 border-white/20 group-hover:border-white/40 transition-colors">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name}'s Avatar`}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/96x96/6366f1/white?text=${name.charAt(0)}`
              }}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-2xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-card-foreground text-center">{name}</h2>

        {/* Nickname */}
        {nickname && <p className="mt-1 text-sm font-medium text-primary text-center">{nickname}</p>}

        {/* Bio */}
        {bio && <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{bio}</p>}

        {/* Divider */}
        <div className="w-1/2 h-px my-6 rounded-full bg-border" />

        {/* Messages */}
        {messages && messages.length > 0 && (
          <div className="w-full mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Memories</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {messages.map((msg) => (
                <p key={msg.id} className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                  {msg.text}
                </p>
              ))}
            </div>
            <div className="w-1/2 h-px my-4 rounded-full bg-border mx-auto" />
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {socialLinks.map((link) => {
            const IconComponent = platformIconMap[link.platform]
            return (
              <div key={link.platform} className="relative">
                <a
                  href={link.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group/social overflow-hidden bg-secondary/50 hover:bg-secondary"
                  onMouseEnter={() => setHoveredItem(link.platform)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-label={link.platform}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    {IconComponent && (
                      <IconComponent size={20} className="transition-all duration-200 ease-out text-secondary-foreground/70 group-hover/social:text-secondary-foreground" />
                    )}
                  </div>
                </a>
                {/* Tooltip */}
                <div
                  role="tooltip"
                  className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-popover text-popover-foreground border-border ${
                    hoveredItem === link.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                  {link.platform}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-b border-r border-border" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-30 bg-linear-to-r from-indigo-500/50 to-purple-500/50" />
    </div>
  )
}
