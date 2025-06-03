const Header = ({children}) => {
    return (
        <div className="m-8">
            <h1 className="font-semibold text-xl">
            {children}
            </h1>
        </div>
    );
}

export default Header;