const Header = ({children}) => {
    return (
        <div className="p-8 border-b border-white/15 h-[10vh] flex justify-between items-center">
            {children}
        </div>
    );
}

export default Header;