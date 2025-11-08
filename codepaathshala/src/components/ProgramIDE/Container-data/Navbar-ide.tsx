import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBarProps } from '../../../_utils/interface';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function NavBarIde({ defaultContent,navItems, toggleMobileMenu, isMobileMenuOpenNew, setActiveTab }: NavBarProps) {

    const handleItemClick = (id: string) => {
        setActiveNavItem(id)
        setActiveTab(id);
    }
    const [activeNavItem, setActiveNavItem] = useState<any>(defaultContent);
    return <>
        <nav className="bg-gray-800 p-2 rounded-lg ">
            <div className="container mx-auto flex justify-between items-center">
                {/* Mobile Menu */}
                <div className="block md:hidden">
                    <button onClick={toggleMobileMenu} className="text-white">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>
                {/* Desktop Menu */}
                <div className="hidden md:flex md:items-center md:space-x-6">

                    {navItems.map((item:any) => (
                        <div key={item.id} className={`nav-link py-1 px-4 text-white cursor-pointer ${activeNavItem === item.id ? 'bg-gray-600 rounded' : ''}`} data-bs-toggle="pill"
                            onClick={() => handleItemClick(item.id)}
                        >
                            <FontAwesomeIcon icon={item.icon} className="mr-2" /> {item.label}
                        </div>
                    ))}
                </div>
            </div>
            {/* Mobile Menu Content */}
            <div className={`md:hidden ${isMobileMenuOpenNew ? 'block' : 'hidden'}`}>
                <div className="flex flex-row items-start overflow-y-hidden overflow-x-scroll">
                    {navItems.map((item:any) => (
                        <div key={item.id} className={`nav-link py-1 px-4 text-white cursor-pointer ${activeNavItem === item.id ? 'bg-gray-600 rounded' : ''}`} data-bs-toggle="pill"
                            onClick={() => handleItemClick(item.id)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>
        </nav>

    </>
}
export default NavBarIde;