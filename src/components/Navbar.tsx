'use client'

import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="mb-4">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Spacetraders</a>
        </div>
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
          <li><Link href="/map">Map</Link></li>
          <li><Link href="/ships">Ships</Link></li>
          <li><Link href="/contracts">Contracts</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;