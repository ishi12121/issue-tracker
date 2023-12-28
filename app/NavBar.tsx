"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'
import { AiFillBug } from "react-icons/ai";
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { Box } from '@radix-ui/themes';
const NavBar = () => {
  //to get the current route we use this hook
  const currentPath = usePathname();
  const {status ,data:session} = useSession();
  const links = [
    { label: 'Dashboard', href: '/' },
    { label: 'Issues', href: '/issues/list' },
  ]
  return (
      <nav className='flex space-x-6 border-b mb-5 px-5 h-14 items-center'>
          <Link href="/"><AiFillBug/></Link>
      <ul className='flex space-x-6'>
        {
          links.map(link =>
            <li key={link.href}>
          <Link
            key={link.href}
              className={classNames({
                'text-zinc-900': link.href === currentPath,
                'text-gray-500': link.href !== currentPath,
                "hover:text-zinc-800 transition-colors": true,
              }) }
            href={link.href}>
            {link.label}
          </Link></li>
        )}            
      </ul>
      <Box>
        {status === 'authenticated' && (
          <Link href='/api/auth/signout'>Logout</Link>
        )}
        {status === 'unauthenticated' && (
          <Link href='/api/auth/signin'>Login</Link>
        )}
      </Box>
    </nav>
  )
}

export default NavBar