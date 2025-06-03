const Header = ({children}) => {
    return (
        <div className="p-8 border-b border-white/15 h-[10vh]">
            <h1 className="font-semibold text-xl">
            {children}
            </h1>
        </div>
    );
}

export default Header;