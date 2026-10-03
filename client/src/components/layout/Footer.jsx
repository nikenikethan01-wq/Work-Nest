import { NavLink } from 'react-router-dom'
import { GoHome } from 'react-icons/go'
import { IoBriefcaseOutline } from 'react-icons/io5'
import {
  HiMiniMagnifyingGlass,
  HiMiniDocumentText,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'
import { CiFolderOn } from 'react-icons/ci'
import { meContext } from '../authentication/AuthRequired'
import React from 'react'

export default function Footer() {
  const { role } = React.useContext(meContext)
  const navItems =
    role === 'client'
      ? [
          {
            label: 'Home',
            path: '/client',
            icon: GoHome,
          },
          {
            label: 'Jobs',
            path: '/client/jobs',
            icon: IoBriefcaseOutline,
          },
          {
            label: 'Projects',
            path: '/client/projects',
            icon: CiFolderOn,
          },
          {
            label: 'Applications',
            path: '/client/applications',
            icon: HiMiniDocumentText,
          },
        ]
      : [
          {
            label: 'Home',
            path: '/freelancer',
            icon: GoHome,
          },
          {
            label: 'Find Jobs',
            path: '/freelancer/jobs',
            icon: HiMiniMagnifyingGlass,
          },
          {
            label: 'Projects',
            path: '/freelancer/projects',
            icon: CiFolderOn,
          },
          {
            label: 'Applications',
            path: '/freelancer/applications',
            icon: HiOutlineClipboardDocumentList,
          },
        ]

  return (
    <footer className="site-footer">
      <nav className="footer-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/client' || item.path === '/freelancer'}
              className="footer-nav-item"
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </footer>
  )
}
