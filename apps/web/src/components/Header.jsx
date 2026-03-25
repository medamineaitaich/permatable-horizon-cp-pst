import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Store', path: 'https://anfastyles.shop', external: true }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      {navLinks.map((link) => (
        link.external ? (
          <a
            key={link.name}
            href={link.path}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              mobile ? 'block py-2' : ''
            } text-foreground hover:text-primary transition-colors duration-200 font-medium`}
            onClick={() => mobile && setIsOpen(false)}
          >
            {link.name}
          </a>
        ) : (
          <Link
            key={link.name}
            to={link.path}
            className={`${
              mobile ? 'block py-2' : ''
            } ${
              isActive(link.path) ? 'text-primary font-semibold' : 'text-foreground'
            } hover:text-primary transition-colors duration-200 font-medium`}
            onClick={() => mobile && setIsOpen(false)}
          >
            {link.name}
          </Link>
        )
      ))}
      {isAuthenticated && (
        <>
          <Link
            to="/admin"
            className={`${
              mobile ? 'block py-2' : ''
            } ${
              location.pathname.startsWith('/admin') ? 'text-primary font-semibold' : 'text-foreground'
            } hover:text-primary transition-colors duration-200 font-medium`}
            onClick={() => mobile && setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              if (mobile) setIsOpen(false);
            }}
            className={mobile ? 'w-full mt-2' : ''}
          >
            Logout
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Permatable</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
